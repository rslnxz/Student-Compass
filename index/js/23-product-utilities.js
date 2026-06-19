(function () {
  const SETTINGS_KEY = 'sc_product_settings_v1';
  const APP_STATE_KEY = 'studentCompassState';
  const CC_KEY = 'scCommandCenter2026';
  const REVIEW_FILTER_KEY = 'sc_review_filter_v1';
  const DASHBOARD_ITEMS = [
    { key: 'continue', label: 'Continue card', selector: '.sc-continue-card' },
    { key: 'loop', label: 'Today study loop', selector: '.cc-loop' },
    { key: 'sat', label: 'SAT score card', match: 'SAT score range' },
    { key: 'apush', label: 'APUSH progress card', match: 'APUSH progress' },
    { key: 'gpa', label: 'GPA card', match: 'GPA (UW)' },
    { key: 'university', label: 'University list', match: 'University list' },
    { key: 'weak', label: 'Weak spots row', selector: '.cc-weak-row' }
  ];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function readJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '');
      return value || fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function settings() {
    const current = readJSON(SETTINGS_KEY, {});
    current.fontSize = current.fontSize || 'normal';
    current.compact = !!current.compact;
    current.reduceMotion = !!current.reduceMotion;
    current.dashboard = current.dashboard || {};
    DASHBOARD_ITEMS.forEach(item => {
      if (current.dashboard[item.key] == null) current.dashboard[item.key] = true;
    });
    return current;
  }

  function saveSettings(next) {
    const merged = Object.assign(settings(), next || {});
    writeJSON(SETTINGS_KEY, merged);
    applySettings();
    return merged;
  }

  function dashboardNodes(item) {
    const root = document.querySelector('.cc-dashboard');
    if (!root) return [];
    if (item.selector) return Array.from(root.querySelectorAll(item.selector));
    return Array.from(root.querySelectorAll('.cc-panel')).filter(panel => (panel.textContent || '').includes(item.match));
  }

  function applySettings() {
    const s = settings();
    document.body.classList.toggle('sc-compact-ui', s.compact);
    document.body.classList.toggle('sc-reduce-motion', s.reduceMotion);
    document.body.setAttribute('data-sc-font-size', s.fontSize);
    DASHBOARD_ITEMS.forEach(item => {
      dashboardNodes(item).forEach(node => {
        node.style.display = s.dashboard[item.key] ? '' : 'none';
      });
    });
  }

  function showSettings() {
    closeModal('sc-settings-modal');
    const s = settings();
    const modal = document.createElement('div');
    modal.id = 'sc-settings-modal';
    modal.className = 'sc-modal open';
    modal.innerHTML = '<div class="sc-modal-panel sc-settings-panel">' +
      '<div class="sc-modal-head"><div><span>Settings</span><h2>Control the workspace.</h2></div><button type="button" data-sc-close>Close</button></div>' +
      '<section><h3>Dashboard cards</h3><div class="sc-settings-grid">' +
      DASHBOARD_ITEMS.map(item => '<label><input type="checkbox" data-dash-item="' + item.key + '"' + (s.dashboard[item.key] ? ' checked' : '') + '> ' + esc(item.label) + '</label>').join('') +
      '</div></section>' +
      '<section><h3>Interface</h3><div class="sc-settings-grid">' +
      '<label>Font size<select id="sc-font-size"><option value="normal">Normal</option><option value="large">Large</option><option value="extra">Extra large</option></select></label>' +
      '<label><input type="checkbox" id="sc-compact-ui"' + (s.compact ? ' checked' : '') + '> Compact spacing</label>' +
      '<label><input type="checkbox" id="sc-reduce-motion"' + (s.reduceMotion ? ' checked' : '') + '> Reduce motion</label>' +
      '</div></section>' +
      '<section><h3>Data backup</h3><p>Export/import all local Student Compass data before switching devices or clearing browser data.</p><div class="sc-settings-actions"><button class="cc-btn primary" type="button" id="sc-export-data">Export Data</button><label class="cc-btn"><input id="sc-import-data" type="file" accept="application/json" hidden>Import Data</label><button class="cc-btn" type="button" id="sc-reset-data">Reset Local Data</button></div></section>' +
    '</div>';
    document.body.appendChild(modal);
    const font = document.getElementById('sc-font-size');
    if (font) font.value = s.fontSize;
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.remove();
  }

  function allStorage() {
    const data = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (/^(sc|studentCompass|apush|college)/i.test(key)) data[key] = localStorage.getItem(key);
    }
    return { exportedAt: new Date().toISOString(), app: 'Student Compass', data };
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(allStorage(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-compass-backup.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  }

  function importData(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        const data = parsed.data || {};
        Object.keys(data).forEach(key => localStorage.setItem(key, String(data[key])));
        location.reload();
      } catch (_) {
        alert('Import failed. Use a Student Compass backup JSON file.');
      }
    };
    reader.readAsText(file);
  }

  function resetData() {
    if (!confirm('Reset local Student Compass progress and settings?')) return;
    Object.keys(localStorage).forEach(key => {
      if (/^(sc|studentCompass|apush|college)/i.test(key)) localStorage.removeItem(key);
    });
    location.reload();
  }

  function questionBank() {
    const rows = [];
    function add(domain, list) {
      (Array.isArray(list) ? list : []).forEach((q, index) => rows.push({
        domain,
        skill: q.cat || q.pl || q.period || 'Mixed',
        text: q.q || q.title || '',
        passage: q.passage || (q.stimulus && q.stimulus.text) || '',
        answer: q.a || '',
        explanation: q.e || '',
        index
      }));
    }
    add('SAT Reading & Writing', window.SAT_ENG);
    add('SAT Math', window.SAT_MATH);
    add('APUSH', window.BANK || (typeof BANK !== 'undefined' ? BANK : []));
    return rows;
  }

  function showQuestionSearch() {
    closeModal('sc-question-search');
    const modal = document.createElement('div');
    modal.id = 'sc-question-search';
    modal.className = 'sc-modal open';
    modal.innerHTML = '<div class="sc-modal-panel sc-search-panel">' +
      '<div class="sc-modal-head"><div><span>Question Search</span><h2>Find any SAT or APUSH question.</h2></div><button type="button" data-sc-close>Close</button></div>' +
      '<div class="sc-search-controls"><input id="sc-q-search" placeholder="Search keyword, skill, period, passage..."><select id="sc-q-domain"><option value="">All</option><option>SAT Reading & Writing</option><option>SAT Math</option><option>APUSH</option></select></div>' +
      '<div id="sc-q-results" class="sc-q-results"></div>' +
    '</div>';
    document.body.appendChild(modal);
    renderQuestionResults();
    setTimeout(() => document.getElementById('sc-q-search')?.focus(), 20);
  }

  function renderQuestionResults() {
    const q = (document.getElementById('sc-q-search')?.value || '').toLowerCase();
    const domain = document.getElementById('sc-q-domain')?.value || '';
    const rows = questionBank().filter(row => {
      const hay = [row.domain, row.skill, row.text, row.passage, row.explanation].join(' ').toLowerCase();
      return (!domain || row.domain === domain) && (!q || hay.includes(q));
    }).slice(0, 80);
    const root = document.getElementById('sc-q-results');
    if (!root) return;
    root.innerHTML = rows.length ? rows.map(row => '<article class="sc-q-result"><div><span>' + esc(row.domain) + '</span><b>' + esc(row.skill) + '</b></div><p>' + esc(row.text || row.passage || 'Question') + '</p><small>Answer: ' + esc(row.answer || '-') + '</small></article>').join('') : '<div class="sc-empty-state">No questions found.</div>';
  }

  function filteredQueue(filter) {
    const queue = window.StudentCompassData && window.StudentCompassData.getReviewQueue ? window.StudentCompassData.getReviewQueue(60) : [];
    const mastery = window.StudentCompassData && window.StudentCompassData.getMastery ? window.StudentCompassData.getMastery() : [];
    const weakSkills = new Set(mastery.filter(row => row.status === 'Weak').map(row => row.skill));
    if (filter === 'sat') return queue.filter(item => /^SAT/.test(item.type));
    if (filter === 'math') return queue.filter(item => /Math/.test(item.type));
    if (filter === 'rw') return queue.filter(item => /Reading|Writing/.test(item.type));
    if (filter === 'apush') return queue.filter(item => /APUSH/.test(item.type));
    if (filter === 'weak') return queue.filter(item => weakSkills.has(item.skill));
    if (filter === 'recent') return queue.slice(0, 10);
    return queue.slice(0, 14);
  }

  function renderReviewWithFilter(filter) {
    writeJSON(REVIEW_FILTER_KEY, filter || 'all');
    if (typeof window.showReviewMode === 'function') window.showReviewMode();
    setTimeout(() => enhanceReviewFilters(), 30);
  }

  function enhanceReviewFilters() {
    const page = document.getElementById('s-command-review');
    if (!page || !page.classList.contains('on')) return;
    const current = readJSON(REVIEW_FILTER_KEY, 'all');
    const list = page.querySelector('.sc-review-list');
    if (!list) return;
    if (!page.querySelector('.sc-review-filters')) {
      const filters = document.createElement('div');
      filters.className = 'sc-review-filters';
      filters.innerHTML = [
        ['all', 'All'], ['sat', 'SAT'], ['rw', 'Reading & Writing'], ['math', 'Math'], ['apush', 'APUSH'], ['weak', 'Weak only'], ['recent', 'Recent']
      ].map(pair => '<button type="button" data-review-filter="' + pair[0] + '">' + pair[1] + '</button>').join('');
      list.insertAdjacentElement('beforebegin', filters);
    }
    page.querySelectorAll('[data-review-filter]').forEach(btn => btn.classList.toggle('active', btn.dataset.reviewFilter === current));
    const rows = filteredQueue(current);
    list.innerHTML = rows.map((item, index) => '<article class="sc-review-card"><div class="sc-review-num">' + String(index + 1).padStart(2, '0') + '</div><div><div class="sc-review-head"><span>' + esc(item.type) + '</span><b>' + esc(item.skill) + '</b></div><p>' + esc(item.prompt) + '</p><strong>' + esc(item.action) + '</strong><small>' + esc(item.explanation) + '</small></div></article>').join('');
  }

  function addTopButtons() {
    const actions = document.querySelector('header > div:last-child');
    if (!actions || actions.querySelector('[data-sc-settings]')) return;
    actions.insertAdjacentHTML('afterbegin', '<button class="nav-btn sc-top-tool" type="button" data-sc-search>Search</button><button class="nav-btn sc-top-tool" type="button" data-sc-settings>Settings</button>');
  }

  function addMobileNav() {
    if (document.querySelector('.sc-mobile-nav')) return;
    const nav = document.createElement('nav');
    nav.className = 'sc-mobile-nav';
    nav.innerHTML = '<button onclick="goHome()">Home</button><button onclick="showSAT()">SAT</button><button onclick="showReviewMode()">Review</button><button data-sc-search>Search</button><button onclick="toggleMenu()">Menu</button>';
    document.body.appendChild(nav);
  }

  function cleanupOldLayers() {
    document.querySelectorAll('.sc-version-badge').forEach(el => el.remove());
    document.querySelectorAll('.cc-extra-actions .cc-btn').forEach(btn => {
      if ((btn.textContent || '').trim() === 'Review Mode') btn.textContent = 'Review Queue';
    });
  }

  function init() {
    addTopButtons();
    addMobileNav();
    cleanupOldLayers();
    applySettings();
    enhanceReviewFilters();
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-sc-settings]')) return showSettings();
    if (event.target.closest('[data-sc-search]')) return showQuestionSearch();
    if (event.target.closest('[data-sc-close]')) return closeModal(event.target.closest('.sc-modal')?.id);
    const filter = event.target.closest('[data-review-filter]');
    if (filter) return renderReviewWithFilter(filter.dataset.reviewFilter);
    if (event.target.id === 'sc-export-data') return exportData();
    if (event.target.id === 'sc-reset-data') return resetData();
  });

  document.addEventListener('change', event => {
    if (event.target.matches('[data-dash-item]')) {
      const s = settings();
      s.dashboard[event.target.dataset.dashItem] = event.target.checked;
      return saveSettings(s);
    }
    if (event.target.id === 'sc-font-size') return saveSettings({ fontSize: event.target.value });
    if (event.target.id === 'sc-compact-ui') return saveSettings({ compact: event.target.checked });
    if (event.target.id === 'sc-reduce-motion') return saveSettings({ reduceMotion: event.target.checked });
    if (event.target.id === 'sc-import-data') return importData(event.target.files && event.target.files[0]);
    if (event.target.id === 'sc-q-domain') return renderQuestionResults();
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'sc-q-search') renderQuestionResults();
  });

  ['show', 'showSAT', 'showReviewMode', 'showSkillMastery', 'showProgressCenter'].forEach(name => {
    const fn = window[name];
    if (typeof fn !== 'function' || fn.__productUtilitiesPatched) return;
    window[name] = function () {
      const result = fn.apply(this, arguments);
      setTimeout(init, 50);
      return result;
    };
    window[name].__productUtilitiesPatched = true;
  });

  window.scShowSettings = showSettings;
  window.scShowQuestionSearch = showQuestionSearch;
  window.scExportData = exportData;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', () => setTimeout(init, 250));
})();
