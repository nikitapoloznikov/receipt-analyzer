import { getReceipt, getPhoto, putReceipt, deleteReceipt } from '../lib/db.js';
import { saveReceiptWithConversion } from '../lib/receipt.js';
import { convertToUsd, dateFromReceiptDatetime } from '../lib/currency.js';
import { blobUrl } from '../lib/photo.js';
import { nextRating, ratingEmoji } from '../lib/health.js';
import { enqueue } from '../lib/queue.js';
import { navigate } from '../router.js';

const CATEGORIES = [
  'groceries', 'dining', 'transport', 'utilities', 'health',
  'clothing', 'entertainment', 'tech', 'fitness', 'education',
  'travel', 'other'
];

export async function renderPreview(root, id) {
  const receipt = await getReceipt(id);
  if (!receipt) {
    root.innerHTML = `<div class="empty">Receipt not found. <a href="#/list">Back to list</a></div>`;
    return;
  }
  const photo = await getPhoto(receipt.photo_blob_id);
  const photoUrl = photo ? blobUrl(photo.blob) : null;

  let state = structuredClone(receipt);
  let livePreviewUsd = state.total_usd;

  root.innerHTML = `
    <header class="topbar topbar--with-back">
      <a class="iconbtn" href="#/capture" aria-label="Back">←</a>
      <h1>${state.status === 'saved' ? 'Receipt' : 'Review'}</h1>
      <button class="iconbtn" id="del-btn" aria-label="Delete">🗑</button>
    </header>

    ${state.status === 'parsing' ? `<div class="banner">Parsing… this may take a few seconds.</div>` : ''}
    ${state.status === 'parse_failed' ? `
      <div class="banner banner--warn">
        Parse failed: ${state.parse_error || 'unknown'}.
        <button class="linkbtn" id="retry-btn">Retry parse</button>
      </div>
    ` : ''}

    ${photoUrl ? `
      <div class="photo-wrap">
        <img src="${photoUrl}" alt="receipt">
      </div>
    ` : ''}

    <section class="fields">
      <div class="field ${confClass(state, 'datetime')}">
        <label>📅 Date & time</label>
        <input id="f-datetime" type="text" placeholder="YYYY-MM-DD or 2026-05-23T14:32" value="${attr(state.datetime)}">
      </div>
      <div class="field ${confClass(state, 'merchant')}">
        <label>🏬 Merchant</label>
        <input id="f-merchant" type="text" value="${attr(state.merchant)}">
      </div>
      <div class="field">
        <label>📍 Address</label>
        <input id="f-address" type="text" value="${attr(state.merchant_address)}">
      </div>
      <div class="field">
        <label>📂 Category</label>
        <select id="f-category">
          ${CATEGORIES.map(c => `<option value="${c}" ${c === state.category ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="field-row">
        <div class="field">
          <label>💱 Currency</label>
          <input id="f-currency" type="text" maxlength="3" value="${attr(state.currency)}">
        </div>
        <div class="field">
          <label>💳 Payment</label>
          <select id="f-payment">
            <option value="">—</option>
            <option value="cash" ${state.payment_method === 'cash' ? 'selected' : ''}>cash</option>
            <option value="card" ${state.payment_method === 'card' ? 'selected' : ''}>card</option>
            <option value="transfer" ${state.payment_method === 'transfer' ? 'selected' : ''}>transfer</option>
          </select>
        </div>
      </div>
    </section>

    <section class="items">
      <h2 class="section-title">Items</h2>
      <ul id="items-list" class="items-list"></ul>
      <button class="linkbtn" id="add-item">⊕ Add item</button>
    </section>

    <section class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <input id="f-subtotal" class="num" type="number" step="0.01" value="${state.subtotal ?? ''}">
        <span class="cur">${state.currency || ''}</span>
      </div>
      <div class="totals-row">
        <span>Tax</span>
        <input id="f-tax" class="num" type="number" step="0.01" value="${state.tax ?? ''}">
        <span class="cur">${state.currency || ''}</span>
      </div>
      <div class="totals-row totals-row--total">
        <span>Total</span>
        <input id="f-total" class="num" type="number" step="0.01" value="${state.total ?? ''}">
        <span class="cur">${state.currency || ''}</span>
      </div>
      <div class="totals-row totals-row--usd muted">
        <span>≈</span>
        <span id="usd-preview">${formatUsd(livePreviewUsd)}</span>
      </div>
    </section>

    <section class="field">
      <label>📝 Notes</label>
      <textarea id="f-notes" rows="2">${attr(state.notes)}</textarea>
    </section>

    <div class="actions">
      <button class="btn btn--ghost" id="discard-btn">Discard</button>
      <button class="btn btn--primary" id="save-btn" ${state.status === 'parsing' ? 'disabled' : ''}>
        ${state.status === 'saved' ? 'Update' : 'Save'}
      </button>
    </div>
  `;

  const itemsList = root.querySelector('#items-list');
  renderItems();

  function renderItems() {
    itemsList.innerHTML = '';
    state.items.forEach((it, idx) => {
      const li = document.createElement('li');
      li.className = 'item';
      li.innerHTML = `
        <div class="item-main">
          <input class="item-name" value="${attr(it.name)}">
          <input class="item-total num" type="number" step="0.01" value="${it.total_price ?? ''}">
        </div>
        <div class="item-meta">
          <label>×<input class="item-qty num" type="number" step="1" min="0" value="${it.qty ?? 1}"></label>
          <label>unit <input class="item-unit num" type="number" step="0.01" value="${it.unit_price ?? ''}"></label>
          <button class="health-pill health-pill--${it.health_rating}" data-idx="${idx}">${ratingEmoji(it.health_rating)} ${it.health_rating}</button>
          <button class="item-del" data-idx="${idx}" aria-label="Remove">✕</button>
        </div>
      `;
      li.querySelector('.item-name').addEventListener('input', e => { it.name = e.target.value; });
      li.querySelector('.item-total').addEventListener('input', e => { it.total_price = num(e.target.value); });
      li.querySelector('.item-qty').addEventListener('input', e => { it.qty = num(e.target.value) ?? 1; });
      li.querySelector('.item-unit').addEventListener('input', e => { it.unit_price = num(e.target.value); });
      li.querySelector('.health-pill').addEventListener('click', () => {
        it.health_rating = nextRating(it.health_rating);
        it.health_rating_user_override = true;
        renderItems();
      });
      li.querySelector('.item-del').addEventListener('click', () => {
        state.items.splice(idx, 1);
        renderItems();
      });
      itemsList.appendChild(li);
    });
  }

  root.querySelector('#add-item').addEventListener('click', () => {
    state.items.push({
      id: crypto.randomUUID(),
      name: '',
      qty: 1,
      unit_price: null,
      total_price: 0,
      health_rating: 'neutral',
      health_rating_user_override: true
    });
    renderItems();
  });

  bindField('#f-datetime', v => { state.datetime = v || null; refreshUsdPreview(); });
  bindField('#f-merchant', v => { state.merchant = v; });
  bindField('#f-address', v => { state.merchant_address = v || null; });
  bindField('#f-category', v => { state.category = v; });
  bindField('#f-currency', v => {
    state.currency = v.toUpperCase();
    root.querySelectorAll('.cur').forEach(el => el.textContent = state.currency);
    refreshUsdPreview();
  });
  bindField('#f-payment', v => { state.payment_method = v || null; });
  bindField('#f-subtotal', v => { state.subtotal = num(v); });
  bindField('#f-tax', v => { state.tax = num(v); });
  bindField('#f-total', v => { state.total = num(v) ?? 0; refreshUsdPreview(); });
  bindField('#f-notes', v => { state.notes = v || null; });

  let usdToken = 0;
  async function refreshUsdPreview() {
    const t = ++usdToken;
    const el = root.querySelector('#usd-preview');
    el.textContent = '…';
    const date = dateFromReceiptDatetime(state.datetime);
    const { total_usd } = await convertToUsd(state.total, state.currency, date);
    if (t !== usdToken) return;
    el.textContent = formatUsd(total_usd);
  }

  root.querySelector('#del-btn').addEventListener('click', async () => {
    if (!confirm('Delete this receipt?')) return;
    await deleteReceipt(state.id);
    navigate('#/capture');
  });

  root.querySelector('#discard-btn').addEventListener('click', () => navigate('#/capture'));

  root.querySelector('#save-btn').addEventListener('click', async () => {
    state.user_edited = true;
    await saveReceiptWithConversion(state);
    navigate(state.status === 'saved' ? '#/list' : '#/capture');
  });

  const retryBtn = root.querySelector('#retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', async () => {
      state.status = 'parsing';
      state.parse_error = null;
      await putReceipt(state);
      enqueue(state.id);
      navigate('#/capture');
    });
  }

  function bindField(sel, fn) {
    const el = root.querySelector(sel);
    if (!el) return;
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, e => fn(e.target.value));
  }

  return () => { if (photoUrl) URL.revokeObjectURL(photoUrl); };
}

function attr(v) {
  if (v == null) return '';
  return String(v).replace(/"/g, '&quot;');
}

function num(v) {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function confClass(state, field) {
  const c = state.confidence?.[field];
  return c === 'low' ? 'is-low-conf' : '';
}

function formatUsd(v) {
  if (v == null) return '$—';
  return '$' + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
