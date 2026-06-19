(function () {
  function stabilizeMenuButton() {
    var btn = document.getElementById('hamburger-btn');
    if (!btn) return;
    btn.classList.add('menu-visible-icon');
    btn.setAttribute('aria-label', btn.classList.contains('open') ? 'Close menu' : 'Menu');
  }

  document.addEventListener('DOMContentLoaded', stabilizeMenuButton);
  window.addEventListener('load', function () {
    stabilizeMenuButton();
    setTimeout(stabilizeMenuButton, 100);
  });

  if (document.readyState !== 'loading') stabilizeMenuButton();
})();
