(function () {
  const CONFIG = {
    's-command-start': {
      label: 'Student Setup',
      summary: 'Enter your basic school goals once. The dashboard uses this to personalize your daily loop, weak spots, and planning shortcuts.',
      action: 'Save Plan',
      target: 'ccSaveProfile()'
    },
    's-command-progress': {
      label: 'Progress Center',
      summary: 'Read your trend lines across SAT, APUSH, vocabulary, and writing. Use the next-action card to decide what to study first.',
      action: 'Open SAT Practice',
      target: 'showSAT()'
    },
    's-command-export': {
      label: 'Export Report',
      summary: 'Create a clean report of your plan, weak subjects, daily loop, SAT progress, APUSH progress, and university planning.',
      action: 'Download Report',
      target: 'ccDownloadExport()'
    },
    's-command-review': {
      label: 'Review Mode',
      summary: 'Work from the highest-value review queue: missed questions, weak SAT skills, APUSH gaps, and vocabulary.',
      action: 'Open SAT Practice',
      target: 'showSAT()'
    },
    's-command-compare': {
      label: 'College Compare',
      summary: 'Compare schools side by side by cost, selectivity, SAT range, major strength, and personal fit.',
      action: 'Open University Search',
      target: 'openToolPage(\'s-college\',\'nav-college\')'
    }
  };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function enhanceCommandPage(page) {
    if (!page || !CONFIG[page.id]) return;
    const section = page.querySelector('.cc-feature-page');
    if (!section || section.dataset.polished === '1') return;
    const config = CONFIG[page.id];
    section.dataset.polished = '1';
    section.classList.add('cc-pro-page');
    section.insertAdjacentHTML('afterbegin',
      '<div class="cc-pro-guide">' +
        '<div><span>' + esc(config.label) + '</span><strong>What to do here</strong><p>' + esc(config.summary) + '</p></div>' +
        '<button class="cc-btn primary" type="button" onclick="' + config.target + '">' + esc(config.action) + '</button>' +
      '</div>'
    );
    section.querySelectorAll('.cc-panel').forEach((panel, index) => {
      panel.classList.add('cc-pro-panel');
      if (!panel.querySelector('.cc-panel-index')) {
        panel.insertAdjacentHTML('afterbegin', '<div class="cc-panel-index">' + String(index + 1).padStart(2, '0') + '</div>');
      }
    });
    section.querySelectorAll('.cc-row').forEach(row => row.classList.add('cc-pro-row'));
  }

  function enhanceVisibleCommandPages() {
    Object.keys(CONFIG).forEach(id => enhanceCommandPage(document.getElementById(id)));
  }

  function wrap(name) {
    const fn = window[name];
    if (typeof fn !== 'function' || fn.__ccTabsPolished) return;
    window[name] = function () {
      const result = fn.apply(this, arguments);
      setTimeout(enhanceVisibleCommandPages, 0);
      return result;
    };
    window[name].__ccTabsPolished = true;
  }

  function init() {
    ['showStartFlow', 'showProgressCenter', 'showExportCenter', 'showReviewMode', 'showCollegeCompare'].forEach(wrap);
    enhanceVisibleCommandPages();
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('load', () => setTimeout(init, 100));
  if (document.readyState !== 'loading') init();
})();
