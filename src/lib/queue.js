import { parseReceipt } from './claude.js';
import { getPhoto, getReceipt, putReceipt } from './db.js';
import { saveReceiptWithConversion } from './receipt.js';

const MAX_CONCURRENT = 3;

function lc(v) { return String(v || '').toLowerCase(); }

function shouldAutoSave(r) {
  if (r.status !== 'parsed') return false;
  if (!r.merchant || !r.currency) return false;
  if (!(r.total > 0)) return false;
  const c = r.confidence || {};
  if (lc(c.overall) === 'low') return false;
  if (lc(c.merchant) === 'low') return false;
  if (lc(c.total) === 'low') return false;
  return true;
}

let pending = [];
let active = 0;
const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach(fn => fn({ active, pendingCount: pending.length }));
}

export function enqueue(receiptId) {
  if (pending.includes(receiptId)) return;
  pending.push(receiptId);
  emit();
  pump();
}

async function pump() {
  while (active < MAX_CONCURRENT && pending.length) {
    const id = pending.shift();
    active++;
    emit();
    process(id).finally(() => {
      active--;
      emit();
      pump();
    });
  }
}

async function process(id) {
  const receipt = await getReceipt(id);
  if (!receipt || receipt.deleted) return;
  const photo = await getPhoto(receipt.photo_blob_id);
  if (!photo) {
    receipt.status = 'parse_failed';
    receipt.parse_error = 'Photo missing';
    await putReceipt(receipt);
    return;
  }
  const result = await parseReceipt(photo.blob);
  const updated = await getReceipt(id);
  if (!updated || updated.deleted) return;

  if (!result.ok) {
    updated.status = 'parse_failed';
    updated.parse_error = result.reason || 'Parse failed';
    updated.raw_claude_response = result.raw || null;
    await putReceipt(updated);
    return;
  }

  const p = result.parsed;
  Object.assign(updated, {
    status: 'parsed',
    datetime: p.datetime || null,
    merchant: p.merchant,
    merchant_address: p.merchant_address || null,
    subtotal: p.subtotal ?? null,
    tax: p.tax ?? null,
    total: p.total,
    currency: (p.currency || 'USD').toUpperCase(),
    payment_method: p.payment_method || null,
    category: p.category,
    items: (p.items || []).map(it => ({
      id: crypto.randomUUID(),
      name: it.name,
      qty: it.qty ?? 1,
      unit_price: it.unit_price ?? null,
      total_price: it.total_price,
      health_rating: it.health_rating || 'neutral',
      health_rating_user_override: false
    })),
    confidence: p.confidence,
    raw_claude_response: result.raw,
    parse_error: null
  });
  await putReceipt(updated);

  if (shouldAutoSave(updated)) {
    try {
      await saveReceiptWithConversion(updated);
    } catch (err) {
      console.warn('Auto-save failed, leaving in queue for review:', err);
    }
  }
}

export function snapshot() {
  return { active, pendingCount: pending.length };
}
