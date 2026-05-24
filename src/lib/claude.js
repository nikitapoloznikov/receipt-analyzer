import { loadSettings } from './settings.js';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_VERSION = '2023-06-01';

const CATEGORIES = [
  'groceries', 'dining', 'transport', 'utilities', 'health',
  'clothing', 'entertainment', 'tech', 'fitness', 'education',
  'travel', 'other'
];

function buildPrompt(settings) {
  const unhealthy = settings.health_rules.unhealthy_keywords.join(', ');
  const healthy = settings.health_rules.healthy_keywords.join(', ');
  return `You are a receipt-parsing assistant. Extract structured data from this receipt image.

USER HEALTH PREFERENCES:
The user considers these UNHEALTHY: ${unhealthy}
The user considers these HEALTHY: ${healthy}
Everything else is neutral.

Return ONLY a valid JSON object, no markdown, no explanation:

{
  "datetime": "ISO 8601 like 2026-05-23T14:32:00, or just YYYY-MM-DD if no time, or null",
  "merchant": "store/business name as printed",
  "merchant_address": "address if visible, else null",
  "subtotal": number or null,
  "tax": number or null,
  "total": number (required, total amount paid),
  "currency": "ISO 4217 3-letter code (KGS, RUB, USD, EUR, etc.). Infer from language/symbols/country if not explicit. Fall back to ${settings.default_currency_fallback} if truly ambiguous.",
  "payment_method": "cash | card | transfer | null",
  "category": "one of: ${CATEGORIES.join(', ')}",
  "items": [
    {
      "name": "item name as printed",
      "qty": number (default 1),
      "unit_price": number or null,
      "total_price": number,
      "health_rating": "healthy | neutral | unhealthy"
    }
  ],
  "confidence": {
    "datetime": "high | medium | low",
    "merchant": "high | medium | low",
    "total": "high | medium | low",
    "items": "high | medium | low",
    "overall": "high | medium | low"
  }
}

Rules:
- Numbers are plain numbers, no currency symbols, no thousand separators
- Use period as decimal separator
- If the image is not a receipt or is unreadable, return: {"error": "<short reason>"}
- For items, if you cannot read individual prices, set unit_price/total_price as best-guess and confidence.items = "low"
- Apply health_rating based on USER HEALTH PREFERENCES above. Match keywords loosely (case-insensitive, partial matches OK).
- For non-food categories (transport, utilities, etc.), set all items health_rating = "neutral"
- When unsure about any field, set its confidence to "low" rather than guessing confidently`;
}

async function blobToBase64(blob) {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function stripFences(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
}

function validateParsed(p) {
  if (p.error) return { ok: false, reason: p.error };
  if (typeof p.total !== 'number') return { ok: false, reason: 'missing total' };
  if (!p.merchant) return { ok: false, reason: 'missing merchant' };
  if (!p.currency) return { ok: false, reason: 'missing currency' };
  if (!Array.isArray(p.items)) p.items = [];
  if (!CATEGORIES.includes(p.category)) p.category = 'other';
  p.confidence = p.confidence || { overall: 'low' };
  return { ok: true, parsed: p };
}

export async function parseReceipt(blob, { signal } = {}) {
  const settings = loadSettings();
  if (!settings.claude_api_key) {
    throw new Error('Missing Claude API key. Open Settings to add one.');
  }
  const b64 = await blobToBase64(blob);
  const body = {
    model: MODEL,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } },
        { type: 'text', text: buildPrompt(settings) }
      ]
    }]
  };

  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        signal,
        headers: {
          'content-type': 'application/json',
          'x-api-key': settings.claude_api_key,
          'anthropic-version': ANTHROPIC_VERSION,
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify(body)
      });
      if (res.status === 401 || res.status === 403) {
        throw new Error('Invalid Claude API key (401/403). Update it in Settings.');
      }
      if (res.status === 429) {
        lastError = new Error('Rate limited (429). Backing off.');
        await new Promise(r => setTimeout(r, 10000));
        continue;
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        lastError = new Error(`Claude API ${res.status}: ${txt.slice(0, 200)}`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      const data = await res.json();
      const text = stripFences(data?.content?.[0]?.text || '');
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        return { ok: false, reason: 'non-JSON response from Claude', raw: text };
      }
      const v = validateParsed(parsed);
      return { ok: v.ok, parsed: v.parsed, reason: v.reason, raw: text };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      lastError = err;
      if (attempt < 2) await new Promise(r => setTimeout(r, 2000));
    }
  }
  return { ok: false, reason: lastError?.message || 'unknown error' };
}
