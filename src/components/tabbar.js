const TABS = [
  { id: 'capture', href: '#/capture', label: 'Capture', icon: '📷' },
  { id: 'list', href: '#/list', label: 'List', icon: '📋' },
  { id: 'settings', href: '#/settings', label: 'Settings', icon: '⚙' }
];

export function tabBar(active) {
  const nav = document.createElement('nav');
  nav.className = 'tabbar';
  nav.innerHTML = TABS.map(t => `
    <a href="${t.href}" class="tab ${t.id === active ? 'is-active' : ''}">
      <span class="tab-icon">${t.icon}</span>
      <span class="tab-label">${t.label}</span>
    </a>
  `).join('');
  return nav;
}
