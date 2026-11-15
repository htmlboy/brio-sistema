// Source-owned adapter for the published shell until its full source is reconciled.
// Preserve React-owned nodes and modal controls; render canonical HTML natively.
(() => {
  let contentPromise;
  const scriptUrl = new URL(document.currentScript.src);
  const contentUrl = new URL('content.html', scriptUrl);
  contentUrl.search = scriptUrl.search;
  function loadContent() {
    if (!contentPromise) contentPromise = fetch(contentUrl).then(response => {
      if (!response.ok) throw new Error('Rules content unavailable');
      return response.text();
    }).catch(error => { contentPromise = undefined; throw error; });
    return contentPromise;
  }
  async function populate(viewer) {
    viewer.textContent = 'Cargando reglas…';
    try {
      const html = await loadContent();
      if (viewer.isConnected) viewer.innerHTML = html;
    } catch {
      if (!viewer.isConnected) return;
      viewer.textContent = 'No se han podido cargar las reglas. ';
      const retry = document.createElement('button');
      retry.type = 'button'; retry.textContent = 'Reintentar';
      retry.onclick = () => populate(viewer);
      viewer.append(retry);
    }
  }
  function upgradeRules() {
    for (const host of document.querySelectorAll('.rules:not([data-canonical-rules])')) {
      const viewer = document.createElement('div');
      viewer.className = 'canonical-rules-viewer';
      host.append(viewer);
      host.dataset.canonicalRules = '2.0';
      populate(viewer);
    }
  }
  function start() {
    upgradeRules();
    new MutationObserver(upgradeRules).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'complete') requestAnimationFrame(start);
  else window.addEventListener('load', () => requestAnimationFrame(start), { once: true });
})();
