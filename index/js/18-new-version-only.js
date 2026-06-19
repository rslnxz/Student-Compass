(function () {
  function renderNewHomeOnly() {
    var landing = document.getElementById('s-landing');
    if (!landing) return;
    landing.classList.remove('sc-overhaul');
    landing.dataset.scOverhauled = '';
    if (typeof window.scCommandCenterRenderHome === 'function') {
      window.scCommandCenterRenderHome();
    }
    document.body.classList.add('cc-reference-mode');
    if (landing.classList.contains('on')) {
      document.body.setAttribute('data-current-page', 's-landing');
    }
  }

  document.addEventListener('DOMContentLoaded', renderNewHomeOnly);
  window.addEventListener('load', function () {
    renderNewHomeOnly();
    setTimeout(renderNewHomeOnly, 250);
  });

  if (document.readyState !== 'loading') renderNewHomeOnly();
})();
