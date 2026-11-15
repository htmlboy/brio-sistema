// Source-owned adapter for the published shell until its full source is reconciled.
// Keep React's existing modal, controls and children intact; mount the shared viewer
// alongside its static legacy content. The matching stylesheet hides that snapshot.
(() => {
  const rulesUrl = 'https://sistema.briorol.com/reglas/2.0/';
  function upgradeRules() {
    for (const host of document.querySelectorAll('.rules:not([data-canonical-rules])')) {
      if (host.querySelector('iframe[src^="' + rulesUrl + '"]')) continue;
      const viewer = document.createElement('div');
      viewer.className = 'canonical-rules-viewer';
      const link = document.createElement('a');
      link.href = rulesUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Abrir las reglas Brío 2.0 en Sistema';
      const note = document.createElement('p');
      note.className = 'canonical-rules-note';
      note.textContent = 'Las mecánicas de Dados en Online todavía están pendientes de adaptación a 2.0.';
      const frame = document.createElement('iframe');
      frame.src = rulesUrl + '?embed=1';
      frame.title = 'Reglas rápidas de Brío 2.0';
      frame.referrerPolicy = 'no-referrer';
      viewer.append(link, note, frame);
      host.append(viewer);
      host.dataset.canonicalRules = '2.0';
    }
  }
  function start() {
    upgradeRules();
    const observer = new MutationObserver(upgradeRules);
    observer.observe(document.body, { childList: true, subtree: true });
  }
  // Let the existing SSR shell finish hydration before adding the viewer.
  if (document.readyState === 'complete') requestAnimationFrame(start);
  else window.addEventListener('load', () => requestAnimationFrame(start), { once: true });
})();
