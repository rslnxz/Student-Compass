(function(){
  var STORAGE='scCommandCenter2026';
  function $(id){return document.getElementById(id);}
  function read(){
    try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')||{};}catch(e){return {};}
  }
  function write(data){localStorage.setItem(STORAGE,JSON.stringify(data));}
  function escapeHtml(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function data(){
    var d=read();
    d.profile=d.profile||{name:'Alex',grade:'11',targetSat:'1450',gpa:'3.87',examDate:'',collegeGoal:'Build a balanced list',weakSubjects:'SAT Algebra, APUSH Period 3, Text Structure'};
    d.daily=d.daily||[
      {task:'SAT Practice',detail:'Reading & Writing module',time:'25 min',done:false},
      {task:'APUSH Practice',detail:'Period 3 - 15 questions',time:'25 min',done:false},
      {task:'Vocabulary Review',detail:'24 words',time:'15 min',done:false}
    ];
    d.mistakes=d.mistakes||[];
    d.writing=d.writing||[];
    d.progress=d.progress||{sat:[1180,1240,1310,1360,1420],apush:[52,58,63,68,74],vocab:[18,36,54,71,86],writing:[2,3,4,4,5]};
    d.collegeFit=d.collegeFit||{school:'Stanford University',academic:85,cost:55,location:78,major:92,culture:80};
    return d;
  }
  function saveProfile(){
    var d=data();
    d.profile={
      name:($('cc-profile-name')||{}).value||'Student',
      grade:($('cc-profile-grade')||{}).value||'',
      targetSat:($('cc-profile-sat')||{}).value||'',
      gpa:($('cc-profile-gpa')||{}).value||'',
      examDate:($('cc-profile-exam')||{}).value||'',
      collegeGoal:($('cc-profile-goal')||{}).value||'',
      weakSubjects:($('cc-profile-weak')||{}).value||''
    };
    write(d);
    renderCommandHome();
    showStartFlow();
  }
  function toggleDaily(index){
    var d=data();
    if(d.daily[index]) d.daily[index].done=!d.daily[index].done;
    write(d);
    renderCommandHome();
  }
  function addMistake(){
    var d=data();
    var item={
      topic:($('cc-mistake-topic')||{}).value||'Untitled mistake',
      source:($('cc-mistake-source')||{}).value||'Practice',
      reason:($('cc-mistake-reason')||{}).value||'Review needed',
      fix:($('cc-mistake-fix')||{}).value||'Redo and explain the correct answer'
    };
    d.mistakes.unshift(item);
    write(d);
    showSAT();
  }
  function addWritingEntry(){
    var d=data();
    d.writing.unshift({
      type:($('cc-writing-type')||{}).value||'DBQ',
      score:($('cc-writing-score')||{}).value||'',
      note:($('cc-writing-note')||{}).value||'',
      date:new Date().toLocaleDateString()
    });
    write(d);
    if(typeof show==='function'){show('s-writing');}
    if(typeof setNav==='function'){setNav('nav-writing');}
  }
  function fitScore(f){
    return Math.round((Number(f.academic||0)*.30)+(Number(f.cost||0)*.20)+(Number(f.location||0)*.15)+(Number(f.major||0)*.25)+(Number(f.culture||0)*.10));
  }
  function updateFit(){
    var d=data();
    d.collegeFit={
      school:($('cc-fit-school')||{}).value||'Selected University',
      academic:Number(($('cc-fit-academic')||{}).value||0),
      cost:Number(($('cc-fit-cost')||{}).value||0),
      location:Number(($('cc-fit-location')||{}).value||0),
      major:Number(($('cc-fit-major')||{}).value||0),
      culture:Number(($('cc-fit-culture')||{}).value||0)
    };
    write(d);
    openUniversitySelection();
  }
  function openUniversitySelection(){
    if(typeof openToolPage==='function'){
      openToolPage('s-college','nav-college');
      return;
    }
    if(typeof show==='function') show('s-college');
    if(typeof setNav==='function') setNav('nav-college');
  }
  function showPage(id,nav){
    document.querySelectorAll('.sec').forEach(function(el){el.classList.remove('on');el.style.display='none';});
    var page=$(id);
    if(page){page.classList.add('on');page.style.display='block';}
    var tool=$('tool-page-root');
    if(tool){tool.classList.remove('on');tool.innerHTML='';}
    if(typeof setNav==='function' && nav) setNav(nav);
    document.body.setAttribute('data-current-page',id);
    try{window.scrollTo({top:0,left:0,behavior:'auto'});}catch(e){window.scrollTo(0,0);}
  }
  function moduleCard(code,title,copy,button,action,tone){
    return '<article class="cc-card">'+
      '<div class="cc-card-icon" style="'+(tone||'')+'">'+code+'</div>'+
      '<div><h3>'+escapeHtml(title)+'</h3><p>'+escapeHtml(copy)+'</p></div>'+
      '<button class="cc-btn" type="button" onclick="'+action+'">'+escapeHtml(button)+'</button>'+
    '</article>';
  }
  function renderCommandHome(){
    var landing=$('s-landing');
    if(!landing) return;
    var d=data(), p=d.profile;
    var done=d.daily.filter(function(x){return x.done;}).length;
    landing.innerHTML='<main class="cc-page">'+
      '<section class="cc-hero">'+
        '<div>'+
          '<div class="cc-kicker">100% FREE - NO LOGIN</div>'+
          '<h1 class="cc-title">Your U.S. school <span>command center.</span></h1>'+
          '<p class="cc-copy">Everything you need to succeed in high school and get into the college you want: SAT prep, APUSH practice, GPA planning, university selection, and U.S. school-system guidance.</p>'+
          '<div class="cc-actions"><button class="cc-btn primary" onclick="showSAT()">Start SAT Practice</button><button class="cc-btn" onclick="showStartFlow()">Build My Plan</button></div>'+
          '<div class="cc-trust-row">'+
            '<div class="cc-trust"><i>S</i><div><strong>Trusted and reliable</strong><span>Built around official skills and practical school planning.</span></div></div>'+
            '<div class="cc-trust"><i>P</i><div><strong>Track. Improve. Succeed.</strong><span>Daily loops and progress data show what to do next.</span></div></div>'+
            '<div class="cc-trust"><i>L</i><div><strong>Yours. Always private.</strong><span>Everything saves locally on your device.</span></div></div>'+
          '</div>'+
        '</div>'+
        '<aside class="cc-dashboard">'+
          '<div class="cc-dash-head"><div><h2>Welcome back, '+escapeHtml(p.name||'Student')+'</h2><p>Let us keep your momentum going.</p></div><button class="cc-mini-btn" onclick="showProgressCenter()">View Full Dashboard -></button></div>'+
          '<div class="cc-dash-grid">'+
            '<div class="cc-panel cc-loop"><div class="cc-panel-head"><h3>Today\'s study loop</h3><span class="cc-small">'+done+'/'+d.daily.length+' done</span></div><div class="cc-loop-list">'+d.daily.map(function(item,i){return '<button class="cc-loop-item" onclick="ccToggleDaily('+i+')"><b class="cc-loop-num">'+(item.done?'OK':(i+1))+'</b><span class="cc-loop-copy"><strong>'+escapeHtml(item.task)+'</strong><span>'+escapeHtml(item.detail)+'</span></span><em>'+escapeHtml(item.time)+'</em></button>';}).join('')+'</div><div class="cc-small cc-streak-note">Keep the streak alive: 7 day streak</div></div>'+
            '<div class="cc-panel cc-score"><span class="cc-small">SAT score range</span><strong>1360-1520</strong><div class="cc-range"></div><button class="cc-mini-btn" onclick="showSAT()">View SAT Dashboard</button></div>'+
            '<div class="cc-panel"><span class="cc-small">APUSH progress</span><div class="cc-ring"><span>68%</span></div><button class="cc-mini-btn" onclick="show(\'s-start\');setNav(\'nav-quiz\')">Continue Practice</button></div>'+
            '<div class="cc-panel"><span class="cc-small">GPA (UW)</span><div class="cc-score"><strong>'+escapeHtml(p.gpa||'3.87')+'</strong></div><div class="cc-spark"></div><button class="cc-mini-btn" onclick="openToolPage(\'s-gpa\',\'nav-gpa\')">Open GPA Planner</button></div>'+
            '<div class="cc-panel"><span class="cc-small">University list</span><div class="cc-list"><div><span>Stanford University</span><b>Reach</b></div><div><span>University of Michigan</span><b>Target</b></div><div><span>UCLA</span><b>Target</b></div><div><span>+ Add more schools</span></div></div><button class="cc-mini-btn" onclick="openToolPage(\'s-college\',\'nav-college\')">Manage List</button></div>'+
            '<div class="cc-panel cc-weak-row"><strong>Weak spots to improve</strong><div class="cc-chips">'+String(p.weakSubjects||'SAT Algebra, Text Structure, APUSH Period 3').split(',').slice(0,4).map(function(x){return '<span class="cc-chip">'+escapeHtml(x.trim())+' <b>Focus</b></span>';}).join('')+'</div><button class="cc-mini-btn" onclick="showSAT()">Focus These Skills -></button></div>'+
          '</div>'+
        '</aside>'+
      '</section>'+
      '<section class="cc-section">'+
        '<div class="cc-section-head"><div><span class="cc-small" style="color:#4f8ef7;font-weight:900">EXPLORE MODULES</span><h2>Everything in one place.</h2></div><span class="cc-small">Pick a module to get started</span></div>'+
        '<div class="cc-module-grid">'+
          moduleCard('SAT','SAT Practice','Full practice tests, targeted drills, and vocab to raise your score.','Start Practicing','showSAT()')+
          moduleCard('AP','APUSH','Stimulus-based questions across all periods with detailed explanations.','Start Practicing','show(\'s-start\');setNav(\'nav-quiz\')','color:#86efac;border-color:rgba(34,197,94,.32);background:rgba(34,197,94,.12)')+
          moduleCard('GPA','GPA Planner','Calculate GPA, plan courses, and see how AP classes affect the future.','Open Planner','openToolPage(\'s-gpa\',\'nav-gpa\')','color:#c4b5fd;border-color:rgba(167,139,250,.32);background:rgba(124,58,237,.12)')+
          moduleCard('UNI','University Selection','Build a smart list and compare schools across cost, major, and selectivity.','Find Schools','openToolPage(\'s-college\',\'nav-college\')','color:#fbbf24;border-color:rgba(245,158,11,.32);background:rgba(245,158,11,.12)')+
          moduleCard('SYS','U.S. School System','Understand credits, grades, transcripts, and how schools really work.','Explore Guide','openToolPage(\'s-school\',\'nav-school\')','color:#5eead4;border-color:rgba(45,212,191,.32);background:rgba(45,212,191,.12)')+
          moduleCard('ME','My Profile','Your dashboard: stats, progress, college list, GPA, SAT score, and more.','View Profile','showProgressCenter()')+
        '</div>'+
      '</section>'+
      '<div class="cc-stats-strip">'+
        '<div class="cc-stat"><b>366+</b><span>Practice questions</span></div><div class="cc-stat"><b>9</b><span>APUSH periods</span></div><div class="cc-stat"><b>Full</b><span>SAT practice tests</span></div><div class="cc-stat"><b>100%</b><span>Free for students</span></div><div class="cc-stat"><b>Private</b><span>No account required</span></div>'+
      '</div>'+
    '</main>';
  }
  function ensurePage(id){
    var page=$(id);
    if(page) return page;
    page=document.createElement('div');
    page.className='sec';
    page.id=id;
    page.style.display='none';
    var app=$('app')||document.body;
    app.appendChild(page);
    return page;
  }
  function showStartFlow(){
    var d=data(), p=d.profile;
    var page=ensurePage('s-command-start');
    page.innerHTML='<section class="cc-feature-page"><div class="cc-kicker">START HERE</div><h1>Build your student plan.</h1><p>Set the basics once. Student Compass uses this to make the dashboard, daily study loop, university list, and progress pages feel personal.</p>'+
      '<div class="cc-two-col"><div class="cc-panel"><h3>Student setup</h3><div class="cc-form-grid" style="margin-top:16px">'+
        field('Name','cc-profile-name','text',p.name)+field('Grade','cc-profile-grade','text',p.grade)+field('Target SAT','cc-profile-sat','number',p.targetSat)+field('Current GPA','cc-profile-gpa','text',p.gpa)+field('APUSH exam date','cc-profile-exam','date',p.examDate)+field('College goal','cc-profile-goal','text',p.collegeGoal)+
        '<div class="cc-field" style="grid-column:1/-1"><label>Weak subjects</label><textarea id="cc-profile-weak">'+escapeHtml(p.weakSubjects||'')+'</textarea></div>'+
      '</div><button class="cc-btn primary" style="margin-top:14px" onclick="ccSaveProfile()">Save Plan</button></div>'+
      '<div class="cc-panel"><h3>Recommended first week</h3><div class="cc-loop-list">'+['Run the SAT diagnostic','Do one APUSH period set','Add 8 universities','Save 5 mistakes','Write one DBQ/SAQ response'].map(function(x,i){return '<div class="cc-loop-item"><b>'+(i+1)+'</b><span><strong>'+x+'</strong><span>Small action, measurable result.</span></span><em class="cc-small">Day '+(i+1)+'</em></div>';}).join('')+'</div></div></div></section>';
    showPage('s-command-start','nav-command-start');
  }
  function field(label,id,type,value){
    return '<div class="cc-field"><label>'+escapeHtml(label)+'</label><input id="'+id+'" type="'+type+'" value="'+escapeHtml(value||'')+'"></div>';
  }
  function showMistakes(){
    showSAT();
  }
  function showProgressCenter(){
    var d=data(), p=d.progress;
    function chart(name,values){
      var max=Math.max.apply(Math,values.concat([1]));
      return '<div class="cc-panel"><h3>'+name+'</h3><div class="cc-table" style="margin-top:14px">'+values.map(function(v,i){return '<div><div class="cc-card-head"><span class="cc-small">Check '+(i+1)+'</span><b>'+v+'</b></div><div class="cc-bar"><span style="width:'+Math.round((v/max)*100)+'%"></span></div></div>';}).join('')+'</div></div>';
    }
    var page=ensurePage('s-command-progress');
    page.innerHTML='<section class="cc-feature-page"><div class="cc-kicker">PROGRESS CHARTS</div><h1>See the trend, not just the score.</h1><p>Track SAT range, APUSH accuracy, vocabulary mastery, and writing rubric growth in one clean dashboard.</p><div class="cc-feature-grid">'+chart('SAT estimate',p.sat)+chart('APUSH accuracy',p.apush)+chart('Vocab mastered',p.vocab)+chart('Writing rubric',p.writing)+'<div class="cc-panel"><h3>Next action</h3><p class="cc-small">Your highest return move is targeted SAT practice based on the skills you missed most.</p><button class="cc-btn primary" onclick="showSAT()">Open SAT Practice</button></div><div class="cc-panel"><h3>Export report</h3><p class="cc-small">Create a shareable summary for parents, counselors, or yourself.</p><button class="cc-btn" onclick="showExportCenter()">Open Export</button></div></div></section>';
    showPage('s-command-progress','nav-command-progress');
  }
  function showCollegeFit(){
    openUniversitySelection();
  }
  function showWritingHistory(){
    if(typeof show==='function') show('s-writing');
    if(typeof setNav==='function') setNav('nav-writing');
  }
  function exportText(){
    var d=data(), p=d.profile;
    return 'Student Compass Plan\\n\\nName: '+p.name+'\\nGrade: '+p.grade+'\\nTarget SAT: '+p.targetSat+'\\nGPA: '+p.gpa+'\\nGoal: '+p.collegeGoal+'\\nWeak subjects: '+p.weakSubjects+'\\n\\nDaily loop:\\n'+d.daily.map(function(x){return '- '+x.task+': '+x.detail+' ('+x.time+')';}).join('\\n');
  }
  function showExportCenter(){
    var page=ensurePage('s-command-export');
    var text=exportText();
    page.innerHTML='<section class="cc-feature-page"><div class="cc-kicker">EXPORT AND SHARE</div><h1>Make your plan portable.</h1><p>Export a clean summary for parents, counselors, teachers, or your own weekly review.</p><div class="cc-two-col"><div class="cc-panel"><h3>Summary preview</h3><div class="cc-export-box" id="cc-export-text">'+escapeHtml(text)+'</div></div><div class="cc-panel"><h3>Actions</h3><p class="cc-small">Download a text report or print the current summary as a PDF from the browser print dialog.</p><button class="cc-btn primary" onclick="ccDownloadExport()">Download Report</button><button class="cc-btn" style="margin-top:10px" onclick="window.print()">Print / Save PDF</button></div></div></section>';
    showPage('s-command-export','nav-command-export');
  }
  function downloadExport(){
    var blob=new Blob([exportText()],{type:'text/plain'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;
    a.download='student-compass-plan.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){URL.revokeObjectURL(url);a.remove();},0);
  }
  function addNav(){
    var links=document.querySelector('.drawer-links');
    if(!links || links.querySelector('[data-cc-nav]')) return;
    var group=document.createElement('div');
    group.setAttribute('data-cc-nav','1');
    group.innerHTML='<div class="drawer-section-label">Command Center</div>'+
      '<button class="drawer-btn" id="nav-command-start" onclick="showStartFlow();closeMenu()">Start Here</button>'+
      '<button class="drawer-btn" id="nav-command-progress" onclick="showProgressCenter();closeMenu()">Daily Plan & Progress</button>'+
      '<button class="drawer-btn" id="nav-command-export" onclick="showExportCenter();closeMenu()">Export / Share</button>';
    var labels=Array.prototype.slice.call(links.querySelectorAll('.drawer-section-label'));
    var satLabel=labels.find(function(label){return (label.textContent||'').trim()==='SAT Practice';});
    if(satLabel) links.insertBefore(group,satLabel);
    else links.appendChild(group);
  }
  function init(){
    addNav();
    renderCommandHome();
    if(document.body.getAttribute('data-current-page')==='s-landing' || document.querySelector('#s-landing.on')) renderCommandHome();
    document.body.classList.add('cc-reference-mode');
  }
  window.ccSaveProfile=saveProfile;
  window.ccToggleDaily=toggleDaily;
  window.ccAddMistake=addMistake;
  window.ccAddWritingEntry=addWritingEntry;
  window.ccUpdateFit=updateFit;
  window.ccDownloadExport=downloadExport;
  window.showStartFlow=showStartFlow;
  window.showMistakes=showMistakes;
  window.showProgressCenter=showProgressCenter;
  window.showCollegeFit=showCollegeFit;
  window.showWritingHistory=showWritingHistory;
  window.showExportCenter=showExportCenter;
  window.scCommandCenterRenderHome=renderCommandHome;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
  window.addEventListener('load',function(){setTimeout(init,150);});
})();
