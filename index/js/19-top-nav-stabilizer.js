(function () {
  const navMap = [
    ['top-nav-home', /nav-landing/],
    ['top-nav-sat', /nav-sat|nav-pt|nav-drills|nav-fc/],
    ['top-nav-apush', /nav-quiz|nav-timeline|nav-writing/],
    ['top-nav-home', /^(s-landing|landing|home)$/],
    ['top-nav-sat', /sat|pt|drills|fc/],
    ['top-nav-apush', /quiz|apush|start|timeline|writing|dbq|saq|leq/],
    ['top-nav-gpa', /gpa/],
    ['top-nav-college', /college|fit|universit/],
    ['top-nav-school', /school/],
    ['top-nav-profile', /profile|ach|progress|mistake|export/]
  ];

  function pageKeyFromDom() {
    const current = document.body.getAttribute('data-current-page');
    if (current) return current;
    const visible = document.querySelector('.sec.on, #tool-page-root.on');
    return visible ? visible.id : 's-landing';
  }

  function syncTopNav(key) {
    const value = String(key || pageKeyFromDom());
    let picked = 'top-nav-home';
    navMap.forEach(([id, rx]) => {
      if (rx.test(value)) picked = id;
    });
    document.querySelectorAll('.top-nav-link').forEach(btn => {
      btn.classList.toggle('active', btn.id === picked);
      btn.setAttribute('aria-current', btn.id === picked ? 'page' : 'false');
    });
  }

  function syncFromTopButton(btn) {
    if (!btn || !btn.id) return;
    document.querySelectorAll('.top-nav-link').forEach(item => {
      const active = item.id === btn.id;
      item.classList.toggle('active', active);
      item.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  const originalSetNav = window.setNav;
  if (typeof originalSetNav === 'function' && !originalSetNav.__topNavStable) {
    window.setNav = function (id) {
      const result = originalSetNav.apply(this, arguments);
      syncTopNav(id);
      return result;
    };
    window.setNav.__topNavStable = true;
  }

  window.syncTopMainNav = syncTopNav;
  document.addEventListener('click', event => {
    const topButton = event.target.closest('.top-nav-link');
    if (topButton) {
      syncFromTopButton(topButton);
      setTimeout(() => syncFromTopButton(topButton), 0);
      return;
    }
    if (event.target.closest('.top-nav-link,.drawer-btn,.cc-btn,.bc-btn,.btn,.btn-outline')) {
      setTimeout(() => syncTopNav(), 0);
    }
  });
  document.addEventListener('DOMContentLoaded', () => syncTopNav());
  window.addEventListener('load', () => {
    syncTopNav();
    setTimeout(() => syncTopNav(), 250);
  });
  if (document.readyState !== 'loading') syncTopNav();
})();
