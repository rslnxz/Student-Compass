(function(){
  var CC_STORAGE='scCommandCenter2026';
  function $(id){return document.getElementById(id);}
  function read(){
    try{return JSON.parse(localStorage.getItem(CC_STORAGE)||'{}')||{};}catch(e){return {};}
  }
  function write(d){localStorage.setItem(CC_STORAGE,JSON.stringify(d||{}));}
  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
  }
  function ensureData(){
    var d=read();
    d.profile=d.profile||{name:'Alex',grade:'11',targetSat:'1450',gpa:'3.87',examDate:'',collegeGoal:'Build a balanced college list',weakSubjects:'SAT Algebra, APUSH Period 3, Text Structure'};
    d.progress=d.progress||{sat:[1180,1240,1310,1360,1420],apush:[52,58,63,68,74],vocab:[18,36,54,71,86],writing:[2,3,4,4,5]};
    d.mistakes=d.mistakes||[];
    d.writing=d.writing||[];
    d.collegeCompare=d.collegeCompare||[
      {school:'Stanford University',cost:'High',rate:'4%',sat:'1500+',major:'Excellent',fit:82},
      {school:'University of Michigan',cost:'Medium',rate:'18%',sat:'1400+',major:'Strong',fit:88},
      {school:'UCLA',cost:'Medium',rate:'9%',sat:'1400+',major:'Strong',fit:84}
    ];
    d.daily=generateDaily(d);
    write(d);
    return d;
  }
  function daysUntil(date){
    if(!date) return null;
    var target=new Date(date+'T12:00:00');
    if(isNaN(target.getTime())) return null;
    return Math.ceil((target-Date.now())/86400000);
  }
  function generateDaily(d){
    var p=d.profile||{};
    var weak=String(p.weakSubjects||'SAT Algebra, APUSH Period 3, Text Structure').split(',').map(function(x){return x.trim();}).filter(Boolean);
    var soon=daysUntil(p.examDate);
    var satWeak=weak.find(function(x){return /sat|algebra|math|reading|writing|text/i.test(x);})||'SAT mixed review';
    var apWeak=weak.find(function(x){return /apush|period|history/i.test(x);})||'APUSH mixed period';
    var tasks=[
      {task:'SAT Practice',detail:satWeak+' - 12 focused questions',time:soon&&soon<45?'30 min':'22 min',done:false},
      {task:'APUSH Practice',detail:apWeak+' - 10 stimulus questions',time:'20 min',done:false},
      {task:'Review Queue',detail:'Review missed questions and weak skills',time:'12 min',done:false},
      {task:'Vocab Review',detail:'15 cards from weak deck',time:'10 min',done:false}
    ];
    var old=Array.isArray(d.daily)?d.daily:[];
    return tasks.map(function(t,i){t.done=!!(old[i]&&old[i].done&&old[i].task===t.task);return t;});
  }
  function showPage(id,nav){
    document.querySelectorAll('.sec').forEach(function(el){el.classList.remove('on');el.style.display='none';});
    var page=$(id);
    if(page){page.classList.add('on');page.style.display='block';}
    var tool=$('tool-page-root');
    if(tool){tool.classList.remove('on');tool.innerHTML='';}
    if(typeof setNav==='function' && nav) setNav(nav);
    syncTopNav(nav||id);
    document.body.setAttribute('data-current-page',id);
    window.scrollTo(0,0);
  }
  function ensurePage(id){
    var page=$(id);
    if(page) return page;
    page=document.createElement('div');
    page.id=id;
    page.className='sec';
    page.style.display='none';
    ($('app')||document.body).appendChild(page);
    return page;
  }
  function syncTopNav(id){
    document.querySelectorAll('.top-nav-link').forEach(function(btn){btn.classList.remove('active');});
    var map=[
      ['top-nav-home',/landing|home/],
      ['top-nav-sat',/sat|pt|drills/],
      ['top-nav-apush',/quiz|apush|start|writing/],
      ['top-nav-gpa',/gpa/],
      ['top-nav-college',/college|fit/],
      ['top-nav-school',/school/],
      ['top-nav-profile',/profile|progress|mistake|export/]
    ];
    var key=String(id||'');
    var picked='top-nav-home';
    map.forEach(function(pair){if(pair[1].test(key)) picked=pair[0];});
    var el=$(picked);
    if(el) el.classList.add('active');
  }
  function patchNavigation(){
    if(window.__ccProductNavPatched) return;
    window.__ccProductNavPatched=true;
    ['show','openToolPage','showSAT','showSATTab','showStartFlow','showMistakes','showProgressCenter','showCollegeFit','showWritingHistory','showExportCenter'].forEach(function(name){
      var fn=window[name];
      if(typeof fn!=='function') return;
      window[name]=function(){
        var result=fn.apply(this,arguments);
        setTimeout(function(){syncTopNav(arguments[1]||arguments[0]||document.body.getAttribute('data-current-page'));enhanceVisiblePage();},0);
        return result;
      };
    });
  }
  function enhanceVisiblePage(){
    var visible=document.querySelector('.sec.on,#tool-page-root.on');
    if(!visible) return;
    visible.classList.add('cc-reference-mode-page');
    if(visible.id==='s-sat') addSATHealth();
    if(visible.id==='s-profile') addProfileShortcuts();
  }
  function addSATHealth(){
    var sat=$('s-sat');
    if(!sat || sat.querySelector('.cc-health-panel')) return;
    var target=sat.querySelector('.sat-hub') || sat.querySelector('.bc-page-head');
    if(!target) return;
    target.insertAdjacentHTML('afterend','<div class="cc-health-panel"><div><b>Daily</b><span>Generated from weak spots</span></div><div><b>Review</b><span>Misses become queue items</span></div><div><b>Charts</b><span>Scores update over time</span></div><div><b>Export</b><span>Share progress anytime</span></div></div>');
  }
  function addProfileShortcuts(){
    var p=$('s-profile');
    if(!p || p.querySelector('.cc-profile-shortcuts')) return;
    p.insertAdjacentHTML('afterbegin','<div class="cc-section cc-profile-shortcuts"><div class="cc-section-head"><div><h2>Command shortcuts</h2><p>Jump to the tools that make the profile useful.</p></div></div><div class="cc-module-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))"><button class="cc-btn" onclick="showProgressCenter()">Progress</button><button class="cc-btn" onclick="showCollegeCompare()">College Compare</button><button class="cc-btn" onclick="showExportCenter()">Export</button></div></div>');
  }
  function showReviewMode(){
    var d=ensureData();
    var items=[];
    (d.mistakes||[]).slice(0,8).forEach(function(m){items.push({type:'Mistake',topic:m.topic,action:m.fix||'Explain the correct answer'});});
    if(!items.length){
      items=[
        {type:'SAT',topic:'Algebra',action:'Redo 8 focused questions'},
        {type:'APUSH',topic:'Period 3',action:'Answer 6 stimulus questions'},
        {type:'Writing',topic:'Thesis clarity',action:'Rewrite one thesis'},
        {type:'Vocab',topic:'Missed words',action:'Review 15 cards'}
      ];
    }
    var page=ensurePage('s-command-review');
    page.innerHTML='<section class="cc-feature-page"><div class="cc-kicker">REVIEW MODE</div><h1>Review what matters today.</h1><p>A mixed review queue from weak SAT skills, APUSH gaps, vocab, and writing feedback.</p><div class="cc-panel cc-review-mix"><h3>Today\'s review queue</h3><div class="cc-table" style="margin-top:14px">'+items.map(function(x){return '<div class="cc-row"><strong>'+esc(x.topic)+'</strong><span>'+esc(x.type)+'</span><span>'+esc(x.action)+'</span></div>';}).join('')+'</div><button class="cc-btn primary" style="margin-top:14px" onclick="showSAT()">Open SAT Practice</button></div></section>';
    showPage('s-command-review','nav-command-review');
  }
  function showCollegeCompare(){
    var d=ensureData();
    var page=ensurePage('s-command-compare');
    page.innerHTML='<section class="cc-feature-page"><div class="cc-kicker">COLLEGE COMPARISON</div><h1>Compare schools side by side.</h1><p>Use this as the decision table for cost, selectivity, SAT range, major strength, and personal fit.</p><div class="cc-panel cc-compare-table"><div class="cc-table"><div class="cc-row" style="font-weight:900;color:#dbeafe"><span>School</span><span>Cost</span><span>Acceptance</span><span>SAT Range</span><span>Major</span><span>Fit</span></div>'+d.collegeCompare.map(function(x){return '<div class="cc-row"><strong>'+esc(x.school)+'</strong><span>'+esc(x.cost)+'</span><span>'+esc(x.rate)+'</span><span>'+esc(x.sat)+'</span><span>'+esc(x.major)+'</span><b>'+esc(x.fit)+'</b></div>';}).join('')+'</div><div class="cc-actions" style="margin-top:16px"><button class="cc-btn primary" onclick="openToolPage(\'s-college\',\'nav-college\')">Open University Search</button></div></div></section>';
    showPage('s-command-compare','nav-command-compare');
  }
  function patchCommandHome(){
    var old=window.scCommandCenterRenderHome;
    if(typeof old!=='function' || old.__productPatched) return;
    window.scCommandCenterRenderHome=function(){
      ensureData();
      old.apply(this,arguments);
      enhanceHomeActions();
    };
    window.scCommandCenterRenderHome.__productPatched=true;
  }
  function enhanceHomeActions(){
    var home=$('s-landing');
    if(!home || home.querySelector('.cc-extra-actions')) return;
    var stats=home.querySelector('.cc-stats-strip');
    if(stats){
      stats.insertAdjacentHTML('beforebegin','<section class="cc-section cc-extra-actions"><div class="cc-section-head"><div><span class="cc-small" style="color:#5eead4;font-weight:900">NEXT BEST ACTIONS</span><h2>Study smarter from one queue.</h2><p>The app now connects planning, progress, college comparison, and exports.</p></div></div><div class="cc-module-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))"><button class="cc-btn" onclick="showReviewMode()">Review Mode</button><button class="cc-btn" onclick="showCollegeCompare()">Compare Colleges</button><button class="cc-btn" onclick="showExportCenter()">Export Report</button></div></section>');
    }
  }
  function addCommandNav(){
    var links=document.querySelector('.drawer-links [data-cc-nav]') || document.querySelector('[data-cc-nav]');
    if(!links || links.querySelector('#nav-command-review')) return;
    links.insertAdjacentHTML('beforeend','<button class="drawer-btn" id="nav-command-review" onclick="showReviewMode();closeMenu()">Review Mode</button><button class="drawer-btn" id="nav-command-compare" onclick="showCollegeCompare();closeMenu()">College Compare</button>');
  }
  function reduceLag(){
    document.querySelectorAll('.sc-orbit-stage,.sc-floating-book,.sc-study-device').forEach(function(el){el.style.animation='none';});
    var oldObserver=window.__scTextSanitizerObserver;
    if(oldObserver && oldObserver.disconnect){
      try{oldObserver.disconnect();}catch(e){}
      window.__scTextSanitizerObserver=null;
    }
  }
  function init(){
    ensureData();
    document.body.classList.add('cc-reference-mode');
    patchCommandHome();
    addCommandNav();
    patchNavigation();
    if(window.scCommandCenterRenderHome) window.scCommandCenterRenderHome();
    enhanceHomeActions();
    enhanceVisiblePage();
    reduceLag();
    syncTopNav(document.body.getAttribute('data-current-page')||'landing');
  }
  window.showReviewMode=showReviewMode;
  window.showCollegeCompare=showCollegeCompare;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
  window.addEventListener('load',function(){setTimeout(init,200);});
})();
