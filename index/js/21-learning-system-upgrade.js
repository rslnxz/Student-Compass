(function () {
  const APP_KEY = 'studentCompassState';
  const CC_KEY = 'scCommandCenter2026';
  const DONE_KEY = 'sc_onboarding_done_v1';
  const MAX_ATTEMPTS = 700;

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

  function readState() {
    const base = window.StudentCompassState && typeof window.StudentCompassState.read === 'function'
      ? window.StudentCompassState.read()
      : readJSON(APP_KEY, {});
    base.version = 2;
    base.learning = base.learning || { attempts: [], onboarding: {} };
    base.learning.attempts = Array.isArray(base.learning.attempts) ? base.learning.attempts : [];
    return base;
  }

  function writeState(next) {
    const value = Object.assign({ version: 2, updatedAt: new Date().toISOString() }, readState(), next || {});
    if (window.StudentCompassState && typeof window.StudentCompassState.write === 'function') return window.StudentCompassState.write(value);
    return writeJSON(APP_KEY, value);
  }

  function updateState(fn) {
    const current = readState();
    return writeState(typeof fn === 'function' ? fn(current) : fn);
  }

  function normalizeAttempt(input) {
    const skill = String(input.skill || input.cat || 'Mixed Practice').trim();
    return {
      id: input.id || ('attempt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)),
      date: input.date || new Date().toISOString(),
      domain: String(input.domain || 'Practice').trim(),
      skill,
      correct: !!input.correct,
      question: String(input.question || '').slice(0, 900),
      userAnswer: String(input.userAnswer == null ? '' : input.userAnswer).slice(0, 120),
      correctAnswer: String(input.correctAnswer == null ? '' : input.correctAnswer).slice(0, 120),
      explanation: String(input.explanation || '').slice(0, 900),
      source: String(input.source || 'Practice').trim()
    };
  }

  function recordAttempt(input) {
    const attempt = normalizeAttempt(input || {});
    updateState(state => {
      state.learning = state.learning || {};
      const attempts = Array.isArray(state.learning.attempts) ? state.learning.attempts : [];
      state.learning.attempts = [attempt].concat(attempts).slice(0, MAX_ATTEMPTS);
      return state;
    });
    return attempt;
  }

  function seedAttemptsFromStats() {
    const state = readState();
    if ((state.learning.attempts || []).length) return;
    const stats = readJSON('apush_stats', {});
    const seeds = [];
    Object.entries(stats.catHistory || {}).forEach(([skill, rows]) => {
      (Array.isArray(rows) ? rows.slice(-3) : []).forEach((row, index) => {
        const pct = Number(row.pct || 0);
        seeds.push({
          id: 'seed-' + skill + '-' + index,
          date: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
          domain: /equation|math|geometry|data|advanced/i.test(skill) ? 'SAT Math' : 'SAT Reading & Writing',
          skill,
          correct: pct >= 75,
          question: 'Imported from previous category performance.',
          userAnswer: pct + '% category result',
          correctAnswer: '75%+ target',
          explanation: 'This item was created from your older score history so the mastery dashboard has a starting point.',
          source: 'Imported History'
        });
      });
    });
    if (!seeds.length) return;
    updateState(next => {
      next.learning.attempts = seeds.slice(0, MAX_ATTEMPTS);
      return next;
    });
  }

  function profileWeakSkills() {
    const command = readJSON(CC_KEY, {});
    const profile = command.profile || {};
    return String(profile.weakSubjects || '').split(',').map(s => s.trim()).filter(Boolean);
  }

  function getMastery() {
    seedAttemptsFromStats();
    const attempts = readState().learning.attempts || [];
    const grouped = new Map();
    attempts.forEach(attempt => {
      const key = attempt.domain + '|' + attempt.skill;
      if (!grouped.has(key)) grouped.set(key, { domain: attempt.domain, skill: attempt.skill, attempts: 0, correct: 0, misses: 0, latest: attempt.date });
      const row = grouped.get(key);
      row.attempts += 1;
      row.correct += attempt.correct ? 1 : 0;
      row.misses += attempt.correct ? 0 : 1;
      if (new Date(attempt.date) > new Date(row.latest)) row.latest = attempt.date;
    });
    profileWeakSkills().forEach(skill => {
      const domain = /apush|period|history/i.test(skill) ? 'APUSH' : /math|algebra|geometry|data/i.test(skill) ? 'SAT Math' : 'SAT Reading & Writing';
      const key = domain + '|' + skill;
      if (!grouped.has(key)) grouped.set(key, { domain, skill, attempts: 0, correct: 0, misses: 0, latest: null });
    });
    return Array.from(grouped.values()).map(row => {
      const accuracy = row.attempts ? Math.round((row.correct / row.attempts) * 100) : null;
      let status = 'Needs Data';
      if (accuracy != null) status = accuracy >= 85 && row.attempts >= 3 ? 'Strong' : accuracy >= 65 ? 'Improving' : 'Weak';
      return Object.assign(row, { accuracy, status });
    }).sort((a, b) => {
      const rank = { Weak: 0, Improving: 1, 'Needs Data': 2, Strong: 3 };
      return (rank[a.status] - rank[b.status]) || (b.misses - a.misses) || a.skill.localeCompare(b.skill);
    });
  }

  function getReviewQueue(limit) {
    const attempts = readState().learning.attempts || [];
    const seen = new Set();
    const misses = attempts.filter(a => !a.correct).filter(a => {
      const key = a.domain + '|' + a.skill + '|' + a.question;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const mastery = getMastery().filter(row => row.status === 'Weak' || row.status === 'Improving');
    const queue = misses.map(a => ({
      type: a.domain,
      skill: a.skill,
      prompt: a.question || 'Review this missed item.',
      action: a.correctAnswer ? 'Correct answer: ' + a.correctAnswer : 'Redo this question type.',
      explanation: a.explanation || 'Review the logic, then answer a similar question.',
      source: a.source
    }));
    mastery.forEach(row => {
      if (queue.some(item => item.skill === row.skill)) return;
      queue.push({
        type: row.domain,
        skill: row.skill,
        prompt: row.status === 'Weak' ? 'Accuracy is below target.' : 'This skill is improving but not stable yet.',
        action: 'Do 8-12 focused questions.',
        explanation: row.accuracy == null ? 'Start with a short diagnostic set.' : row.accuracy + '% accuracy across ' + row.attempts + ' attempt' + (row.attempts === 1 ? '' : 's') + '.',
        source: 'Skill Mastery'
      });
    });
    if (!queue.length) {
      queue.push(
        { type: 'SAT Reading & Writing', skill: 'Text Structure', prompt: 'No misses saved yet. Start with a diagnostic skill set.', action: 'Answer 10 Reading & Writing questions.', explanation: 'The queue fills automatically when you miss questions.', source: 'Starter Queue' },
        { type: 'SAT Math', skill: 'Algebra', prompt: 'Build a baseline for math accuracy.', action: 'Answer 10 algebra questions.', explanation: 'Mastery improves after each recorded attempt.', source: 'Starter Queue' },
        { type: 'APUSH', skill: 'Period 3', prompt: 'Check historical reasoning with stimulus questions.', action: 'Answer 8 APUSH questions.', explanation: 'Missed APUSH questions become review items.', source: 'Starter Queue' }
      );
    }
    return queue.slice(0, limit || 12);
  }

  function syncCommandProfile(profile) {
    const data = readJSON(CC_KEY, {});
    data.profile = Object.assign({}, data.profile || {}, profile || {});
    writeJSON(CC_KEY, data);
  }

  function saveOnboarding(values) {
    updateState(state => {
      state.learning = state.learning || {};
      state.learning.onboarding = Object.assign({}, state.learning.onboarding || {}, values, { completedAt: new Date().toISOString() });
      return state;
    });
    syncCommandProfile({
      name: values.name || 'Student',
      grade: values.grade || '',
      targetSat: values.targetSat || '',
      gpa: values.gpa || '',
      collegeGoal: values.goal || '',
      weakSubjects: values.weak || ''
    });
    localStorage.setItem(DONE_KEY, '1');
  }

  function ensurePage(id) {
    let page = document.getElementById(id);
    if (page) return page;
    page = document.createElement('div');
    page.id = id;
    page.className = 'sec';
    page.style.display = 'none';
    (document.getElementById('app') || document.body).appendChild(page);
    return page;
  }

  function showPage(id, nav) {
    document.querySelectorAll('.sec').forEach(el => {
      el.classList.remove('on');
      el.style.display = 'none';
    });
    const page = document.getElementById(id);
    if (page) {
      page.classList.add('on');
      page.style.display = 'block';
    }
    const tool = document.getElementById('tool-page-root');
    if (tool) {
      tool.classList.remove('on');
      tool.innerHTML = '';
    }
    if (typeof setNav === 'function' && nav) setNav(nav);
    document.body.setAttribute('data-current-page', id);
    window.scrollTo(0, 0);
  }

  function statusClass(status) {
    return String(status || '').toLowerCase().replace(/\s+/g, '-');
  }

  function masteryCard(row) {
    const pct = row.accuracy == null ? 8 : Math.max(6, row.accuracy);
    const accuracy = row.accuracy == null ? 'No data' : row.accuracy + '%';
    return '<article class="sc-skill-card ' + statusClass(row.status) + '">' +
      '<div class="sc-skill-top"><span>' + esc(row.domain) + '</span><b>' + esc(row.status) + '</b></div>' +
      '<h3>' + esc(row.skill) + '</h3>' +
      '<div class="sc-skill-meter"><i style="width:' + pct + '%"></i></div>' +
      '<div class="sc-skill-meta"><span>' + esc(accuracy) + '</span><span>' + row.attempts + ' attempt' + (row.attempts === 1 ? '' : 's') + '</span><span>' + row.misses + ' miss' + (row.misses === 1 ? '' : 'es') + '</span></div>' +
    '</article>';
  }

  function showSkillMastery() {
    const rows = getMastery();
    const weak = rows.filter(row => row.status === 'Weak').length;
    const improving = rows.filter(row => row.status === 'Improving').length;
    const strong = rows.filter(row => row.status === 'Strong').length;
    const page = ensurePage('s-command-mastery');
    page.innerHTML = '<section class="cc-feature-page cc-pro-page sc-learning-page" data-polished="1">' +
      '<div class="cc-pro-guide"><div><span>Skill Mastery</span><strong>Know exactly what is weak, improving, or strong.</strong><p>This dashboard reads your SAT and APUSH attempts, then turns every category into a clear next step.</p></div><button class="cc-btn primary" type="button" onclick="showReviewMode()">Open Review Queue</button></div>' +
      '<div class="sc-mastery-summary"><div><b>' + weak + '</b><span>Weak</span></div><div><b>' + improving + '</b><span>Improving</span></div><div><b>' + strong + '</b><span>Strong</span></div><div><b>' + rows.length + '</b><span>Total skills</span></div></div>' +
      '<div class="sc-skill-grid">' + (rows.length ? rows.map(masteryCard).join('') : '<div class="sc-empty-state">Complete a SAT or APUSH quiz to start building mastery data.</div>') + '</div>' +
    '</section>';
    showPage('s-command-mastery', 'nav-command-mastery');
  }

  function queueRow(item, index) {
    return '<article class="sc-review-card">' +
      '<div class="sc-review-num">' + String(index + 1).padStart(2, '0') + '</div>' +
      '<div><div class="sc-review-head"><span>' + esc(item.type) + '</span><b>' + esc(item.skill) + '</b></div>' +
      '<p>' + esc(item.prompt) + '</p><strong>' + esc(item.action) + '</strong><small>' + esc(item.explanation) + '</small></div>' +
    '</article>';
  }

  function showReviewMode() {
    const queue = getReviewQueue(14);
    const page = ensurePage('s-command-review');
    page.innerHTML = '<section class="cc-feature-page cc-pro-page sc-learning-page" data-polished="1">' +
      '<div class="cc-pro-guide"><div><span>Review Queue</span><strong>Review what will actually raise the score.</strong><p>Missed questions and weak skills are sorted into one queue. New misses appear here automatically after quizzes and full tests.</p></div><button class="cc-btn primary" type="button" onclick="showSkillMastery()">View Mastery</button></div>' +
      '<div class="sc-review-actions"><button class="cc-btn primary" onclick="showSAT()">Start SAT Practice</button><button class="cc-btn" onclick="show(\'s-start\');setNav(\'nav-quiz\')">Start APUSH Practice</button></div>' +
      '<div class="sc-review-list">' + queue.map(queueRow).join('') + '</div>' +
    '</section>';
    showPage('s-command-review', 'nav-command-review');
  }

  function addNav() {
    const group = document.querySelector('[data-cc-nav]');
    if (!group) return;
    let anchor = document.getElementById('nav-command-progress') || document.getElementById('nav-command-start');
    if (!document.getElementById('nav-command-mastery')) {
      const btn = document.createElement('button');
      btn.className = 'drawer-btn';
      btn.id = 'nav-command-mastery';
      btn.setAttribute('onclick', 'showSkillMastery();closeMenu()');
      btn.textContent = 'Skill Mastery';
      if (anchor) anchor.insertAdjacentElement('afterend', btn);
      else group.appendChild(btn);
      anchor = btn;
    }
    const review = document.getElementById('nav-command-review');
    if (review) {
      review.textContent = 'Review Queue';
      review.setAttribute('onclick', 'showReviewMode();closeMenu()');
    } else {
      const btn = document.createElement('button');
      btn.className = 'drawer-btn';
      btn.id = 'nav-command-review';
      btn.setAttribute('onclick', 'showReviewMode();closeMenu()');
      btn.textContent = 'Review Queue';
      if (anchor) anchor.insertAdjacentElement('afterend', btn);
      else group.appendChild(btn);
    }
  }

  function addHomeWidgets() {
    const home = document.getElementById('s-landing');
    if (!home || home.querySelector('.sc-learning-strip')) return;
    const target = home.querySelector('.cc-section') || home.querySelector('.cc-stats-strip');
    if (!target) return;
    const rows = getMastery();
    const queue = getReviewQueue(3);
    const weak = rows.filter(row => row.status === 'Weak').slice(0, 3);
    const html = '<section class="cc-section sc-learning-strip">' +
      '<div class="cc-section-head"><div><span class="cc-small" style="color:#5eead4;font-weight:900">LEARNING SYSTEM</span><h2>Mastery and review are now connected.</h2><p>Every missed SAT or APUSH question can become a clear next action.</p></div><button class="cc-btn primary" onclick="showSkillMastery()">Open Mastery</button></div>' +
      '<div class="sc-learning-home-grid"><div class="sc-learning-panel"><h3>Weak skills</h3>' + (weak.length ? weak.map(row => '<div><b>' + esc(row.skill) + '</b><span>' + esc(row.domain) + ' - ' + (row.accuracy == null ? 'Needs data' : row.accuracy + '%') + '</span></div>').join('') : '<p>No weak skills recorded yet. Take a quiz to build the dashboard.</p>') + '</div>' +
      '<div class="sc-learning-panel"><h3>Next review</h3>' + queue.map(item => '<div><b>' + esc(item.skill) + '</b><span>' + esc(item.action) + '</span></div>').join('') + '</div></div></section>';
    target.insertAdjacentHTML('beforebegin', html);
  }

  function showOnboarding(force) {
    if (!force && localStorage.getItem(DONE_KEY)) return;
    if (document.getElementById('sc-onboarding')) return;
    const command = readJSON(CC_KEY, {});
    const profile = command.profile || {};
    const overlay = document.createElement('div');
    overlay.id = 'sc-onboarding';
    overlay.className = 'sc-onboarding';
    overlay.innerHTML = '<div class="sc-onboarding-card">' +
      '<div class="sc-onboarding-logo"><span></span><b>Student Compass Setup</b></div>' +
      '<h2>Build your command center.</h2><p>Set the basics once. The app uses this for mastery, review, daily planning, and university guidance.</p>' +
      '<div class="sc-onboarding-grid">' +
        '<label>Name<input id="sc-ob-name" value="' + esc(profile.name || '') + '" placeholder="Your name"></label>' +
        '<label>Grade<input id="sc-ob-grade" value="' + esc(profile.grade || '') + '" placeholder="11"></label>' +
        '<label>Target SAT<input id="sc-ob-sat" value="' + esc(profile.targetSat || '') + '" placeholder="1450"></label>' +
        '<label>Current GPA<input id="sc-ob-gpa" value="' + esc(profile.gpa || '') + '" placeholder="3.8"></label>' +
        '<label class="wide">College goal<input id="sc-ob-goal" value="' + esc(profile.collegeGoal || '') + '" placeholder="Build a balanced university list"></label>' +
        '<label class="wide">Weak areas<textarea id="sc-ob-weak" placeholder="SAT Algebra, Text Structure, APUSH Period 3">' + esc(profile.weakSubjects || '') + '</textarea></label>' +
      '</div>' +
      '<div class="sc-onboarding-actions"><button class="cc-btn" id="sc-ob-skip" type="button">Skip</button><button class="cc-btn primary" id="sc-ob-save" type="button">Save Setup</button></div>' +
    '</div>';
    document.body.appendChild(overlay);
    document.getElementById('sc-ob-skip').onclick = function () {
      localStorage.setItem(DONE_KEY, '1');
      overlay.remove();
    };
    document.getElementById('sc-ob-save').onclick = function () {
      saveOnboarding({
        name: document.getElementById('sc-ob-name').value.trim(),
        grade: document.getElementById('sc-ob-grade').value.trim(),
        targetSat: document.getElementById('sc-ob-sat').value.trim(),
        gpa: document.getElementById('sc-ob-gpa').value.trim(),
        goal: document.getElementById('sc-ob-goal').value.trim(),
        weak: document.getElementById('sc-ob-weak').value.trim()
      });
      overlay.remove();
      if (window.scCommandCenterRenderHome) window.scCommandCenterRenderHome();
      setTimeout(addHomeWidgets, 50);
    };
  }

  function patchRenderHome() {
    const old = window.scCommandCenterRenderHome;
    if (typeof old !== 'function' || old.__learningPatched) return;
    window.scCommandCenterRenderHome = function () {
      const result = old.apply(this, arguments);
      setTimeout(function () {
        addNav();
        addHomeWidgets();
      }, 0);
      return result;
    };
    window.scCommandCenterRenderHome.__learningPatched = true;
  }

  function init() {
    seedAttemptsFromStats();
    patchRenderHome();
    addNav();
    addHomeWidgets();
    setTimeout(function () { showOnboarding(false); }, 450);
  }

  window.StudentCompassData = {
    read: readState,
    write: writeState,
    update: updateState,
    recordAttempt,
    getMastery,
    getReviewQueue,
    saveOnboarding
  };
  window.showSkillMastery = showSkillMastery;
  window.showReviewMode = showReviewMode;
  window.scShowOnboarding = function () { showOnboarding(true); };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', function () { setTimeout(init, 250); });
})();
