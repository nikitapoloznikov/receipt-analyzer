import { loadSettings, saveSettings, resetHealthRules } from '../lib/settings.js';
import { allReceipts, storageEstimate } from '../lib/db.js';
import { receiptsToCsv, downloadCsv } from '../lib/csv.js';

export async function renderSettings(root) {
  const s = loadSettings();
  const est = await storageEstimate();
  const usageMb = est ? (est.usage / 1024 / 1024).toFixed(1) : '?';
  const quotaMb = est ? (est.quota / 1024 / 1024).toFixed(0) : '?';
  const count = (await allReceipts()).length;

  root.innerHTML = `
    <header class="topbar"><h1>Settings</h1></header>

    <section class="card">
      <h2>Claude API</h2>
      <label class="field">
        <span>API key</span>
        <input id="api-key" type="password" placeholder="sk-ant-…" value="${attr(s.claude_api_key)}">
      </label>
      <p class="muted small">Stored locally in your browser. Never sent anywhere except api.anthropic.com.</p>
    </section>

    <section class="card">
      <h2>Health rules</h2>
      <label class="field">
        <span>Unhealthy keywords (comma-separated)</span>
        <textarea id="unhealthy" rows="4">${attr(s.health_rules.unhealthy_keywords.join(', '))}</textarea>
      </label>
      <label class="field">
        <span>Healthy keywords (comma-separated)</span>
        <textarea id="healthy" rows="4">${attr(s.health_rules.healthy_keywords.join(', '))}</textarea>
      </label>
      <button class="btn btn--ghost" id="reset-health">Reset to defaults</button>
    </section>

    <section class="card">
      <h2>Currency</h2>
      <label class="field">
        <span>Default currency when ambiguous</span>
        <input id="fallback-cur" type="text" maxlength="3" value="${attr(s.default_currency_fallback)}">
      </label>
      <label class="field">
        <span>Display</span>
        <select id="display-cur">
          <option value="original" ${s.primary_display_currency === 'original' ? 'selected' : ''}>Original</option>
          <option value="USD" ${s.primary_display_currency === 'USD' ? 'selected' : ''}>USD</option>
        </select>
      </label>
    </section>

    <section class="card">
      <h2>Data</h2>
      <p class="muted small">${count} receipts · ${usageMb} MB used of ~${quotaMb} MB available</p>
      <div class="actions">
        <button class="btn btn--ghost" id="export-all">Export all CSV</button>
        <button class="btn btn--danger" id="wipe">Wipe local data</button>
      </div>
    </section>

    <section class="card">
      <h2>About</h2>
      <p class="muted small">Receipt Analyzer v1.0 — local-only build. Google Sheets sync coming in v1.1.</p>
    </section>

    <div class="actions actions--sticky">
      <button class="btn btn--primary" id="save-btn">Save changes</button>
    </div>
  `;

  root.querySelector('#reset-health').addEventListener('click', () => {
    if (!confirm('Reset health keywords to defaults?')) return;
    resetHealthRules();
    renderSettings(root);
  });

  root.querySelector('#export-all').addEventListener('click', async () => {
    const all = (await allReceipts()).filter(r => r.status === 'saved');
    const csv = receiptsToCsv(all);
    downloadCsv(`receipts-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  });

  root.querySelector('#wipe').addEventListener('click', async () => {
    if (!confirm('Delete ALL local receipts and photos? This cannot be undone.')) return;
    if (!confirm('Really wipe everything?')) return;
    const dbs = await indexedDB.databases?.() || [];
    for (const d of dbs) if (d.name) indexedDB.deleteDatabase(d.name);
    localStorage.removeItem('settings_v1');
    location.reload();
  });

  root.querySelector('#save-btn').addEventListener('click', () => {
    const next = {
      ...s,
      claude_api_key: root.querySelector('#api-key').value.trim(),
      default_currency_fallback: root.querySelector('#fallback-cur').value.trim().toUpperCase() || 'USD',
      primary_display_currency: root.querySelector('#display-cur').value,
      health_rules: {
        ...s.health_rules,
        unhealthy_keywords: parseList(root.querySelector('#unhealthy').value),
        healthy_keywords: parseList(root.querySelector('#healthy').value)
      }
    };
    saveSettings(next);
    flashSaved(root.querySelector('#save-btn'));
  });
}

function parseList(text) {
  return text.split(',').map(s => s.trim()).filter(Boolean);
}

function attr(v) {
  if (v == null) return '';
  return String(v).replace(/"/g, '&quot;');
}

function flashSaved(btn) {
  const orig = btn.textContent;
  btn.textContent = 'Saved ✓';
  btn.disabled = true;
  setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1200);
}
