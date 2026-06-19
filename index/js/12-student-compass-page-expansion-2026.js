(function(){
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function step(title, copy){
    return '<div class="sc-exp-step"><b>'+esc(title)+'</b><span>'+esc(copy)+'</span></div>';
  }
  function meta(items){
    return '<div class="sc-exp-meta">'+items.map(function(x){return '<span>'+esc(x)+'</span>';}).join('')+'</div>';
  }
  function bars(items){
    return '<div class="sc-bars">'+items.map(function(x){return '<div class="sc-bar" style="--w:'+esc(x.w)+'"><span><b>'+esc(x.name)+'</b><em>'+esc(x.value)+'</em></span></div>';}).join('')+'</div>';
  }
  function checklist(items){
    return '<div class="sc-checklist">'+items.map(function(x){return '<div><strong>'+esc(x[0])+'</strong> '+esc(x[1])+'</div>';}).join('')+'</div>';
  }
  function visual(kind){
    if(kind === 'bars') return '<div class="sc-exp-visual">'+bars([{name:'Diagnose',value:'Fast',w:'82%'},{name:'Drill',value:'Daily',w:'68%'},{name:'Review',value:'Deep',w:'74%'},{name:'Retest',value:'Weekly',w:'58%'}])+'</div>';
    return '<div class="sc-exp-visual"><div class="sc-map-graphic">'+
      '<div class="sc-map-node"><div class="sc-map-dot">1</div><div><b>Set the goal</b><span>Know what this page is helping you improve.</span></div></div>'+
      '<div class="sc-map-node"><div class="sc-map-dot">2</div><div><b>Do the work</b><span>Use the calculator, drill, search, guide, or writing tool.</span></div></div>'+
      '<div class="sc-map-node"><div class="sc-map-dot">3</div><div><b>Review the result</b><span>Turn the output into one specific next action.</span></div></div>'+
      '</div></div>';
  }
  function expansion(title, copy, steps, options){
    options=options||{};
    return '<div class="sc-expanded-page" data-sc-expanded="1">'+
      '<div class="sc-exp-hero">'+
        '<section class="sc-exp-panel">'+
          '<div class="sc-exp-kicker">'+esc(options.kicker||'Page upgrade')+'</div>'+
          '<h2 class="sc-exp-title">'+esc(title)+'</h2>'+
          '<p class="sc-exp-copy">'+esc(copy)+'</p>'+
          meta(options.meta||['Built for action','Clean workflow','Progress-ready'])+
        '</section>'+
        visual(options.visual)+
      '</div>'+
      '<section class="sc-exp-panel">'+
        '<div class="sc-exp-kicker">'+esc(options.stepsLabel||'How to use this page')+'</div>'+
        '<div class="sc-exp-grid">'+steps.map(function(x){return step(x[0],x[1]);}).join('')+'</div>'+
      '</section>'+
      (options.band||'')+
    '</div>';
  }
  function band(title, copy, list){
    return '<section class="sc-exp-band"><div class="sc-exp-split"><div><div class="sc-exp-kicker">Professional workflow</div><h2 class="sc-exp-title">'+esc(title)+'</h2><p class="sc-exp-copy">'+esc(copy)+'</p></div>'+checklist(list)+'</div></section>';
  }
  function insertAfterHead(id, html){
    var page=document.getElementById(id);
    if(!page || page.querySelector('[data-sc-expanded="1"]')) return;
    var target=page.querySelector('.bc-page-head,.profile-hero,.pt-hero,.hero') || page.firstElementChild;
    if(target) target.insertAdjacentHTML('afterend',html);
    else page.insertAdjacentHTML('afterbegin',html);
  }
  function addHomeExpansion(){
    var home=document.querySelector('#s-landing .sc-home');
    if(!home || home.querySelector('[data-sc-home-extra="1"]')) return;
    home.insertAdjacentHTML('beforeend',
      '<section class="sc-section" data-sc-home-extra="1">'+
        '<div class="sc-section-head"><h2>Built for the way students actually decide what to do next.</h2><p>The product is organized around action, not content dumping: diagnose, practice, review, plan, repeat.</p></div>'+
        '<div class="sc-product-band">'+
          '<div class="sc-story"><h3>Why students will come back.</h3><p>Most study sites feel endless. Student Compass gives a short loop, visible progress, and practical school planning in the same place. That combination creates daily usefulness instead of one-time browsing.</p>'+meta(['Daily loop','Weak spot focus','School planning','University list'])+'</div>'+
          '<div class="sc-pricing"><h3>Future monetization paths.</h3><p>Keep the core free. Add optional tiers later without changing the promise.</p><div class="sc-price-row"><div><strong>Sync</strong><span>Cross-device account backup</span></div><div><strong>Coach</strong><span>AI plan and review assistant</span></div><div><strong>Advisor</strong><span>College planning exports</span></div></div></div>'+
        '</div>'+
      '</section>'
    );
  }
  function expandPages(){
    insertAfterHead('s-sat', expansion(
      'SAT prep that feels like a control room, not a question dump.',
      'Students need to know what the result means, what skill to drill next, and when to take a full practice test. This page now frames SAT work as a repeatable score-growth system.',
      [['Pick the mode','Use unit practice when a skill is weak, drills when timing is weak, and the full test when stamina needs proof.'],['Review misses','Treat every wrong answer as data: concept gap, reading error, timing error, or careless mistake.'],['Retest with purpose','A full test is useful only after a focused practice block; otherwise it just confirms the same weak spots.']],
      {kicker:'Digital SAT system',meta:['Full test','Unit drills','Vocabulary','Score diagnosis'],visual:'bars',
       band:band('Score growth loop','The best SAT products make the next practice step obvious. Student Compass should keep moving toward that standard.',[['Official familiarity:','Use full-test pacing so students are not surprised by digital SAT structure.'],['Weak-spot priority:','Put the highest-return skill before random review.'],['Stamina training:','Longer sessions should be planned, not accidental.']])}
    ));
    insertAfterHead('s-start', expansion(
      'APUSH practice built around evidence, causation, and period fluency.',
      'The strongest APUSH students do not memorize isolated facts. They connect documents, context, chronology, and historical reasoning under time pressure.',
      [['Choose a period','Start with the era you are studying in class or the one with the lowest accuracy.'],['Read the stimulus first','Train the habit of using the document, image, chart, or excerpt before guessing from memory.'],['Explain the miss','After each answer, identify whether the problem was content, chronology, or reasoning.']],
      {kicker:'APUSH mastery studio',meta:['9 periods','Stimulus practice','Historical reasoning','Exam style'],
       band:band('APUSH should feel like a history lab','The page now pushes students toward real AP skills: sourcing, contextualization, comparison, continuity, and causation.',[['Chronology:','Know what came before and after the event.'],['Document use:','Answer from the evidence, not vibes.'],['Reasoning:','Name the historical thinking skill being tested.']])}
    ));
    insertAfterHead('s-gpa', expansion(
      'GPA planning that protects ambition from overload.',
      'A strong transcript is not just the highest possible course level. It is the best sustainable balance between rigor, grades, interests, and recovery time.',
      [['Calculate honestly','Use current grades first; do not plan from the GPA you wish you had.'],['Balance rigor','Add AP or Honors where the subject strength is real. Protect core grades first.'],['Plan the story','Course choices should point toward the academic direction you want colleges to understand.']],
      {kicker:'Transcript strategy',meta:['Weighted GPA','Course rigor','College signal','Balance'],
       band:band('Course selection rules','Use this page like a counselor conversation before registration opens.',[['Protect GPA:','A hard class that destroys every other grade is not strategic.'],['Show direction:','Harder courses matter most when they connect to interests.'],['Ask early:','Counselors can explain local weighting and schedule limits.']])}
    ));
    insertAfterHead('s-college', expansion(
      'University selection should be a fit system, not a prestige chase.',
      'The strongest list has ambition, realism, affordability, and schools the student would actually attend. Search is only useful when it turns into a balanced list.',
      [['Search broadly','Start with location, cost, major, selectivity, and support instead of brand name.'],['Sort by fit','Reach, target, and likely should reflect actual admit chances and affordability.'],['Verify officially','Before applying, check each university site and Common Data Set for current admissions numbers.']],
      {kicker:'Admissions strategy',meta:['Reach','Target','Likely','Cost fit'],
       band:band('What belongs in a good list','A professional college page should help students avoid both under-reaching and prestige panic.',[['Academic fit:','Major, course offerings, research, class size, and support.'],['Financial fit:','Net price, scholarships, aid, and travel cost.'],['Personal fit:','Location, community, safety, climate, and student life.']])}
    ));
    insertAfterHead('s-school', expansion(
      'A practical guide for students entering the U.S. school system.',
      'This page should reduce confusion fast: credits, counselors, class levels, GPA, transcripts, activities, and what matters for college later.',
      [['Learn the map','Understand grade levels, semesters, credits, and class types before picking courses.'],['Meet the counselor','Bring transcript questions, graduation requirements, and AP/Honors questions early.'],['Build proof','Grades, activities, projects, tests, and recommendations all become part of the application story.']],
      {kicker:'New student orientation',meta:['Credits','Counselors','Class levels','College path'],
       band:band('Questions to ask at school','International and transfer students should not have to guess the rules.',[['Graduation:','Which credits do I already have and which are missing?'],['Course level:','Can I enter Honors/AP now or next semester?'],['College path:','What testing, activities, and deadlines should I know this year?']])}
    ));
    insertAfterHead('s-fc', expansion(
      'Vocabulary that sticks because it is reviewed at the right time.',
      'SAT vocabulary is not about memorizing a giant list once. The winning system is repeated exposure, roots, context, and fast recall.',
      [['Flip actively','Say the meaning before revealing the card. Passive recognition is weaker than retrieval.'],['Mark honestly','Known means you can define and use the word, not just that it looks familiar.'],['Review roots','Roots help you decode unfamiliar words when the exact word is not in the deck.']],
      {kicker:'Retention system',meta:['SAT words','Roots','Recall','Review loop'],visual:'bars',
       band:band('Better vocab habits','The deck should feel like training, not a word list.',[['Context:','Connect each word to a sentence or situation.'],['Spacing:','Return to difficult words later instead of grinding one session.'],['Transfer:','Use roots to attack new words on test day.']])}
    ));
    insertAfterHead('s-profile', expansion(
      'The profile page becomes the student cockpit.',
      'A useful dashboard should not just store information. It should show the next move based on GPA, SAT practice, APUSH accuracy, and university list progress.',
      [['Update inputs','Keep GPA, SAT score, and university list current. Old data creates bad advice.'],['Read the gaps','Use missing fields as a checklist for what to complete next.'],['Act weekly','Pick one SAT task, one school planning task, and one application task each week.']],
      {kicker:'Student operating system',meta:['GPA','SAT','Universities','Accuracy'],
       band:band('Dashboard standard','The best dashboard answers: where am I, what matters, and what do I do next?', [['Status:','Show current score, GPA, list size, and accuracy.'],['Signal:','Highlight weak spots and missing information.'],['Action:','Send students directly to the tool that fixes the gap.']])}
    ));
    insertAfterHead('s-ach', expansion(
      'Achievements should reward real progress, not empty clicks.',
      'Good achievements make students feel momentum while still pointing toward meaningful practice: accuracy, consistency, completion, and review discipline.',
      [['Earn XP through work','Quizzes, drills, flashcards, and review should drive progress.'],['Watch the trend','A streak matters only if accuracy and completion are improving too.'],['Unlock milestones','Use achievements as a map of what to try next.']],
      {kicker:'Motivation system',meta:['XP','Levels','Milestones','Consistency'],
       band:band('Achievement design','Professional student products reward behavior that actually improves outcomes.',[['Consistency:','Short daily work beats rare cram sessions.'],['Accuracy:','Reward mastery, not just volume.'],['Breadth:','Encourage SAT, APUSH, GPA, and planning progress.']])}
    ));
    insertAfterHead('s-purpose', expansion(
      'The mission: make the U.S. school path less confusing.',
      'Student Compass exists for students who are trying to understand classes, tests, GPA, college choices, and expectations without having a private counselor explain every step.',
      [['Use it free','The starting promise stays simple: open the site and work.'],['Leave stories','Recommendations and impact comments help shape what gets built next.'],['Build with students','Feedback should become product decisions, not a decorative form.']],
      {kicker:'Mission page',meta:['Free access','Student stories','Community feedback','Future roadmap'],
       band:band('What makes this worth building','The site wins when students feel less lost and more in control.',[['Clarity:','Explain systems that schools often assume students already understand.'],['Action:','Turn confusion into one next task.'],['Access:','Keep the core tools free for students who need them most.']])}
    ));
    insertAfterHead('s-feedback', expansion(
      'Feedback should feel like a product lab.',
      'This page is where users can report broken parts, request missing tools, and suggest improvements that make the site more useful for real students.',
      [['Report precisely','Name the page, what happened, and what you expected.'],['Suggest additions','Ask for tools, content, or workflows that would help school planning.'],['Prioritize impact','The best ideas help many students, not just one edge case.']],
      {kicker:'Product feedback',meta:['Bugs','Features','Content','Design'],
       band:band('Roadmap candidates','These are natural next expansions once the core app feels polished.',[['Accounts:','Optional sync across devices.'],['Study plans:','Personal schedules based on test date and weak spots.'],['Exports:','Printable counselor and college planning summaries.']])}
    ));
    insertAfterHead('s-writing', expansion(
      'APUSH writing practice should teach structure before it grades style.',
      'DBQ, SAQ, and LEQ writing becomes less scary when students know the job of each sentence: claim, evidence, reasoning, and complexity.',
      [['Pick the format','SAQ trains concise evidence. DBQ trains documents. LEQ trains argument and historical reasoning.'],['Build the skeleton','Write thesis, evidence buckets, and reasoning before polishing sentences.'],['Review the rubric','Every paragraph should earn a point or support one.']],
      {kicker:'Writing studio',meta:['DBQ','SAQ','LEQ','Rubric skills'],
       band:band('Writing checklist','Good writing pages reduce anxiety by making the rubric visible.',[['Thesis:','Answer the prompt directly.'],['Evidence:','Use specific facts or documents.'],['Reasoning:','Explain why the evidence proves the claim.']])}
    ));
    ['s-dbq','s-saq','s-leq'].forEach(function(id){
      insertAfterHead(id, expansion(
        id==='s-dbq'?'DBQ lab: documents into argument.':id==='s-saq'?'SAQ lab: concise evidence under pressure.':'LEQ lab: build a defensible historical argument.',
        id==='s-dbq'?'Use the documents to build categories, then connect outside evidence and historical context.':id==='s-saq'?'Answer each part directly, use one specific piece of evidence, and stop before the response becomes an essay.':'Start with a thesis, choose a reasoning skill, and build body paragraphs around specific evidence.',
        [['Read the task','Underline the verb and the historical thinking skill.'],['Plan before writing','Spend a few minutes choosing evidence and structure.'],['Score yourself','Match each sentence to the rubric point it is trying to earn.']],
        {kicker:'AP writing lab',meta:['Thesis','Evidence','Reasoning','Rubric']}
      ));
    });
    insertAfterHead('s-timeline', expansion(
      'The timeline should connect events into cause-and-effect chains.',
      'Chronology is more useful when students see patterns: migration, conflict, reform, expansion, rights, economics, and political change over time.',
      [['Scan the era','Start with the broad period before memorizing individual events.'],['Connect causes','Ask what changed, what continued, and who benefited.'],['Use it for writing','Timeline knowledge becomes evidence in DBQ, SAQ, and LEQ responses.']],
      {kicker:'History map',meta:['Chronology','Causation','Continuity','Evidence'],visual:'bars'}
    ));
  }
  function cleanupText(){
    var map={
      '|MODULE_01_ - DIGITAL SAT':'Digital SAT',
      '|MODULE_02_ - APUSH':'APUSH Practice',
      '|MODULE_03_ - VOCAB DECK':'Vocabulary Deck',
      '|MODULE_05_ - ORIENTATION':'U.S. School System',
      '|MODULE_06_ - UNIVERSITY SELECTION':'University Selection',
      '|PROFILE_ - ALL INFORMATION':'Profile Dashboard',
      '|FEEDBACK_':'Comments and Feedback',
      '|CURRICULUM_':'Curriculum',
      '|WHY_':'Why it works',
      '|SYSTEM_METRICS_':'Inside Compass',
      '|RUN_LOOP_':'Daily loop',
      '|FAQ_':'Questions',
      '|RUN_':'Start now',
      'LIVE_STACK':'Live tools',
      'COURSE_THESIS':'Why it works',
      'ENROLLMENT_OPEN':'Free access',
      'FREE / NO_LOGIN':'Free / no login',
      'LAUNCH_SAT_ ->':'Start SAT Practice',
      'EXPLORE_APUSH_':'Practice APUSH',
      'OPEN_':'Open',
      'LAUNCH_COMPASS_ ->':'Launch Compass',
      'SAT_PREP_ ->':'SAT Prep',
      'APUSH_':'APUSH',
      'GPA_TOOL_':'GPA Tool',
      'SAT_QUESTIONS':'SAT questions',
      'APUSH_CARDS':'APUSH cards',
      'GPA_TRACKER':'GPA tracker',
      'SHIP_TIME':'Available now',
      'MAX_SCORE':'Max score',
      'QUESTIONS':'Questions',
      '4.0_SCALE':'4.0 scale',
      'WEIGHTED_GPA':'Weighted GPA',
      'AP_STRATEGY':'AP strategy',
      'FULL_PRACTICE_TEST':'Full practice test',
      'VOCAB_DECK':'Vocab deck',
      'LOCAL_PROFILE':'Local profile',
      'COLLEGE_LIST':'University list',
      'ACADEMIC_SNAPSHOT':'Academic snapshot',
      '200+_QUESTIONS':'200+ questions',
      '1491->PRESENT':'1491 to present',
      '9_PERIODS':'9 periods'
    };
    document.querySelectorAll('.bc-label,.bc-pill,.card-title,.pt-info-lbl,.unit-tag,.college-tag,.profile-badge,button,.bc-stack span,.stat-counter-label,.bc-stat-cell div,.bc-outcome-top div').forEach(function(el){
      var t=(el.textContent||'').trim();
      if(map[t]) el.textContent=map[t];
      el.style.letterSpacing='0';
      el.style.textTransform='none';
    });
    document.querySelectorAll('button').forEach(function(btn){
      btn.textContent=btn.textContent
        .replace(/_/g,' ')
        .replace(/\s*-\s*>/g,'')
        .replace(/\s+/g,' ')
        .trim();
    });
  }
  function visualMarkup(type){
    if(type === 'sat') return '<div class="sc-page-visual" data-label="Score diagnosis and practice loop" aria-hidden="true"><div class="sc-v-icon">SAT</div><div class="sc-v-ring"></div><div class="sc-v-bars"><i style="--w:82%"></i><i style="--w:64%"></i><i style="--w:74%"></i></div></div>';
    if(type === 'apush') return '<div class="sc-page-visual" data-label="Evidence, chronology, reasoning" aria-hidden="true"><div class="sc-v-icon">AP</div><div class="sc-v-book"></div><div class="sc-v-bars"><i style="--w:72%"></i><i style="--w:58%"></i></div></div>';
    if(type === 'gpa') return '<div class="sc-page-visual" data-label="Transcript strength and course balance" aria-hidden="true"><div class="sc-v-icon">4.0</div><div class="sc-v-card"></div><div class="sc-v-bars"><i style="--w:88%"></i><i style="--w:76%"></i><i style="--w:60%"></i></div></div>';
    if(type === 'college') return '<div class="sc-page-visual" data-label="Reach, target, likely list building" aria-hidden="true"><div class="sc-v-icon">U</div><div class="sc-v-building"></div></div>';
    if(type === 'school') return '<div class="sc-page-visual" data-label="Credits, counselors, class levels" aria-hidden="true"><div class="sc-v-icon">US</div><div class="sc-v-network"><i></i><i></i><i></i></div></div>';
    if(type === 'writing') return '<div class="sc-page-visual" data-label="Thesis, evidence, rubric points" aria-hidden="true"><div class="sc-v-icon">W</div><div class="sc-v-pencil"></div><div class="sc-v-bars"><i style="--w:74%"></i><i style="--w:52%"></i></div></div>';
    if(type === 'ach') return '<div class="sc-page-visual" data-label="XP, milestones, consistency" aria-hidden="true"><div class="sc-v-icon">XP</div><div class="sc-v-trophy"></div><div class="sc-v-bars"><i style="--w:68%"></i><i style="--w:84%"></i></div></div>';
    return '<div class="sc-page-visual" data-label="Student profile and next actions" aria-hidden="true"><div class="sc-v-icon">SC</div><div class="sc-v-card"></div><div class="sc-v-ring"></div></div>';
  }
  function installHeaderVisuals(root){
    return;
    root = root || document;
    var config={
      's-sat':'sat',
      's-start':'apush',
      's-timeline':'apush',
      's-gpa':'gpa',
      's-college':'college',
      's-school':'school',
      's-fc':'sat',
      's-profile':'profile',
      's-ach':'ach',
      's-purpose':'profile',
      's-feedback':'profile',
      's-writing':'writing',
      's-dbq':'writing',
      's-saq':'writing',
      's-leq':'writing'
    };
    Object.keys(config).forEach(function(id){
      var page=(root.getElementById?root.getElementById(id):null) || document.getElementById(id);
      if(!page) return;
      var head=page.querySelector('.bc-page-head,.profile-hero');
      if(!head || head.querySelector('.sc-page-visual')) return;
      head.insertAdjacentHTML('beforeend',visualMarkup(config[id]));
    });
    var tool=document.getElementById('tool-page-root');
    if(tool && tool.classList.contains('on')){
      var h=tool.querySelector('.bc-page-head,.profile-hero');
      if(h && !h.querySelector('.sc-page-visual')){
        var type=tool.classList.contains('gpa-page')?'gpa':tool.classList.contains('school-guide-open')?'school':'profile';
        h.insertAdjacentHTML('beforeend',visualMarkup(type));
      }
    }
  }
  function runExpansion(){
    addHomeExpansion();
    expandPages();
    cleanupText();
    installHeaderVisuals();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',runExpansion);
  else runExpansion();
  window.scRunExpansion=runExpansion;
  window.scInstallHeaderVisuals=installHeaderVisuals;
  setTimeout(runExpansion,250);
})();
