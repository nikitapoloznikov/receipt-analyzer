import { getRate, putRate } from './db.js';

function dateKey(currency, date) {
  return `${currency}_${date}`;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

export function todayIso() {
  return isoDate(new Date());
}

export function dateFromReceiptDatetime(dt) {
  if (!dt) return todayIso();
  return dt.slice(0, 10);
}

export async function usdPerUnit(currency, date) {
  if (!currency) return null;
  currency = currency.toUpperCase();
  if (currency === 'USD') return 1;
  date = date || todayIso();
  const key = dateKey(currency, date);
  const cached = await getRate(key);
  if (cached) return cached.usd_per_unit;

  try {
    const res = await fetch(`https://api.frankfurter.app/${date}?from=${currency}&to=USD`);
    if (!res.ok) return null;
    const data = await res.json();
    const rate = data?.rates?.USD;
    if (typeof rate !== 'number') return null;
    await putRate({ key, usd_per_unit: rate, fetched_at: Date.now() });
    return rate;
  } catch {
    return null;
  }
}

export async function convertToUsd(amount, currency, date) {
  const rate = await usdPerUnit(currency, date);
  if (rate == null) return { total_usd: null, usd_per_unit: null, date };
  return { total_usd: amount * rate, usd_per_unit: rate, date };
}
