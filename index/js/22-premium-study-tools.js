(function () {
  const CONTINUE_KEY = 'sc_continue_task_v1';
  const FLAGS_KEY = 'sc_flagged_questions_v1';
  const EXAMS_KEY = 'sc_sat_practice_exams_v1';
  const COMMANDS = [
    { label: 'Continue last task', hint: 'Resume your current work', run: continueLastTask },
    { label: 'Start SAT practice', hint: 'Open the SAT dashboard', run: () => call('showSAT') },
    { label: 'Start full SAT test', hint: 'Digital SAT practice flow', run: () => call('startPracticeTest') },
    { label: 'Review weak skills', hint: 'Open the review queue', run: () => call('showReviewMode') },
    { label: 'Open skill mastery', hint: 'See weak, improving, and strong skills', run: () => call('showSkillMastery') },
    { label: 'Open GPA planner', hint: 'Plan courses and GPA', run: () => openTool('s-gpa', 'nav-gpa') },
    { label: 'Find universities', hint: 'Open University Selection', run: () => openTool('s-college', 'nav-college') },
    { label: 'School system guide', hint: 'Understand U.S. school basics', run: () => openTool('s-school', 'nav-school') },
    { label: 'Export report', hint: 'Download your plan', run: () => call('showExportCenter') },
    { label: 'Setup profile', hint: 'Run onboarding again', run: () => call('scShowOnboarding') }
  ];

  let toolMode = null;
  let lineReader = null;

  function call(name) {
    if (typeof window[name] === 'function') window[name]();
  }

  function openTool(page, nav) {
    if (typeof openToolPage === 'function') openToolPage(page, nav);
    else {
      if (typeof show === 'function') show(page);
      if (typeof setNav === 'function') setNav(nav);
    }
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

  function rememberTask(task) {
    writeJSON(CONTINUE_KEY, Object.assign({ updatedAt: new Date().toISOString() }, task || {}));
  }

  function newestUnfinishedExam() {
    return readJSON(EXAMS_KEY, []).filter(exam => exam && exam.status !== 'complete').sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0] || null;
  }

  function continueLastTask() {
    const exam = newestUnfinishedExam();
    closeCommandMenu();
    if (exam && typeof resumePracticeExam === 'function') return resumePracticeExam(exam.id);
    const task = readJSON(CONTINUE_KEY, null);
    if (task && task.action === 'sat') return call('showSAT');
    if (task && task.action === 'apush') {
      if (typeof show === 'function') show('s-start');
      if (typeof setNav === 'function') setNav('nav-quiz');
      return;
    }
    if (task && task.action === 'gpa') return openTool('s-gpa', 'nav-gpa');
    call('showSAT');
  }

  function patchFunction(name, task) {
    const fn = window[name];
    if (typeof fn !== 'function' || fn.__continuePatched) return;
    window[name] = function () {
      rememberTask(typeof task === 'function' ? task.apply(this, arguments) : task);
      return fn.apply(this, arguments);
    };
    window[name].__continuePatched = true;
  }

  function patchContinueTracking() {
    patchFunction('startSATUnit', function (subject, unit) {
      return { action: 'sat', label: 'Continue SAT ' + (unit || 'practice'), detail: subject || 'SAT practice' };
    });
    patchFunction('startSAT', subject => ({ action: 'sat', label: 'Continue SAT practice', detail: subject || 'SAT' }));
    patchFunction('startQuiz', { action: 'apush', label: 'Continue APUSH practice', detail: 'APUSH quiz' });
    patchFunction('startPracticeTest', { action: 'sat-test', label: 'Resume full SAT test', detail: 'Saved automatically' });
  }

  function continueLabel() {
    const exam = newestUnfinishedExam();
    if (exam) {
      const answered = Array.isArray(exam.answers) ? exam.answers.length : 0;
      const total = exam.total || (Array.isArray(exam.questions) ? exam.questions.length : 98);
      return { label: 'Resume SAT Test', detail: answered + '/' + total + ' answered' };
    }
    const task = readJSON(CONTINUE_KEY, null);
    return task ? { label: task.label || 'Continue', detail: task.detail || 'Pick up where you left off' } : { label: 'Start Smart Review', detail: 'Open your highest-value next action' };
  }

  function addContinueCard() {
    const dashboard = document.querySelector('.cc-dashboard');
    if (!dashboard || dashboard.querySelector('.sc-continue-card')) return;
    const info = continueLabel();
    const card = document.createElement('div');
    card.className = 'sc-continue-card';
    card.innerHTML = '<div><span>Continue</span><strong>' + escapeHTML(info.label) + '</strong><small>' + escapeHTML(info.detail) + '</small></div><button class="cc-btn primary" type="button" data-sc-continue>Go</button>';
    const head = dashboard.querySelector('.cc-dash-head');
    if (head) head.insertAdjacentElement('afterend', card);
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function quizRoot() {
    return document.querySelector('#s-sat-quiz.on, #s-quiz.on, #s-drills-quiz.on');
  }

  function currentQuestionKey(root) {
    const label = root.querySelector('#sq-lbl,#q-lbl')?.textContent || 'Question';
    const text = root.querySelector('#sq-text,#q-text')?.textContent || '';
    return (label + '|' + text).slice(0, 220);
  }

  function readFlags() {
    const flags = readJSON(FLAGS_KEY, []);
    return Array.isArray(flags) ? flags : [];
  }

  function toggleFlag(root) {
    const key = currentQuestionKey(root);
    const flags = readFlags();
    const exists = flags.includes(key);
    const next = exists ? flags.filter(item => item !== key) : [key].concat(flags).slice(0, 80);
    writeJSON(FLAGS_KEY, next);
    root.classList.toggle('sc-question-flagged', !exists);
    updateFlagCount(root);
  }

  function updateFlagCount(root) {
    const count = root.querySelector('[data-flag-count]');
    if (count) count.textContent = String(readFlags().length);
  }

  function setMode(mode, root) {
    toolMode = toolMode === mode ? null : mode;
    root.querySelectorAll('.sc-test-tool').forEach(btn => btn.classList.toggle('active', btn.dataset.tool === toolMode));
    root.classList.toggle('sc-line-reader-on', toolMode === 'line');
    ensureLineReader(root);
  }

  function ensureLineReader(root) {
    if (toolMode !== 'line') {
      if (lineReader) lineReader.style.display = 'none';
      return;
    }
    if (!lineReader) {
      lineReader = document.createElement('div');
      lineReader.className = 'sc-line-reader';
      document.body.appendChild(lineReader);
    }
    lineReader.style.display = 'block';
  }

  function applySelection(tag) {
    const root = quizRoot();
    if (!root) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const allowed = root.querySelector('#sq-stimulus,#sq-text,#q-stimulus,#q-text');
    if (!allowed || !allowed.contains(range.commonAncestorContainer)) return;
    const el = document.createElement(tag);
    el.className = tag === 'mark' ? 'sc-user-highlight' : 'sc-user-underline';
    try {
      range.surroundContents(el);
      selection.removeAllRanges();
    } catch (_) {
      const text = selection.toString();
      if (!text) return;
      el.textContent = text;
      range.deleteContents();
      range.insertNode(el);
      selection.removeAllRanges();
    }
  }

  function addQuizTools() {
    const root = quizRoot();
    if (!root || root.querySelector('.sc-test-tools')) return;
    const anchor = root.querySelector('#sq-tag,#q-period,#sq-lbl,#q-lbl');
    if (!anchor) return;
    const tools = document.createElement('div');
    tools.className = 'sc-test-tools';
    tools.innerHTML =
      '<button class="sc-test-tool" data-tool="highlight" type="button">Highlight</button>' +
      '<button class="sc-test-tool" data-tool="underline" type="button">Underline</button>' +
      '<button class="sc-test-tool" data-tool="line" type="button">Line Reader</button>' +
      '<button class="sc-test-tool" data-tool="eliminate" type="button">Eliminate</button>' +
      '<button class="sc-test-tool" data-tool="flag" type="button">Flag <span data-flag-count>0</span></button>';
    anchor.insertAdjacentElement('afterend', tools);
    updateFlagCount(root);
  }

  function buildCommandMenu() {
    if (document.getElementById('sc-command-menu')) return;
    const overlay = document.createElement('div');
    overlay.id = 'sc-command-menu';
    overlay.className = 'sc-command-menu';
    overlay.innerHTML = '<div class="sc-command-panel"><div class="sc-command-input-wrap"><span>Search</span><input id="sc-command-input" placeholder="Start SAT test, open GPA, review weak skills..." autocomplete="off"></div><div id="sc-command-results"></div></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', event => {
      if (event.target === overlay) closeCommandMenu();
    });
    const input = document.getElementById('sc-command-input');
    input.addEventListener('input', renderCommands);
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeCommandMenu();
      if (event.key === 'Enter') {
        const first = document.querySelector('.sc-command-result');
        if (first) first.click();
      }
    });
  }

  function renderCommands() {
    const input = document.getElementById('sc-command-input');
    const results = document.getElementById('sc-command-results');
    if (!input || !results) return;
    const q = input.value.trim().toLowerCase();
    const filtered = COMMANDS.filter(cmd => !q || (cmd.label + ' ' + cmd.hint).toLowerCase().includes(q)).slice(0, 8);
    results.innerHTML = filtered.map((cmd, index) => '<button class="sc-command-result" type="button" data-command-index="' + COMMANDS.indexOf(cmd) + '"><strong>' + escapeHTML(cmd.label) + '</strong><span>' + escapeHTML(cmd.hint) + '</span></button>').join('');
  }

  function openCommandMenu() {
    buildCommandMenu();
    const overlay = document.getElementById('sc-command-menu');
    overlay.classList.add('open');
    renderCommands();
    setTimeout(() => document.getElementById('sc-command-input')?.focus(), 20);
  }

  function closeCommandMenu() {
    const overlay = document.getElementById('sc-command-menu');
    if (overlay) overlay.classList.remove('open');
  }

  function addRecommendations() {
    const page = document.querySelector('#s-sat-results.on, #s-results.on, #s-drills-results.on, #s-sat-pt-results.on');
    if (!page || page.querySelector('.sc-post-recs')) return;
    const queue = window.StudentCompassData && typeof window.StudentCompassData.getReviewQueue === 'function'
      ? window.StudentCompassData.getReviewQueue(3)
      : [];
    if (!queue.length) return;
    const card = document.createElement('div');
    card.className = 'card sc-post-recs';
    card.innerHTML = '<div class="card-title">Practice these next</div><div class="sc-post-rec-grid">' + queue.map(item => '<button class="sc-post-rec" type="button" onclick="showReviewMode()"><b>' + escapeHTML(item.skill) + '</b><span>' + escapeHTML(item.action) + '</span></button>').join('') + '</div>';
    const anchor = page.querySelector('.card:last-of-type') || page;
    anchor.insertAdjacentElement('afterend', card);
  }

  function init() {
    patchContinueTracking();
    document.querySelectorAll('.sc-version-badge').forEach(el => el.remove());
    addContinueCard();
    addQuizTools();
    addRecommendations();
  }

  document.addEventListener('click', event => {
    const continueBtn = event.target.closest('[data-sc-continue]');
    if (continueBtn) {
      event.preventDefault();
      return continueLastTask();
    }
    const command = event.target.closest('.sc-command-result');
    if (command) {
      const cmd = COMMANDS[Number(command.dataset.commandIndex)];
      if (cmd) cmd.run();
      return closeCommandMenu();
    }
    const tool = event.target.closest('.sc-test-tool');
    if (tool) {
      const root = quizRoot();
      if (!root) return;
      event.preventDefault();
      if (tool.dataset.tool === 'flag') return toggleFlag(root);
      return setMode(tool.dataset.tool, root);
    }
    const choice = event.target.closest('.choice');
    if (choice && toolMode === 'eliminate' && quizRoot()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      choice.classList.toggle('sc-eliminated');
    }
  }, true);

  document.addEventListener('mouseup', () => {
    if (toolMode === 'highlight') applySelection('mark');
    if (toolMode === 'underline') applySelection('u');
  });

  document.addEventListener('mousemove', event => {
    if (!lineReader || toolMode !== 'line') return;
    lineReader.style.top = Math.max(72, event.clientY - 22) + 'px';
  });

  document.addEventListener('keydown', event => {
    const isCommand = (event.ctrlKey || event.metaKey) && String(event.key).toLowerCase() === 'k';
    if (isCommand) {
      event.preventDefault();
      openCommandMenu();
    }
    if (event.key === 'Escape') closeCommandMenu();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', () => setTimeout(init, 250));
  ['show', 'showSAT', 'showReviewMode', 'showSkillMastery', 'showProgressCenter'].forEach(name => {
    const fn = window[name];
    if (typeof fn !== 'function' || fn.__premiumToolsPatched) return;
    window[name] = function () {
      const result = fn.apply(this, arguments);
      setTimeout(init, 40);
      return result;
    };
    window[name].__premiumToolsPatched = true;
  });
})();
