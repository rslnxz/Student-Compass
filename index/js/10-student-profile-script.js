function profileReadJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'')||fallback;}catch(e){return fallback;}}
function profileWriteJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(e){}}
function profileEscape(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function profileGet(){return profileReadJSON('scProfile',{name:'Student',avatar:''});}
function profileSetPreset(name){var input=document.getElementById('profile-name-input');if(input)input.value=name;profileSaveName(name);}
function profileSaveName(name){var p=profileGet();p.name=(name||'').trim()||'Student';profileWriteJSON('scProfile',p);renderProfileIdentity();}
function profileUploadPicture(input){
  var file=input&&input.files&&input.files[0]; if(!file)return;
  var reader=new FileReader();
  reader.onload=function(){var p=profileGet();p.avatar=String(reader.result||'');profileWriteJSON('scProfile',p);renderProfileIdentity();};
  reader.readAsDataURL(file);
}
function renderProfileIdentity(){
  var p=profileGet();
  var input=document.getElementById('profile-name-input');
  if(input&&input.value!==p.name)input.value=p.name||'Student';
  var av=document.getElementById('profile-avatar-preview');
  if(av){
    if(p.avatar) av.innerHTML='<img src="'+profileEscape(p.avatar)+'" alt="Profile picture"/>';
    else av.textContent=(p.name||'SC').split(/\s+/).map(function(x){return x[0]||'';}).join('').slice(0,2).toUpperCase()||'SC';
  }
}
function profilePct(c,t){return t?Math.round((c/t)*100):null;}
function profileGrade(pct){if(pct==null)return '-';return pct+'%';}
function profileLetter(pct){if(pct==null)return 'No questions answered yet.';if(pct>=90)return 'A range - excellent accuracy.';if(pct>=80)return 'B range - strong, keep refining.';if(pct>=70)return 'C range - improving, review misses.';if(pct>=60)return 'D range - rebuild fundamentals.';return 'Needs practice - start with smaller sets.';}
function profileCollegeInfo(id){return (window.COLLEGE_DATA||[]).find(function(c){return c.id===id;})||{name:id,state:'',selectivity:''};}
function renderProfile(){
  renderProfileIdentity();
  var s=typeof loadStats==='function'?loadStats():profileReadJSON('apush_stats',{});
  var gpa=profileReadJSON('scGpaSummary',null);
  var satLast=profileReadJSON('scSatLastScore',null);
  var satGoal=profileReadJSON('scSatGoal',null);
  var college=profileReadJSON('scCollegeList',{});
  var reach=(college.reach||[]),target=(college.target||[]),likely=(college.likely||[]);
  var allColleges=reach.concat(target,likely);
  var apPct=profilePct(Number(s.totalCorrect||0),Number(s.totalQs||0));
  var satPct=profilePct(Number(s.satCorrect||0),Number(s.satTotalQs||0));
  var overallPct=profilePct(Number(s.totalCorrect||0)+Number(s.satCorrect||0),Number(s.totalQs||0)+Number(s.satTotalQs||0));
  var satScore=(s.satPtBestScore||0)||(satLast&&satLast.total)||(satGoal&&satGoal.score)||0;
  var set=function(id,val){var el=document.getElementById(id);if(el)el.textContent=val;};
  set('profile-gpa-main',gpa?gpa.weighted:'-');
  set('profile-gpa-sub',gpa?'Unweighted '+gpa.unweighted+' from '+gpa.classes+' class'+(gpa.classes===1?'':'es'):'Use the GPA calculator to save your latest GPA.');
  set('profile-sat-main',satScore||'-');
  set('profile-sat-sub',(s.satPtBestScore||0)?'Best full practice test score.':satGoal?'Score explorer target/estimate.':'Complete a practice test or use the SAT score explorer.');
  set('profile-grade-main',profileGrade(overallPct));
  set('profile-grade-sub',profileLetter(overallPct));
  set('profile-college-count',String(allColleges.length));
  set('profile-college-sub',reach.length+' reach, '+target.length+' target, '+likely.length+' likely.');
  set('profile-uw-gpa',gpa?gpa.unweighted:'-');
  set('profile-w-gpa',gpa?gpa.weighted:'-');
  set('profile-xp',String(s.xp||0));
  set('profile-overall-acc',profileGrade(overallPct));
  set('profile-apush-acc',profileGrade(apPct));
  set('profile-sat-acc',profileGrade(satPct));
  var fill=document.getElementById('profile-grade-fill'); if(fill)fill.style.width=(overallPct||0)+'%';
  var summary=document.getElementById('profile-college-summary');
  if(summary)summary.innerHTML='<div class="profile-mini"><b>'+reach.length+'</b><span>Reach</span></div><div class="profile-mini"><b>'+target.length+'</b><span>Target</span></div><div class="profile-mini"><b>'+likely.length+'</b><span>Likely</span></div>';
  var list=document.getElementById('profile-college-list');
  if(list){
    var groups=[['Reach',reach],['Target',target],['Likely',likely]];
    var rows=[];
    groups.forEach(function(group){group[1].forEach(function(id){var c=profileCollegeInfo(id);rows.push('<div class="profile-row"><div><strong>'+profileEscape(c.name)+'</strong><small>'+profileEscape([c.city,c.state].filter(Boolean).join(', '))+'</small></div><span class="profile-badge">'+group[0]+'</span></div>');});});
    list.innerHTML=rows.join('')||'<div class="profile-empty">No universities yet. Open University Selection and add schools to reach, target, or likely.</div>';
  }
  var notes=document.getElementById('profile-academic-notes');
  if(notes){
    var last=satLast?('Last SAT practice: '+satLast.total+' ('+satLast.english+' English, '+satLast.math+' Math)'):(satGoal?('SAT target/estimate: '+satGoal.score):'No SAT score saved yet.');
    notes.innerHTML='<div class="profile-row"><div><strong>Level</strong><small>'+(typeof getLevel==='function'?profileEscape(getLevel(s.xp||0).name):'Student')+'</small></div><span class="profile-badge">'+(s.earnedAchs?s.earnedAchs.length:0)+' Achievements</span></div><div class="profile-row"><div><strong>SAT</strong><small>'+profileEscape(last)+'</small></div></div><div class="profile-row"><div><strong>Questions answered</strong><small>'+((s.totalQs||0)+(s.satTotalQs||0))+' total across APUSH and SAT practice.</small></div></div>';
  }
  var qlog=document.getElementById('profile-quiz-log');
  if(qlog){
    var logs=(s.quizLog||[]).slice(-5).reverse();
    qlog.innerHTML=logs.map(function(q){return '<div class="profile-row"><div><strong>'+profileEscape((q.subject||'SAT').toUpperCase())+' practice</strong><small>'+profileEscape(new Date(q.date||Date.now()).toLocaleDateString())+'</small></div><span class="profile-badge">'+q.score+'/'+q.total+'</span></div>';}).join('')||'<div class="profile-empty">No SAT quiz log yet. Complete a SAT unit quiz to populate recent performance.</div>';
  }
  var next=document.getElementById('profile-next-moves');
  if(next){
    var moves=[];
    if(!gpa)moves.push('Add classes in GPA & Courses so your GPA appears here.');
    if(!satScore)moves.push('Complete a full SAT practice test or set a SAT target.');
    if(allColleges.length<6)moves.push('Build a balanced college list with at least 6 schools.');
    if(overallPct!=null&&overallPct<80)moves.push('Drill missed categories until your question grade rises above 80%.');
    if(!moves.length)moves.push('You have a complete dashboard. Keep updating it after every practice cycle.');
    next.innerHTML=moves.map(function(m){return '<div class="profile-row"><div><strong>'+profileEscape(m)+'</strong></div></div>';}).join('');
  }
}
