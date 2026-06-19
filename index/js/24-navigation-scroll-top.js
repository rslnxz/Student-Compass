(function () {
  const NAV_FUNCTIONS = [
    'show',
    'openToolPage',
    'goHome',
    'showSAT',
    'showPurpose',
    'showFeedback',
    'showAchievements',
    'showProfile',
    'showTimeline',
    'showStartFlow',
    'showProgressCenter',
    'showSkillMastery',
    'showReviewMode',
    'showExportCenter',
    'showCollegeCompare',
    'reviewPracticeExam',
    'resumePracticeExam',
    'startPracticeTest'
  ];

  function scrollTopNow() {
    const roots = [window, document.documentElement, document.body, document.getElementById('app'), document.getElementById('tool-page-root')].filter(Boolean);
    roots.forEach(root => {
      try {
        if (root === window) root.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        else {
          root.scrollTop = 0;
          root.scrollLeft = 0;
        }
      } catch (_) {}
    });
  }

  function patch(name) {
    const fn = window[name];
    if (typeof fn !== 'function' || fn.__scrollTopPatched) return;
    window[name] = function () {
      const result = fn.apply(this, arguments);
      scrollTopNow();
      requestAnimationFrame(scrollTopNow);
      setTimeout(scrollTopNow, 80);
      return result;
    };
    window[name].__scrollTopPatched = true;
  }

  function patchAll() {
    NAV_FUNCTIONS.forEach(patch);
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('button,a,[onclick],[data-command-index],[data-review-exam],[data-resume-exam]');
    if (!target) return;
    setTimeout(() => {
      const current = document.body.getAttribute('data-current-page') || '';
      if (current || document.querySelector('.sec.on')) scrollTopNow();
    }, 90);
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchAll);
  else patchAll();
  window.addEventListener('load', () => setTimeout(patchAll, 200));
  window.scScrollTopNow = scrollTopNow;
})();
