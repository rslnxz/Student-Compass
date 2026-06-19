(function () {
  const SAT_EXAMS_KEY = 'sc_sat_practice_exams_v1';
  const COLLEGE_LIST_KEY = 'scCollegeList';
  const COLLEGE_NOTES_KEY = 'sc_university_compare_notes_v1';
  const WRITING_SCORES_KEY = 'sc_writing_score_tracker_v1';
  const FLAGGED_KEY = 'sc_flagged_questions_v1';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function readJSON(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '');
      return parsed || fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function allUniversities() {
    const base = Array.isArray(window.COLLEGE_DATA) ? window.COLLEGE_DATA : [];
    return base.filter(Boolean);
  }

  function universityById(id) {
    return allUniversities().find(item => item.id === id) || { id, name: id, city: '', state: '', type: 'University', selectivity: '', admit: 'Not listed', sat: 'Not listed', tuition: 'Not listed', deadline: 'Verify', strengths: [], fit: '' };
  }

  function selectedUniversities() {
    const list = readJSON(COLLEGE_LIST_KEY, {});
    const rows = [];
    ['reach', 'target', 'likely'].forEach(bucket => {
      (Array.isArray(list[bucket]) ? list[bucket] : []).forEach(id => rows.push({ bucket, school: universityById(id) }));
    });
    return rows;
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (_) {
      return 'Saved';
    }
  }

  function estimatePct(exam) {
    const total = exam.total || (exam.questions || []).length || 98;
    return Math.round(((exam.score || 0) / Math.max(total, 1)) * 100);
  }

  function miniBars(values, label) {
    const clean = values.map(Number).filter(n => Number.isFinite(n));
    if (!clean.length) {
      return '<div class="sc-empty-state compact">No trend data yet.</div>';
    }
    const max = Math.max(...clean, 1);
    const min = Math.min(...clean, max);
    const spread = Math.max(max - min, 1);
    return '<div class="sc-trend-bars" aria-label="' + esc(label) + '">' + clean.map(v => {
      const h = 26 + Math.round(((v - min) / spread) * 54);
      return '<i style="height:' + h + '%"><span>' + esc(v) + '</span></i>';
    }).join('') + '</div>';
  }

  function getSatExams() {
    const rows = readJSON(SAT_EXAMS_KEY, []);
    return Array.isArray(rows) ? rows : [];
  }

  function getFlaggedStrings() {
    const flags = readJSON(FLAGGED_KEY, []);
    return Array.isArray(flags) ? flags.map(String) : [];
  }

  function answerSection(answer) {
    if (answer._section) return answer._section;
    return /math|algebra|geometry|advanced|problem solving|data/i.test(answer.cat || '') ? 'math' : 'english';
  }

  function isFlaggedAnswer(answer) {
    const q = String(answer.q || '').slice(0, 90);
    return !!q && getFlaggedStrings().some(flag => flag.includes(q));
  }

  function renderSavedReview(examId, filter, skill) {
    const exam = getSatExams().find(item => item.id === examId);
    const root = document.getElementById('pt-review');
    if (!exam || !root) return;
    const answers = Array.isArray(exam.answers) ? exam.answers : [];
    const skills = [...new Set(answers.map(a => a.cat).filter(Boolean))].sort();
    let rows = answers;
    if (filter === 'wrong') rows = rows.filter(a => !a.correct);
    if (filter === 'flagged') rows = rows.filter(isFlaggedAnswer);
    if (filter === 'english') rows = rows.filter(a => answerSection(a) === 'english');
    if (filter === 'math') rows = rows.filter(a => answerSection(a) === 'math');
    if (skill) rows = rows.filter(a => a.cat === skill);

    let controls = document.getElementById('sc-saved-review-tools');
    if (!controls) {
      controls = document.createElement('div');
      controls.id = 'sc-saved-review-tools';
      controls.className = 'sc-saved-review-tools';
      root.insertAdjacentElement('beforebegin', controls);
    }
    const btns = [
      ['all', 'All'],
      ['wrong', 'Wrong only'],
      ['flagged', 'Flagged'],
      ['english', 'Reading & Writing'],
      ['math', 'Math']
    ];
    controls.innerHTML = '<div class="sc-review-filter-row">' + btns.map(pair => '<button type="button" class="' + (filter === pair[0] ? 'active' : '') + '" data-saved-review-filter="' + pair[0] + '" data-exam-id="' + esc(examId) + '">' + pair[1] + '</button>').join('') + '</div>' +
      '<label class="sc-skill-filter">Skill <select data-saved-review-skill data-exam-id="' + esc(examId) + '"><option value="">All skills</option>' + skills.map(item => '<option value="' + esc(item) + '"' + (item === skill ? ' selected' : '') + '>' + esc(item) + '</option>').join('') + '</select></label>';

    root.innerHTML = rows.length ? rows.map((a, index) => {
      const choices = Object.entries(a.c || {}).map(([key, value]) => '<div class="sc-review-choice ' + (key === a.a ? 'right' : key === a.userAnswer ? 'wrong' : '') + '"><b>' + esc(key) + '</b><span>' + esc(value) + '</span></div>').join('');
      return '<article class="sc-saved-review-card ' + (a.correct ? 'ok' : 'bad') + '">' +
        '<div class="sc-review-card-top"><span>' + String(index + 1).padStart(2, '0') + '</span><strong>' + esc(a.cat || 'SAT') + '</strong><em>' + (a.correct ? 'Correct' : 'Missed') + '</em></div>' +
        (a.passage ? '<div class="sc-review-passage">' + esc(a.passage) + '</div>' : '') +
        '<p>' + esc(a.q || '') + '</p>' +
        '<div class="sc-review-choices">' + choices + '</div>' +
        '<div class="sc-review-explain"><b>Your answer: ' + esc(a.userAnswer || '-') + ' | Correct: ' + esc(a.a || '-') + '</b><span>' + esc(a.e || '') + '</span></div>' +
      '</article>';
    }).join('') : '<div class="sc-empty-state">No questions match this filter.</div>';
  }

  function enhanceSavedExamPanel() {
    const card = document.getElementById('sat-saved-exams-card');
    if (!card || card.querySelector('.sc-saved-test-trend')) return;
    const exams = getSatExams().filter(exam => exam.status === 'complete');
    const values = exams.slice().reverse().map(exam => exam.estimatedScore || Math.round(400 + estimatePct(exam) * 12));
    card.insertAdjacentHTML('beforeend', '<section class="sc-saved-test-trend"><div><span>SAT score trend</span><strong>' + (values.length ? esc(values[values.length - 1]) : 'Start a full test') + '</strong></div>' + miniBars(values, 'SAT score trend') + '</section>');
  }

  function renderUniversityCompare() {
    ensurePage('s-university-compare');
    const page = document.getElementById('s-university-compare');
    const rows = selectedUniversities();
    const notes = readJSON(COLLEGE_NOTES_KEY, {});
    page.innerHTML = '<section class="sc-page-shell">' +
      '<div class="sc-page-hero"><div><span>University Selection</span><h1>Compare your list side by side.</h1><p>Use this when a school sounds good but you need the practical facts in one place: cost, admissions, SAT range, location, strengths, and personal notes.</p></div><button class="cc-btn primary" type="button" onclick="openToolPage(\'s-college\',\'nav-college\')">Add Universities</button></div>' +
      (rows.length ? '<div class="sc-table-wrap"><table class="sc-compare-table"><thead><tr><th>University</th><th>List</th><th>Location</th><th>Admit</th><th>SAT</th><th>Cost</th><th>Strengths</th><th>Notes</th></tr></thead><tbody>' +
      rows.map(row => {
        const c = row.school;
        return '<tr><td><strong>' + esc(c.name) + '</strong><small>' + esc(c.type || 'University') + '</small></td><td><span class="sc-bucket ' + esc(row.bucket) + '">' + esc(row.bucket) + '</span></td><td>' + esc([c.city, c.state].filter(Boolean).join(', ') || 'Not listed') + '</td><td>' + esc(c.admit || c.selectivity || 'Not listed') + '</td><td>' + esc(c.sat || 'Not listed') + '</td><td>' + esc(c.tuition || 'Not listed') + '</td><td>' + esc((c.strengths || []).slice(0, 3).join(', ') || c.fit || 'Research fit') + '</td><td><textarea data-university-note="' + esc(c.id) + '" placeholder="Why this school?">' + esc(notes[c.id] || '') + '</textarea></td></tr>';
      }).join('') + '</tbody></table></div>' : '<div class="sc-empty-state large"><b>No universities in your list yet.</b><span>Add reach, target, and likely schools first. Then this table becomes your decision board.</span><button class="cc-btn primary" onclick="openToolPage(\'s-college\',\'nav-college\')">Open University Selection</button></div>') +
      '</section>';
    if (typeof show === 'function') show('s-university-compare');
    if (typeof setNav === 'function') setNav('nav-university-compare');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function writingEntries() {
    const rows = readJSON(WRITING_SCORES_KEY, []);
    return Array.isArray(rows) ? rows : [];
  }

  function scoreMax(type) {
    return type === 'SAQ' ? 3 : type === 'DBQ' ? 7 : 6;
  }

  function writingRubrics(type) {
    if (type === 'SAQ') return [['claim', 'Claim'], ['evidence', 'Evidence'], ['explanation', 'Explanation']];
    if (type === 'LEQ') return [['thesis', 'Thesis'], ['context', 'Context'], ['specificEvidence', 'Specific Evidence'], ['evidenceArgument', 'Evidence Supports Argument'], ['reasoning', 'Historical Reasoning'], ['complexity', 'Complexity']];
    return [['thesis', 'Thesis'], ['context', 'Context'], ['docEvidenceBasic', 'Documents: 3+ Used'], ['docEvidenceStrong', 'Documents: 6+ Used'], ['outsideEvidence', 'Outside Evidence'], ['sourcing', 'Sourcing'], ['complexity', 'Complexity']];
  }

  function renderWritingTracker(type) {
    ensurePage('s-writing-tracker');
    type = type || 'DBQ';
    const page = document.getElementById('s-writing-tracker');
    const rows = writingEntries();
    const byType = rows.filter(row => row.type === type);
    const latest = byType[0];
    const rubric = writingRubrics(type);
    const trend = byType.slice(0, 8).reverse().map(row => row.total);
    page.innerHTML = '<section class="sc-page-shell sc-writing-tracker">' +
      '<div class="sc-page-hero"><div><span>APUSH Writing</span><h1>Rubric score tracker.</h1><p>Track DBQ, SAQ, and LEQ progress by rubric category so writing practice becomes measurable instead of vague.</p></div><button class="cc-btn" type="button" onclick="show(\'s-writing\');setNav(\'nav-writing\')">Open Writing Practice</button></div>' +
      '<div class="sc-writing-grid"><form id="sc-writing-score-form" class="sc-score-form"><label>Essay type<select id="sc-writing-type">' + ['DBQ', 'SAQ', 'LEQ'].map(item => '<option' + (item === type ? ' selected' : '') + '>' + item + '</option>').join('') + '</select></label><div id="sc-rubric-inputs" class="sc-rubric-inputs">' +
      rubric.map(pair => '<label>' + pair[1] + '<input type="number" min="0" max="1" value="' + (latest && latest[pair[0]] ? latest[pair[0]] : 0) + '" data-rubric="' + pair[0] + '"></label>').join('') +
      '</div><label>Note<textarea id="sc-writing-note" placeholder="What improved? What should be fixed next?"></textarea></label><button class="cc-btn primary" type="submit">Save Score</button></form>' +
      '<aside class="sc-writing-summary"><span>Latest ' + esc(type) + '</span><strong>' + (latest ? esc(latest.total + '/' + scoreMax(type)) : 'No score yet') + '</strong>' + miniBars(trend, type + ' trend') + '<p>' + (latest ? esc(latest.note || 'Keep tracking rubric categories after each practice response.') : 'Save your first rubric score to build a trend.') + '</p></aside></div>' +
      '<div class="sc-table-wrap"><table class="sc-compare-table"><thead><tr><th>Date</th><th>Type</th><th>Score</th><th>Rubric notes</th></tr></thead><tbody>' +
      (rows.length ? rows.map(row => '<tr><td>' + esc(formatDate(row.date)) + '</td><td>' + esc(row.type) + '</td><td><strong>' + esc(row.total + '/' + scoreMax(row.type)) + '</strong></td><td>' + esc(row.note || rubricSummary(row)) + '</td></tr>').join('') : '<tr><td colspan="4">No writing scores saved yet.</td></tr>') +
      '</tbody></table></div></section>';
    if (typeof show === 'function') show('s-writing-tracker');
    if (typeof setNav === 'function') setNav('nav-writing-tracker');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function rubricSummary(row) {
    return Object.keys(row).filter(key => !/^(type|date|total|note)$/.test(key)).map(key => key + ': ' + row[key]).join(', ');
  }

  function saveWritingScore(event) {
    event.preventDefault();
    const type = document.getElementById('sc-writing-type')?.value || 'DBQ';
    const entry = { type, date: new Date().toISOString(), note: document.getElementById('sc-writing-note')?.value || '' };
    document.querySelectorAll('#sc-rubric-inputs [data-rubric]').forEach(input => {
      entry[input.dataset.rubric] = Math.max(0, Math.min(1, Number(input.value || 0)));
    });
    entry.total = Object.keys(entry).filter(key => !/^(type|date|total|note)$/.test(key)).reduce((sum, key) => sum + Number(entry[key] || 0), 0);
    writeJSON(WRITING_SCORES_KEY, [entry, ...writingEntries()].slice(0, 60));
    renderWritingTracker(type);
  }

  function ensurePage(id) {
    if (document.getElementById(id)) return;
    const page = document.createElement('div');
    page.className = 'sec';
    page.id = id;
    const firstScript = document.querySelector('script');
    if (firstScript && firstScript.parentNode === document.body) document.body.insertBefore(page, firstScript);
    else document.body.appendChild(page);
  }

  function addDrawerLinks() {
    if (!document.getElementById('nav-university-compare')) {
      document.getElementById('nav-college')?.insertAdjacentHTML('afterend', '<button class="drawer-btn sub-item" id="nav-university-compare" onclick="showUniversityCompare();closeMenu()">University Compare</button>');
    }
    if (!document.getElementById('nav-writing-tracker')) {
      document.getElementById('nav-writing')?.insertAdjacentHTML('afterend', '<button class="drawer-btn sub-item" id="nav-writing-tracker" onclick="showWritingTracker();closeMenu()">Writing Tracker</button>');
    }
  }

  function addPageActions() {
    const college = document.getElementById('s-college');
    if (college && !college.querySelector('[data-open-university-compare]')) {
      college.insertAdjacentHTML('afterbegin', '<div class="sc-page-action-bar"><button class="cc-btn primary" type="button" data-open-university-compare>Compare Selected Universities</button></div>');
    }
    const writing = document.getElementById('s-writing');
    if (writing && !writing.querySelector('[data-open-writing-tracker]')) {
      writing.insertAdjacentHTML('afterbegin', '<div class="sc-page-action-bar"><button class="cc-btn primary" type="button" data-open-writing-tracker>Open Rubric Score Tracker</button></div>');
    }
  }

  function enhanceDashboard() {
    const dash = document.querySelector('.cc-dashboard');
    if (!dash || dash.querySelector('.sc-command-summary')) return;
    const exams = getSatExams();
    const completed = exams.filter(exam => exam.status === 'complete');
    const universities = selectedUniversities();
    const writing = writingEntries();
    const mastery = window.StudentCompassData?.getMastery ? window.StudentCompassData.getMastery() : [];
    dash.insertAdjacentHTML('afterbegin', '<div class="sc-command-summary">' +
      '<article><span>Saved tests</span><strong>' + exams.length + '/5</strong></article>' +
      '<article><span>Latest SAT</span><strong>' + (completed[0]?.estimatedScore || 'Start') + '</strong></article>' +
      '<article><span>Universities</span><strong>' + universities.length + '</strong></article>' +
      '<article><span>Writing logs</span><strong>' + writing.length + '</strong></article>' +
      '</div>');
    if (!dash.querySelector('.sc-progress-strip')) {
      dash.insertAdjacentHTML('beforeend', '<section class="sc-progress-strip"><div><span>Progress trend</span><strong>What changed recently</strong></div><div class="sc-mini-chart-grid">' +
        '<article><b>SAT</b>' + miniBars(completed.slice().reverse().map(exam => exam.estimatedScore || 0), 'SAT trend') + '</article>' +
        '<article><b>Mastery</b>' + miniBars(mastery.slice(0, 8).map(row => row.accuracy || 0), 'Skill mastery') + '</article>' +
        '<article><b>Writing</b>' + miniBars(writing.slice(0, 8).reverse().map(row => row.total), 'Writing trend') + '</article>' +
        '</div></section>');
    }
  }

  function enhanceEmptyStates() {
    document.querySelectorAll('.college-empty, .saved-exam-empty, .sc-empty-state').forEach(el => {
      el.classList.add('sc-polished-empty');
    });
  }

  function unifyHeaders() {
    document.querySelectorAll('.bc-page-head, .profile-hero, .cc-feature-page > h1, .card-title').forEach(el => {
      el.classList.add('sc-unified-type');
    });
  }

  function cleanupTextArtifacts() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const fixes = [
      [/Â·/g, '-'],
      [/Ã¢â‚¬Â¦/g, '...'],
      [/Ã¢Å¡Â /g, 'Warning:'],
      [/âœï¸/g, 'Writing'],
      [/Ã¢â‚¬â€œ/g, '-'],
      [/Ã¢â‚¬â€/g, '-'],
      [/Ã¢â‚¬â„¢/g, "'"]
    ];
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      let value = node.nodeValue;
      fixes.forEach(pair => { value = value.replace(pair[0], pair[1]); });
      if (value !== node.nodeValue) node.nodeValue = value;
    });
  }

  function init() {
    addDrawerLinks();
    addPageActions();
    enhanceSavedExamPanel();
    enhanceDashboard();
    enhanceEmptyStates();
    unifyHeaders();
    cleanupTextArtifacts();
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-open-university-compare]')) return renderUniversityCompare();
    if (event.target.closest('[data-open-writing-tracker]')) return renderWritingTracker();
    const reviewFilter = event.target.closest('[data-saved-review-filter]');
    if (reviewFilter) return renderSavedReview(reviewFilter.dataset.examId, reviewFilter.dataset.savedReviewFilter || 'all', document.querySelector('[data-saved-review-skill]')?.value || '');
  });

  document.addEventListener('change', event => {
    if (event.target.matches('[data-university-note]')) {
      const notes = readJSON(COLLEGE_NOTES_KEY, {});
      notes[event.target.dataset.universityNote] = event.target.value;
      writeJSON(COLLEGE_NOTES_KEY, notes);
    }
    if (event.target.matches('[data-saved-review-skill]')) {
      const active = document.querySelector('[data-saved-review-filter].active')?.dataset.savedReviewFilter || 'all';
      renderSavedReview(event.target.dataset.examId, active, event.target.value);
    }
    if (event.target.id === 'sc-writing-type') renderWritingTracker(event.target.value);
  });

  document.addEventListener('submit', event => {
    if (event.target.id === 'sc-writing-score-form') saveWritingScore(event);
  });

  const oldReview = window.reviewPracticeExam;
  if (typeof oldReview === 'function' && !oldReview.__visualFunctionalUpgrade) {
    window.reviewPracticeExam = function (id) {
      const result = oldReview.apply(this, arguments);
      setTimeout(() => renderSavedReview(id, 'all', ''), 80);
      return result;
    };
    window.reviewPracticeExam.__visualFunctionalUpgrade = true;
  }

  window.showUniversityCompare = renderUniversityCompare;
  window.showCollegeCompare = renderUniversityCompare;
  window.showWritingTracker = renderWritingTracker;

  ['show', 'showSAT', 'showProgressCenter', 'showSkillMastery', 'showReviewMode'].forEach(name => {
    const fn = window[name];
    if (typeof fn !== 'function' || fn.__visualFunctionalUpgrade) return;
    window[name] = function () {
      const result = fn.apply(this, arguments);
      setTimeout(init, 80);
      return result;
    };
    window[name].__visualFunctionalUpgrade = true;
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', () => setTimeout(init, 250));
})();
