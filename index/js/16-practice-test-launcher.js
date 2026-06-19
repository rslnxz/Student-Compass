(function () {
  const SAVE_KEY = 'sc_sat_practice_exams_v1';
  const state = {
    active: false,
    savedId: null,
    startedAt: null,
    questions: [],
    index: 0,
    score: 0,
    answers: []
  };

  function shuffleCopy(items) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getBank(name) {
    const bank = window[name];
    return Array.isArray(bank) ? bank : [];
  }

  function buildPracticeTestQuestions() {
    const english = shuffleCopy(getBank('SAT_ENG'));
    const math = shuffleCopy(getBank('SAT_MATH'));
    const rw1 = english.slice(0, 27).map(q => ({ ...q, _module: 'Reading & Writing - Module 1', _section: 'english' }));
    const rw2 = english.slice(27, 54).map(q => ({ ...q, _module: 'Reading & Writing - Module 2', _section: 'english' }));
    const math1 = math.slice(0, 22).map(q => ({ ...q, _module: 'Math - Module 1', _section: 'math' }));
    const math2 = math.slice(22, 44).map(q => ({ ...q, _module: 'Math - Module 2', _section: 'math' }));
    return [...rw1, ...rw2, ...math1, ...math2];
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function readSaved() {
    try {
      const list = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]');
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }

  function writeSaved(list) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(list.slice(0, 5)));
    renderSavedExams();
  }

  function estimateScore(score, total) {
    const percent = Math.round((score / Math.max(total, 1)) * 100);
    return Math.max(400, Math.min(1600, Math.round((400 + percent * 12) / 10) * 10));
  }

  function snapshot(status) {
    const total = state.questions.length || 98;
    return {
      id: state.savedId || ('sat-' + Date.now()),
      status,
      startedAt: state.startedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: status === 'complete' ? new Date().toISOString() : null,
      questions: state.questions,
      index: state.index,
      score: state.score,
      answers: state.answers,
      total,
      estimatedScore: estimateScore(state.score, total)
    };
  }

  function saveCurrent(status) {
    if (!state.questions.length) return null;
    const exam = snapshot(status);
    state.savedId = exam.id;
    const existing = readSaved().filter(item => item.id !== exam.id);
    writeSaved([exam, ...existing]);
    return exam;
  }

  function loadExam(id) {
    return readSaved().find(item => item.id === id);
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch (_) {
      return 'Saved exam';
    }
  }

  function renderSavedExams() {
    const root = document.getElementById('sat-saved-exams');
    if (!root) return;
    const list = readSaved();
    if (!list.length) {
      root.innerHTML = '<div class="saved-exam-empty">No saved full practice exams yet.</div>';
      return;
    }
    root.innerHTML = list.map(exam => {
      const answered = (exam.answers || []).length;
      const total = exam.total || (exam.questions || []).length || 98;
      const label = exam.status === 'complete' ? `${exam.estimatedScore || estimateScore(exam.score || 0, total)} estimated` : `${answered}/${total} answered`;
      const primary = exam.status === 'complete'
        ? `<button class="btn-outline sat-review-exam-btn" type="button" data-review-exam="${exam.id}">Review</button>`
        : `<button class="btn sat-resume-exam-btn" type="button" data-resume-exam="${exam.id}">Resume</button>`;
      return `<div class="saved-exam-row">
        <div><strong>${exam.status === 'complete' ? 'Completed SAT Practice' : 'Unfinished SAT Practice'}</strong><span>${formatDate(exam.updatedAt)} · ${label}</span></div>
        <div class="saved-exam-actions">${primary}<button class="btn-outline sat-delete-exam-btn" type="button" data-delete-exam="${exam.id}">Delete</button></div>
      </div>`;
    }).join('');
  }

  function ensureSavedExamsPanel() {
    const startCard = document.querySelector('.sat-polish-test-card');
    if (startCard && !document.getElementById('sat-saved-exams-card')) {
      const card = document.createElement('div');
      card.className = 'card sat-saved-exams-card';
      card.id = 'sat-saved-exams-card';
      card.innerHTML = '<div class="card-title">Saved Full SAT Exams</div><p class="saved-exam-note">Up to 5 practice exams are saved on this browser. Unfinished tests can be resumed; completed tests can be reviewed.</p><div id="sat-saved-exams"></div>';
      startCard.insertAdjacentElement('afterend', card);
    }
    renderSavedExams();
  }

  function showError(err) {
    if (typeof renderSATError === 'function') {
      renderSATError(err);
      return;
    }
    setText('sq-text', 'The SAT practice test could not start. Error: ' + (err && err.message ? err.message : err));
  }

  function renderQuestion() {
    const q = state.questions[state.index];
    if (!q) {
      showResults();
      return;
    }

    const total = state.questions.length;
    const isMath = q._section === 'math';
    setText('sq-lbl', `${q._module} - Question ${state.index + 1} of ${total}`);
    setText('sq-score', `Score: ${state.score}/${state.index}`);
    const bar = document.getElementById('sq-bar');
    if (bar) bar.style.width = `${Math.round((state.index / total) * 100)}%`;

    const timer = document.getElementById('pt-timer-display');
    if (timer) timer.style.display = 'none';

    const tag = document.getElementById('sq-tag');
    if (tag) tag.innerHTML = `<span class="sat-quiz-unit-tag ${isMath ? 'math' : 'eng'}">${q.cat || 'SAT Practice Test'}</span>`;

    const stimEl = document.getElementById('sq-stimulus');
    if (stimEl) {
      if (q.passage) {
        stimEl.innerHTML = `<div class="sat-passage"><div class="sat-passage-src">Passage</div>${String(q.passage).replace(/\n/g, '<br>')}</div>`;
        stimEl.style.display = 'block';
      } else if (q.formula) {
        stimEl.innerHTML = `<div class="sat-formula">${q.formula}</div>`;
        stimEl.style.display = 'block';
      } else {
        stimEl.innerHTML = '';
        stimEl.style.display = 'none';
      }
    }

    setText('sq-text', q.q || '');
    const expl = document.getElementById('sq-expl');
    if (expl) {
      expl.style.display = 'none';
      expl.innerHTML = '';
    }

    const next = document.getElementById('sq-next');
    if (next) {
      next.style.display = 'none';
      next.textContent = state.index + 1 >= total ? 'See Results ->' : 'Next ->';
      next.onclick = nextQuestion;
    }

    const choices = document.getElementById('sq-choices');
    if (!choices) return;
    choices.innerHTML = '';
    Object.entries(q.c || {}).forEach(([key, value]) => {
      const btn = document.createElement('button');
      btn.className = 'choice';
      btn.type = 'button';
      btn.innerHTML = `<span class="key" style="border-color:${isMath ? '#a78bfa' : '#4f8ef7'};color:${isMath ? '#a78bfa' : '#4f8ef7'}">${key}</span><span>${value}</span>`;
      btn.addEventListener('click', () => chooseAnswer(key));
      choices.appendChild(btn);
    });
  }

  function chooseAnswer(key) {
    const q = state.questions[state.index];
    if (!q) return;
    const correct = key === q.a;
    if (correct) state.score += 1;
    state.answers.push({ ...q, userAnswer: key, correct });
    if (window.StudentCompassData) {
      window.StudentCompassData.recordAttempt({
        domain: q._section === 'math' ? 'SAT Math' : 'SAT Reading & Writing',
        skill: q.cat || 'Full SAT Practice',
        correct,
        question: q.q,
        userAnswer: key,
        correctAnswer: q.a,
        explanation: q.e,
        source: 'Full SAT Practice'
      });
    }
    saveCurrent('unfinished');

    document.querySelectorAll('#sq-choices .choice').forEach(btn => {
      const btnKey = btn.querySelector('.key')?.textContent;
      btn.disabled = true;
      if (btnKey === q.a) btn.classList.add('correct');
      else if (btnKey === key) btn.classList.add('wrong');
      else btn.classList.add('dim');
    });

    const expl = document.getElementById('sq-expl');
    if (expl) {
      expl.className = 'expl ' + (correct ? 'ok' : 'bad');
      expl.innerHTML = `<span class="verdict ${correct ? 'ok' : 'bad'}">${correct ? 'Correct.' : 'Answer: ' + q.a + '.'}</span> ${q.e || ''}`;
      expl.style.display = 'block';
    }

    const next = document.getElementById('sq-next');
    if (next) next.style.display = 'flex';
  }

  function nextQuestion() {
    state.index += 1;
    saveCurrent(state.index >= state.questions.length ? 'complete' : 'unfinished');
    renderQuestion();
  }

  function showResults(fromSaved) {
    state.active = false;
    const total = state.questions.length || 1;
    const percent = Math.round((state.score / total) * 100);
    const estimated = estimateScore(state.score, total);
    const saved = fromSaved ? null : saveCurrent('complete');

    setText('sr-score', `${estimated}`);
    setText('sr-grade', `${state.score}/${total} correct`);
    setText('sr-msg', `Estimated full-test performance: ${percent}%. ${saved ? 'This exam was saved for review.' : 'Review your saved exam below.'}`);

    const plan = document.getElementById('pt-study-items');
    if (plan) {
      const missed = state.answers.filter(a => !a.correct);
      const weakCats = [...new Set(missed.map(a => a.cat).filter(Boolean))].slice(0, 5);
      plan.innerHTML = (weakCats.length ? weakCats : ['Mixed SAT review']).map(cat =>
        `<div class="study-item"><strong>${cat}</strong><span>Review explanations, then do a 10-question unit set.</span></div>`
      ).join('');
    }

    const review = document.getElementById('pt-review');
    if (review) {
      review.innerHTML = state.answers.map((a, i) =>
        `<div class="review-item ${a.correct ? 'ok' : 'bad'}"><strong>${i + 1}. ${a.cat || 'SAT'}</strong><p>${a.q || ''}</p><span>Your answer: ${a.userAnswer || '-'} | Correct: ${a.a || '-'}</span></div>`
      ).join('');
    }

    if (typeof show === 'function') show('s-sat-results');
    if (typeof setNav === 'function') setNav('nav-sat');
  }

  function startPracticeTest() {
    try {
      const questions = buildPracticeTestQuestions();
      if (questions.length < 20) throw new Error('SAT question banks are not loaded.');
      state.active = true;
      state.savedId = null;
      state.startedAt = new Date().toISOString();
      state.questions = questions;
      state.index = 0;
      state.score = 0;
      state.answers = [];
      window._ptMode = true;
      saveCurrent('unfinished');
      if (typeof resetPauseControl === 'function') resetPauseControl();
      if (typeof show === 'function') show('s-sat-quiz');
      if (typeof setNav === 'function') setNav('nav-sat');
      renderQuestion();
    } catch (err) {
      console.error('Practice test start failed', err);
      if (typeof show === 'function') show('s-sat-quiz');
      if (typeof setNav === 'function') setNav('nav-sat');
      showError(err);
    }
  }

  function resumeExam(id) {
    const exam = loadExam(id);
    if (!exam || !Array.isArray(exam.questions) || !exam.questions.length) return;
    state.active = true;
    state.savedId = exam.id;
    state.startedAt = exam.startedAt || new Date().toISOString();
    state.questions = exam.questions;
    state.score = exam.score || 0;
    state.answers = Array.isArray(exam.answers) ? exam.answers : [];
    state.index = Math.min(Math.max(exam.index || 0, state.answers.length), state.questions.length - 1);
    window._ptMode = true;
    if (typeof resetPauseControl === 'function') resetPauseControl();
    if (typeof show === 'function') show('s-sat-quiz');
    if (typeof setNav === 'function') setNav('nav-sat');
    renderQuestion();
  }

  function reviewExam(id) {
    const exam = loadExam(id);
    if (!exam || !Array.isArray(exam.questions)) return;
    state.active = false;
    state.savedId = exam.id;
    state.startedAt = exam.startedAt || null;
    state.questions = exam.questions;
    state.index = exam.index || exam.questions.length;
    state.score = exam.score || 0;
    state.answers = Array.isArray(exam.answers) ? exam.answers : [];
    window._ptMode = false;
    showResults(true);
  }

  function deleteExam(id) {
    writeSaved(readSaved().filter(item => item.id !== id));
  }

  function exitPracticeTest() {
    if (state.active) saveCurrent('unfinished');
    state.active = false;
    window._ptMode = false;
    if (typeof resetPauseControl === 'function') resetPauseControl();
    if (typeof showSAT === 'function') showSAT();
    else if (typeof show === 'function') show('s-sat');
    renderSavedExams();
  }

  window.startPracticeTest = startPracticeTest;
  window.resumePracticeExam = resumeExam;
  window.reviewPracticeExam = reviewExam;
  window.exitPracticeTest = exitPracticeTest;

  document.addEventListener('click', function (event) {
    const btn = event.target.closest('#pt-start-btn, [data-start-practice-test], [data-resume-exam], [data-review-exam], [data-delete-exam], #s-sat-quiz .test-exit-btn');
    if (!btn) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (btn.matches('#s-sat-quiz .test-exit-btn')) return exitPracticeTest();
    if (btn.dataset.resumeExam) return resumeExam(btn.dataset.resumeExam);
    if (btn.dataset.reviewExam) return reviewExam(btn.dataset.reviewExam);
    if (btn.dataset.deleteExam) return deleteExam(btn.dataset.deleteExam);
    return startPracticeTest();
  }, true);

  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('pt-start-btn');
    if (btn) {
      btn.type = 'button';
      btn.setAttribute('data-start-practice-test', 'true');
    }
    ensureSavedExamsPanel();
  });

  if (document.readyState !== 'loading') ensureSavedExamsPanel();
})();
