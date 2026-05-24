import { openDB } from 'idb';

export const DB_NAME = 'receipt_analyzer';
export const DB_VERSION = 1;

let dbPromise = null;

export function db() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(d, oldVersion) {
        if (oldVersion < 1) {
          const receipts = d.createObjectStore('receipts', { keyPath: 'id' });
          receipts.createIndex('datetime', 'datetime');
          receipts.createIndex('merchant', 'merchant');
          receipts.createIndex('category', 'category');
          receipts.createIndex('status', 'status');
          receipts.createIndex('deleted', 'deleted');

          d.createObjectStore('photos', { keyPath: 'id' });
          d.createObjectStore('exchange_rates', { keyPath: 'key' });
        }
      }
    });
  }
  return dbPromise;
}

export function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export async function putReceipt(r) {
  const d = await db();
  await d.put('receipts', r);
  return r;
}

export async function getReceipt(id) {
  return (await db()).get('receipts', id);
}

export async function deleteReceipt(id) {
  const d = await db();
  const r = await d.get('receipts', id);
  if (!r) return;
  r.deleted = true;
  await d.put('receipts', r);
  if (r.photo_blob_id) await d.delete('photos', r.photo_blob_id);
}

export async function allReceipts({ includeDeleted = false } = {}) {
  const all = await (await db()).getAll('receipts');
  return includeDeleted ? all : all.filter(r => !r.deleted);
}

export async function putPhoto(photo) {
  await (await db()).put('photos', photo);
  return photo;
}

export async function getPhoto(id) {
  return (await db()).get('photos', id);
}

export async function getRate(key) {
  return (await db()).get('exchange_rates', key);
}

export async function putRate(rate) {
  await (await db()).put('exchange_rates', rate);
  return rate;
}

export async function storageEstimate() {
  if (!navigator.storage?.estimate) return null;
  return navigator.storage.estimate();
}
