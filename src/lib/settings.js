const KEY = 'settings_v1';

const DEFAULT_UNHEALTHY = [
  'шоколад', 'конфет', 'печенье', 'пирожн', 'торт', 'мармелад', 'зефир',
  'chocolate', 'candy', 'cookies', 'cake', 'donut',
  'cola', 'кола', 'pepsi', 'sprite', 'fanta', 'газиров', 'soda',
  'чипс', 'chips', 'сухар', 'снек', 'snack',
  'фастфуд', 'fast food', 'burger', 'бургер', 'pizza', 'пицц', 'kfc', 'mcdonald',
  'энергетик', 'energy drink', 'red bull', 'monster',
  'сок ', ' juice',
  'мороженое', 'ice cream',
  'пиво', 'beer', 'vodka', 'водка', 'вино', 'wine', 'виски', 'whisky', 'ром ', 'rum ',
  'сигарет', 'cigarette', 'tobacco', 'табак',
  'кофе', 'coffee', 'espresso', 'латте', 'капучино'
];

const DEFAULT_HEALTHY = [
  'овощ', 'vegetable', 'помидор', 'огурец', 'морковь', 'капуст',
  'фрукт', 'fruit', 'яблок', 'банан', 'ягод',
  'куриц', 'chicken', 'рыб', 'fish', 'лосось', 'salmon', 'тунец', 'tuna',
  'греч', 'buckwheat', 'овсян', 'oat', 'киноа', 'quinoa',
  'йогурт без', 'греческий йогурт', 'творог',
  'орех', 'nuts', 'миндаль', 'almond',
  'вода ', 'water'
];

const DEFAULTS = {
  claude_api_key: '',
  health_rules: {
    unhealthy_keywords: DEFAULT_UNHEALTHY,
    healthy_keywords: DEFAULT_HEALTHY,
    custom_overrides: {}
  },
  primary_display_currency: 'original',
  default_currency_fallback: 'KGS'
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULTS),
      ...parsed,
      health_rules: {
        ...DEFAULTS.health_rules,
        ...(parsed.health_rules || {})
      }
    };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export function saveSettings(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function updateSettings(patch) {
  const s = loadSettings();
  const next = { ...s, ...patch };
  saveSettings(next);
  return next;
}

export function resetHealthRules() {
  const s = loadSettings();
  s.health_rules = structuredClone(DEFAULTS.health_rules);
  saveSettings(s);
  return s;
}
