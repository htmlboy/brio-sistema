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
