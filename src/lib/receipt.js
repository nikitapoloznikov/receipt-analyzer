import { putReceipt, uuid } from './db.js';
import { convertToUsd, dateFromReceiptDatetime } from './currency.js';

export function newReceipt({ photo_blob_id }) {
  return {
    id: uuid(),
    createdAt: Date.now(),
    datetime: null,
    merchant: '',
    merchant_address: null,
    subtotal: null,
    tax: null,
    total: 0,
    currency: '',
    total_usd: null,
    usd_per_unit: null,
    usd_per_unit_date: null,
    payment_method: null,
    category: 'other',
    status: 'parsing',
    items: [],
    photo_blob_id,
    photo_phash: null,
    drive_file_id: null,
    confidence: { overall: 'low' },
    raw_claude_response: null,
    sheets_synced: false,
    sheets_synced_at: null,
    deleted: false,
    user_edited: false,
    notes: null,
    parse_error: null
  };
}

export async function saveReceiptWithConversion(receipt) {
  const date = dateFromReceiptDatetime(receipt.datetime);
  const { total_usd, usd_per_unit } = await convertToUsd(receipt.total, receipt.currency, date);
  receipt.total_usd = total_usd;
  receipt.usd_per_unit = usd_per_unit;
  receipt.usd_per_unit_date = date;
  receipt.status = 'saved';
  await putReceipt(receipt);
  return receipt;
}

export function recomputeTotals(receipt) {
  if (!receipt.items?.length) return receipt;
  return receipt;
}
