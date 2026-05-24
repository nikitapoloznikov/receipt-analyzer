import { allReceipts } from '../lib/db.js';
import { receiptsToCsv, downloadCsv } from '../lib/csv.js';
import { healthSummary } from '../lib/health.js';

const CATEGORIES = [
  '', 'groceries', 'dining', 'transport', 'utilities', 'health',
  'clothing', 'entertainment', 'tech', 'fitness', 'education',
  'travel', 'other'
];

const DATE_RANGES = [
  { id: 'all', label: 'All time', days: null },
  { id: '7d', label: 'Last 7d', days: 7 },
  { id: '30d', label: 'Last 30d', days: 30 },
  { id: '90d', label: 'Last 90d', days: 90 }
];

export async function renderList(root) {
  let receipts = (await allReceipts()).filter(r => r.status === 'saved');
  let filter = { category: '', range: 'all', search: '' };

  root.innerHTML = `
    <header class="topbar">
      <h1>Receipts</h1>
      <button class="iconbtn" id="export-btn" aria-label="Export CSV">⇩</button>
    </header>
    <div class="filters">
      <select id="filter-cat">
        ${CATEGORIES.map(c => `<option value="${c}">${c || 'All categories'}</option>`).join('')}
      </select>
      <select id="filter-range">
        ${DATE_RANGES.map(r => `<option value="${r.id}">${r.label}</option>`).join('')}
      </select>
      <input id="filter-search" type="search" placeholder="Search merchant or item">
    </div>
    <div class="list-summary" id="list-summary"></div>
    <ul id="list-rows" class="list-rows"></ul>
    <div class="empty hidden" id="empty">No receipts match these filters.</div>
  `;

  const catSel = root.querySelector('#filter-cat');
  const rangeSel = root.querySelector('#filter-range');
  const searchInput = root.querySelector('#filter-search');
  const rows = root.querySelector('#list-rows');
  const empty = root.querySelector('#empty');
  const summary = root.querySelector('#list-summary');

  catSel.addEventListener('change', () => { filter.category = catSel.value; render(); });
  rangeSel.addEventListener('change', () => { filter.range = rangeSel.value; render(); });
  searchInput.addEventListener('input', () => { filter.search = searchInput.value.trim().toLowerCase(); render(); });

  root.querySelector('#export-btn').addEventListener('click', () => {
    const csv = receiptsToCsv(receipts);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`receipts-${date}.csv`, csv);
  });

  function render() {
    const filtered = applyFilters(receipts, filter);
    rows.innerHTML = '';
    if (!filtered.length) {
      empty.classList.remove('hidden');
      summary.textContent = '';
      return;
    }
    empty.classList.add('hidden');

    const totalUsd = filtered.reduce((s, r) => s + (r.total_usd || 0), 0);
    summary.textContent = `${filtered.length} receipts · ≈ $${totalUsd.toFixed(2)}`;

    const grouped = groupByDate(filtered);
    for (const [date, list] of grouped) {
      const dayHeader = document.createElement('li');
      dayHeader.className = 'list-day';
      dayHeader.textContent = date;
      rows.appendChild(dayHeader);
      for (const r of list) rows.appendChild(rowEl(r));
    }
  }

  function rowEl(r) {
    const li = document.createElement('li');
    li.className = 'list-row';
    const h = healthSummary(r.items);
    const usd = r.total_usd != null ? `$${r.total_usd.toFixed(2)}` : '$—';
    li.innerHTML = `
      <a class="list-link" href="#/receipt/${r.id}">
        <div class="list-row-main">
          <span class="list-merchant">${escapeHtml(r.merchant)}</span>
          <span class="list-amount">${formatAmount(r.total)} ${r.currency}</span>
        </div>
        <div class="list-row-meta muted small">
          <span>${formatTime(r.datetime)} · ${r.category}</span>
          <span>${r.items?.length || 0} items · 🔴${h.unhealthy} 🟡${h.neutral} 🟢${h.healthy} · ${usd}</span>
        </div>
      </a>
    `;
    return li;
  }

  render();
}

function applyFilters(receipts, f) {
  const now = Date.now();
  const range = DATE_RANGES.find(r => r.id === f.range);
  const cutoff = range?.days ? now - range.days * 86400000 : null;
  return receipts
    .filter(r => !f.category || r.category === f.category)
    .filter(r => {
      if (!cutoff) return true;
      const dt = r.datetime ? Date.parse(r.datetime) : r.createdAt;
      return dt >= cutoff;
    })
    .filter(r => {
      if (!f.search) return true;
      const hay = (r.merchant + ' ' + (r.items?.map(i => i.name).join(' ') || '')).toLowerCase();
      return hay.includes(f.search);
    })
    .sort((a, b) => {
      const da = a.datetime ? Date.parse(a.datetime) : a.createdAt;
      const db = b.datetime ? Date.parse(b.datetime) : b.createdAt;
      return db - da;
    });
}

function groupByDate(list) {
  const map = new Map();
  for (const r of list) {
    const key = (r.datetime || new Date(r.createdAt).toISOString()).slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  }
  return Array.from(map.entries());
}

function formatTime(dt) {
  if (!dt) return '';
  const m = dt.match(/T(\d{2}:\d{2})/);
  return m ? m[1] : '';
}

function formatAmount(n) {
  if (n == null) return '';
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
