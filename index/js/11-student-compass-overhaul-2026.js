(function(){
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function actionFor(id){
    var map={
      sat:"showSAT();closeMenu();",
      apush:"show('s-start');setNav('nav-quiz');closeMenu();",
      vocab:"openToolPage('s-fc','nav-fc');closeMenu();",
      gpa:"openToolPage('s-gpa','nav-gpa');closeMenu();",
      school:"openToolPage('s-school','nav-school');closeMenu();",
      college:"openToolPage('s-college','nav-college');closeMenu();",
      profile:"showProfile();closeMenu();",
      purpose:"showPurpose();closeMenu();",
      feedback:"showFeedback();closeMenu();"
    };
    return map[id] || map.sat;
  }
  function moduleCard(item){
    return '<article class="sc-module" style="--module-glow:'+item.glow+'" onclick="'+actionFor(item.id)+'">'+
      '<div><span>'+esc(item.kicker)+'</span><h3>'+esc(item.title)+'</h3><p>'+esc(item.copy)+'</p></div>'+
      '<button class="sc-btn" type="button" onclick="event.stopPropagation();'+actionFor(item.id)+'">'+esc(item.cta)+'</button>'+
    '</article>';
  }
  function buildHome(){
    var landing=document.getElementById('s-landing');
    if(!landing || landing.dataset.scOverhauled === '1') return;
    landing.dataset.scOverhauled='1';
    landing.classList.add('sc-overhaul');
    var modules=[
      {id:'sat',kicker:'Score growth',title:'SAT Practice',copy:'Full digital-style practice, section drills, score diagnosis, and vocabulary review in one place.',cta:'Start SAT Practice',glow:'rgba(79,140,255,.2)'},
      {id:'apush',kicker:'AP readiness',title:'APUSH Practice',copy:'Stimulus-based questions across all nine periods with explanations that show why the answer works.',cta:'Practice APUSH',glow:'rgba(139,124,246,.2)'},
      {id:'gpa',kicker:'Transcript strategy',title:'GPA Planner',copy:'Calculate weighted and unweighted GPA, then choose courses with ambition and control.',cta:'Plan GPA',glow:'rgba(87,223,154,.18)'},
      {id:'college',kicker:'Admissions fit',title:'University Selection',copy:'Search U.S. schools, compare fit, and build a reach, target, and likely list you would actually attend.',cta:'Build List',glow:'rgba(255,209,102,.2)'},
      {id:'school',kicker:'New to the U.S.',title:'How America Works',copy:'Credits, counselors, class levels, transcripts, school culture, and the hidden rules students need explained.',cta:'Open Guide',glow:'rgba(55,213,201,.18)'},
      {id:'profile',kicker:'Your cockpit',title:'Profile Dashboard',copy:'Track GPA, SAT, university list, APUSH accuracy, XP, achievements, and next actions from one dashboard.',cta:'View Dashboard',glow:'rgba(255,122,144,.16)'}
    ];
    landing.innerHTML=
      '<main class="sc-home">'+
        '<section class="sc-hero">'+
          '<div class="sc-hero-copy">'+
            '<div class="sc-free-line"><span>Free now</span><span>No login required</span><span>Paid tiers ready later</span></div>'+
            '<h1>Your U.S. school <span class="sc-gradient-text">command center.</span></h1>'+
            '<p>Student Compass turns SAT prep, APUSH, GPA, university selection, and U.S. school-system survival into one focused workspace. Open it, pick the next action, and keep moving.</p>'+
            '<div class="sc-cta-row">'+
              '<button class="sc-btn primary" type="button" onclick="'+actionFor('sat')+'">Start SAT Practice</button>'+
              '<button class="sc-btn" type="button" onclick="'+actionFor('profile')+'">Build My Plan</button>'+
            '</div>'+
            '<div class="sc-trust-row">'+
              '<div><strong>485+</strong><span>SAT questions and adaptive practice flow</span></div>'+
              '<div><strong>9/9</strong><span>APUSH periods with stimulus practice</span></div>'+
              '<div><strong>$0</strong><span>Free, local, private, and fast</span></div>'+
            '</div>'+
          '</div>'+
          '<aside class="sc-dashboard" aria-label="Student Compass dashboard preview">'+
            '<div class="sc-dash-head"><h2>Today\'s plan</h2><span class="sc-status">Ready</span></div>'+
            '<div class="sc-loop"><h3>Run the 25-minute loop</h3><p>10 SAT questions, 8 APUSH questions, 12 flashcards, then review every miss before moving on.</p></div>'+
            '<div class="sc-dash-grid">'+
              '<div class="sc-mini"><strong>1280</strong><span>Target SAT path</span></div>'+
              '<div class="sc-mini"><strong>3.8</strong><span>Weighted GPA goal</span></div>'+
              '<div class="sc-mini"><strong>6</strong><span>Universities to compare</span></div>'+
              '<div class="sc-mini"><strong>71%</strong><span>Current accuracy</span></div>'+
            '</div>'+
            '<div class="sc-weak-list">'+
              '<div><span>Weak spot</span><b>Command of Evidence</b></div>'+
              '<div><span>Next APUSH period</span><b>Period 6</b></div>'+
              '<div><span>Course move</span><b>Protect GPA first</b></div>'+
            '</div>'+
          '</aside>'+
        '</section>'+
        '<section class="sc-section">'+
          '<div class="sc-section-head"><h2>One workspace for the whole student path.</h2><p>Most prep sites solve one slice. Student Compass connects practice, planning, and school-system clarity so students know what to do next.</p></div>'+
          '<div class="sc-module-grid">'+modules.map(moduleCard).join('')+'</div>'+
        '</section>'+
        '<section class="sc-section">'+
          '<div class="sc-product-band">'+
            '<div class="sc-story"><h3>Designed to sell trust before it sells upgrades.</h3><p>The app stays free now, but the product shape is ready for future paid tiers: synced profiles, AI study plans, parent/counselor views, advanced analytics, and premium university planning.</p><button class="sc-btn primary" type="button" onclick="'+actionFor('purpose')+'">Read the Purpose</button></div>'+
            '<div class="sc-pricing"><h3>Free first. Premium later.</h3><p>Students should be able to start without a credit card. Paid tiers can drop in later without redesigning the product.</p><div class="sc-price-row"><div><strong>Free</strong><span>Practice, GPA, lists, local progress</span></div><div><strong>Plus</strong><span>Future sync, plans, analytics</span></div><div><strong>School</strong><span>Future counselor dashboards</span></div></div></div>'+
          '</div>'+
        '</section>'+
      '</main>';
  }
  function polishCopy(){
    var replacements=[
      ['LAUNCH_SAT_ ->','Start SAT Practice'],
      ['EXPLORE_APUSH_','Practice APUSH'],
      ['OPEN_','Open'],
      ['SAT_PREP_ ->','SAT Prep'],
      ['APUSH_','APUSH'],
      ['GPA_TOOL_','GPA Tool'],
      ['LAUNCH_COMPASS_ ->','Launch Compass'],
      ['ENROLLMENT_OPEN','Free access'],
      ['FREE / NO_LOGIN','Free / no login'],
      ['LIVE_STACK','Live tools'],
      ['COURSE_THESIS','Why it works'],
      ['|CURRICULUM_','Curriculum'],
      ['|WHY_','Why it works'],
      ['|SYSTEM_METRICS_','Inside Compass'],
      ['|RUN_LOOP_','Daily loop'],
      ['|FAQ_','Questions'],
      ['|RUN_','Start now'],
      ['LOCAL_PROFILE','Local profile'],
      ['COLLEGE_LIST','University list'],
      ['ACADEMIC_SNAPSHOT','Academic snapshot']
    ];
    replacements.forEach(function(pair){
      document.querySelectorAll('button,span,div').forEach(function(el){
        if(el.children.length) return;
        var t=(el.textContent||'').trim();
        if(t===pair[0]) el.textContent=pair[1];
      });
    });
  }
  function normalizePageHeads(){
    document.querySelectorAll('.bc-label,.bc-pill,.pt-info-lbl,.prog-lbl,.stat-box-lbl,.profile-stat span,.college-tag,.unit-tag').forEach(function(el){
      el.style.letterSpacing='0';
      el.style.textTransform='none';
    });
  }
  function installOverhaul(){
    buildHome();
    polishCopy();
    normalizePageHeads();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',installOverhaul);
  else installOverhaul();
  window.scInstallOverhaul=installOverhaul;
})();
