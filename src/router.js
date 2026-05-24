import { renderCapture } from './screens/capture.js';
import { renderList } from './screens/list.js';
import { renderPreview } from './screens/preview.js';
import { renderSettings } from './screens/settings.js';
import { tabBar } from './components/tabbar.js';

const routes = [
  { match: /^#?\/?$/, render: renderCapture, tab: 'capture' },
  { match: /^#?\/capture$/, render: renderCapture, tab: 'capture' },
  { match: /^#?\/list$/, render: renderList, tab: 'list' },
  { match: /^#?\/settings$/, render: renderSettings, tab: 'settings' },
  { match: /^#?\/receipt\/([\w-]+)$/, render: renderPreview, tab: null }
];

let root;
let currentDispose = null;

function resolve(hash) {
  for (const r of routes) {
    const m = hash.match(r.match);
    if (m) return { route: r, params: m.slice(1) };
  }
  return { route: routes[0], params: [] };
}

async function rerender() {
  if (currentDispose) {
    try { currentDispose(); } catch {}
    currentDispose = null;
  }
  root.innerHTML = '';
  const main = document.createElement('main');
  main.className = 'screen';
  root.appendChild(main);

  const { route, params } = resolve(location.hash || '#/');
  const result = await route.render(main, ...params);
  if (typeof result === 'function') currentDispose = result;

  if (route.tab) root.appendChild(tabBar(route.tab));
}

export function navigate(hash) {
  if (location.hash === hash) {
    rerender();
  } else {
    location.hash = hash;
  }
}

export function mountRouter(el) {
  root = el;
  window.addEventListener('hashchange', rerender);
  rerender();
}
