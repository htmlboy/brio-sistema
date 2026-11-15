// Bridge the existing Sistema shell until its React source is reconciled.
document.addEventListener('click', event => {
  if (!(event.target instanceof Element) || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href]');
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || !/^\/reglas\/?$/.test(url.pathname)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  location.assign('/reglas/' + url.search + url.hash);
}, true);

// Native navigation for the generated home/materials shells.
document.documentElement.classList.add('js-enabled');
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');
if (toggle && menu) toggle.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!expanded));
  menu.classList.toggle('active', !expanded);
});
