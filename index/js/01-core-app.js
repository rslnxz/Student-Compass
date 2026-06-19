// Tier colors and styles
const RARITY={
  common:   {color:"#94a3b8",bg:"rgba(148,163,184,.08)", border:"rgba(148,163,184,.28)", label:"Common",   order:0},
  rare:     {color:"#4f8ef7",bg:"rgba(79,142,247,.1)",   border:"rgba(79,142,247,.35)",  label:"Rare",      order:1},
  epic:     {color:"#a78bfa",bg:"rgba(167,139,250,.12)", border:"rgba(167,139,250,.45)", label:"Epic",      order:2},
  legendary:{color:"#a78bfa",bg:"rgba(167,139,250,.1)",   border:"rgba(167,139,250,.4)",   label:"Legendary", order:3},
  mythic:   {color:"#f472b6",bg:"rgba(244,114,182,.1)",  border:"rgba(244,114,182,.4)",  label:"Mythic",    order:4},
};

function loadStats(){
  try{
    const raw=localStorage.getItem('apush_stats');
    if(!raw)return defStats();
    const s=JSON.parse(raw);
    s.periodsPlayed=new Set(s.periodsPlayedArr||[]);s.satUnitsPracticed=new Set(s.satUnitsArr||[]);
    return s;
  }catch(e){return defStats();}
}
function defStats(){return{xp:0,quizzes:0,totalQs:0,totalCorrect:0,perfectScores:0,maxStreak:0,earnedAchs:[],periodsPlayed:new Set(),periodsPlayedArr:[],satQuizzes:0,satEngQuizzes:0,satMathQuizzes:0,satTotalQs:0,satCorrect:0,satPerfect:0,satEngPerfect:0,satMathPerfect:0,satStreak:0,maxSatStreak:0,bothSAT:false,earlyBird:false,nightOwl:false,comboQuizzes:0,longestQuiz:0,fcCardsFlipped:0,fcVocabKnew:0,fcRootsKnew:0,fcDecksCompleted:0,fcPerfectDecks:0,satPtTaken:0,satPtBestScore:0,satUnitsPracticed:new Set(),satUnitsArr:[],lowScoreRetries:0,catHistory:{},quizLog:[]};}
function saveStats(s){s.periodsPlayedArr=[...s.periodsPlayed];s.satUnitsArr=[...s.satUnitsPracticed];localStorage.setItem('apush_stats',JSON.stringify(s));if(window._fbUser&&window.fbPushStats)window.fbPushStats(window._fbUser.uid,s);}

let stats=loadStats();

function getLevel(xp){let lv=LEVELS[0];for(const l of LEVELS){if(xp>=l.minXP)lv=l;else break;}return lv;}
function getNextLevel(xp){for(const l of LEVELS){if(l.minXP>xp)return l;}return null;}
function lvPct(xp){const cur=getLevel(xp),next=getNextLevel(xp);if(!next)return 100;return Math.round(((xp-cur.minXP)/(next.minXP-cur.minXP))*100);}
function calcXP(score,total){
  const pct=score/total;
  let base=score*5; // 5 XP per correct answer (was 10)
  if(pct===1)base+=30;  // perfect bonus (was 50)
  if(pct>=.8)base+=10;  // good score bonus (was 20)
  if(total>=15)base+=8; // long quiz bonus (was 15)
  if(total>=20)base+=8; // extra long quiz bonus (was 15)
  return base;
}

let selectedPeriod='all',quiz=[],cur=0,score=0,answers=[],curStreak=0;

function selectPeriod(el){
  document.querySelectorAll('.p-btn').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel');selectedPeriod=el.dataset.period;updateAvailNote();
}
function updateSlider(input){
  const val=+input.value,min=+input.min,max=+input.max;
  input.style.setProperty('--pct',((val-min)/(max-min)*100).toFixed(1)+'%');
  document.getElementById('count-display').textContent=val;updateAvailNote();
}
function getPool(){return selectedPeriod==='all'?[...BANK]:BANK.filter(q=>q.p===+selectedPeriod);}
function updateAvailNote(){
  const pool=getPool(),want=+document.getElementById('count-slider').value;
  const note=document.getElementById('avail-note'),btn=document.getElementById('start-btn');
  if(!pool.length){note.textContent='No questions available.';btn.disabled=true;}
  else if(want>pool.length){note.textContent=`Only ${pool.length} question${pool.length>1?'s':''} available - quiz will use all of them.`;btn.disabled=false;}
  else{note.textContent=`${pool.length} question${pool.length>1?'s':''} available in this selection.`;btn.disabled=false;}
}
(function(){updateSlider(document.getElementById('count-slider'));updateSATSlider(document.getElementById('sat-count-slider'));})();

function show(id){
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('on','sat-screen-active'));
  const el=document.getElementById(id);
  if(!el)return;
  let parent=el.parentElement;
  while(parent){
    if(parent.classList&&parent.classList.contains('sec')){
      parent.classList.add('on');
      if(parent.id==='s-sat'&&id!=='s-sat')parent.classList.add('sat-screen-active');
    }
    parent=parent.parentElement;
  }
  el.classList.add('on');
  if(id==='s-sat')el.classList.remove('sat-screen-active');
}
let _tlDone=false;
function showTimeline(){show('s-timeline');setNav('nav-timeline');if(!_tlDone){_tlDone=true;buildTimeline();}}
function setNav(id){
  document.querySelectorAll('.nav-btn,.drawer-btn').forEach(b=>b.classList.remove('active'));
  const el=document.getElementById(id);
  if(el) el.classList.add('active');
}

function toggleMenu(){
  const btn=document.getElementById('hamburger-btn');
  const drawer=document.getElementById('nav-drawer');
  const overlay=document.getElementById('drawer-overlay');
  const open=drawer.classList.toggle('open');
  overlay.classList.toggle('open',open);
  btn.classList.toggle('open',open);
  document.body.classList.toggle('menu-open',open);
}
function closeMenu(){
  document.getElementById('nav-drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
  document.getElementById('hamburger-btn').classList.remove('open');
  document.body.classList.remove('menu-open');
}
function goHome(){show('s-landing');setNav('nav-landing');setTimeout(initCounters,400);setTimeout(initReveal,100);}
function showAchievements(){renderAch();show('s-ach');setNav('nav-ach');}
function showProfile(){if(typeof renderProfile==='function')renderProfile();show('s-profile');setNav('nav-profile');}
function readLocalList(key){try{return JSON.parse(localStorage.getItem(key)||'[]')||[];}catch(e){return [];}}
function writeLocalList(key,items){try{localStorage.setItem(key,JSON.stringify(items));}catch(e){}}
function escapeLocalText(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function renderLocalComments(key,rootId,emptyText){
  const root=document.getElementById(rootId); if(!root)return;
  const items=readLocalList(key);
  root.innerHTML=items.map(item=>'<article class="feedback-entry"><strong>'+escapeLocalText(item.type)+'</strong><small>'+escapeLocalText(item.name||'Anonymous')+' - '+escapeLocalText(item.date)+'</small><p>'+escapeLocalText(item.message)+'</p></article>').join('') || '<div class="college-empty">'+escapeLocalText(emptyText)+'</div>';
}
function saveLocalComment(key,nameId,typeId,messageId){
  const msg=(document.getElementById(messageId)||{}).value||'';
  if(msg.trim().length<5){alert('Please write a little more before submitting.');return false;}
  const item={name:((document.getElementById(nameId)||{}).value||'Anonymous').trim()||'Anonymous',type:(document.getElementById(typeId)||{}).value||'Comment',message:msg.trim(),date:new Date().toLocaleDateString()};
  const items=readLocalList(key);items.unshift(item);writeLocalList(key,items.slice(0,30));
  document.getElementById(messageId).value='';
  if(typeof showToast==='function')showToast('','Saved','Your comment was saved on this browser.');
  return true;
}
function renderPurposeComments(){renderLocalComments('scPurposeComments','purpose-comments','No comments yet.');}
function renderSiteFeedback(){renderLocalComments('scSiteFeedback','site-feedback-list','No feedback submitted yet.');}
function submitPurposeComment(e){e.preventDefault();if(saveLocalComment('scPurposeComments','purpose-name','purpose-type','purpose-message'))renderPurposeComments();}
function submitSiteFeedback(e){e.preventDefault();if(saveLocalComment('scSiteFeedback','feedback-name','feedback-type','feedback-message'))renderSiteFeedback();}
function showPurpose(){renderPurposeComments();show('s-purpose');setNav('nav-purpose');}
function showFeedback(){renderSiteFeedback();show('s-feedback');setNav('nav-feedback');}


let _testPaused=false;
function resetPauseControl(){
  _testPaused=false;
  const btn=document.getElementById('test-pause-btn');
  if(btn) btn.textContent='Pause';
}
function toggleTestPause(){
  const btn=document.getElementById('test-pause-btn');
  _testPaused=!_testPaused;
  if(btn) btn.textContent=_testPaused?'Resume':'Pause';
  if(_testPaused){
    if(typeof ptTimerInterval!=='undefined') clearInterval(ptTimerInterval);
    if(typeof _timerInterval!=='undefined') clearInterval(_timerInterval);
  } else if(window._ptMode && typeof startPTTimer==='function' && ptSecondsLeft>0){
    startPTTimer(ptSecondsLeft);
  } else if(typeof stratStartTimer==='function'){
    stratStartTimer();
  }
}
function exitCurrentTest(kind){
  if(typeof ptTimerInterval!=='undefined') clearInterval(ptTimerInterval);
  if(typeof _timerInterval!=='undefined') clearInterval(_timerInterval);
  window._ptMode=false;
  resetPauseControl();
  if(kind==='apush'){show('s-start');setNav('nav-quiz');}
  else{showSAT();}
}

function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function startQuiz(){
  const pool=getPool(),want=Math.min(+document.getElementById('count-slider').value,pool.length);
  quiz=shuffle(pool).slice(0,want);cur=0;score=0;answers=[];curStreak=0;
  resetPauseControl();
  renderQ();show('s-quiz');setNav('nav-quiz');
}

// Match question state
let matchState={selectedLeft:null,matched:{},rightOrder:[]};

function renderQ(){
  const q=quiz[cur];
  document.getElementById('q-lbl').textContent=`Question ${cur+1} of ${quiz.length}`;
  document.getElementById('q-score').textContent=`Score: ${score}`;
  document.getElementById('q-bar').style.width=`${Math.round((cur/quiz.length)*100)}%`;
  document.getElementById('q-period').textContent=q.pl;
  document.getElementById('q-expl').style.display='none';
  document.getElementById('q-next').style.display='none';

  // Stimulus
  const stimEl=document.getElementById('q-stimulus');
  if(q.stimulus){
    stimEl.innerHTML=`<div class="stimulus-tag">Primary Source</div>
<div class="stimulus-box"><div class="stimulus-source">${q.stimulus.source}</div>
<div class="stimulus-text">"${q.stimulus.text}"</div></div>`;
    stimEl.style.display='block';
  } else { stimEl.innerHTML='';stimEl.style.display='none'; }

  document.getElementById('q-text').textContent=q.q;
  const box=document.getElementById('q-choices');
  box.innerHTML='';

  if(q.pairs){
    // MATCH QUESTION
    matchState={selectedLeft:null,matched:{},rightOrder:[]};
    const lefts=q.pairs.map(p=>p.left);
    const rights=[...q.pairs.map(p=>p.right)];
    // shuffle rights
    for(let i=rights.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rights[i],rights[j]]=[rights[j],rights[i]];}
    matchState.rightOrder=rights;

    box.innerHTML=`<div class="match-tag">ðŸ”— Matching Question</div>
<div class="match-score-txt" id="match-score-txt">Match each item on the left with the correct item on the right.</div>
<div class="match-grid">
  <div class="match-col"><div class="match-col-label">Terms</div><div id="lefts-col"></div></div>
  <div class="match-col"><div class="match-col-label">Descriptions</div><div id="rights-col"></div></div>
</div>`;

    const lCol=document.getElementById('lefts-col');
    const rCol=document.getElementById('rights-col');

    lefts.forEach((l,i)=>{
      const btn=document.createElement('div');
      btn.className='match-item';btn.dataset.left=l;btn.dataset.idx=i;
      btn.textContent=l;
      btn.onclick=()=>selectLeft(btn,l,lefts,rights);
      lCol.appendChild(btn);
    });
    rights.forEach((r,i)=>{
      const btn=document.createElement('div');
      btn.className='match-item';btn.dataset.right=r;
      btn.textContent=r;
      btn.onclick=()=>selectRight(btn,r,q.pairs);
      rCol.appendChild(btn);
    });
  } else {
    // STANDARD MC
    Object.entries(q.c).forEach(([k,v])=>{
      const btn=document.createElement('button');btn.className='choice';
      btn.innerHTML=`<span class="key">${k}</span><span>${v}</span>`;
      btn.onclick=()=>handleSelect(k);box.appendChild(btn);
    });
  }
}

function selectLeft(btn,leftVal,lefts,rights){
  if(matchState.matched[leftVal]!==undefined)return;
  document.querySelectorAll('.match-item[data-left]').forEach(b=>b.classList.remove('sel-left'));
  matchState.selectedLeft=leftVal;
  btn.classList.add('sel-left');
}

function selectRight(btn,rightVal,pairs){
  if(!matchState.selectedLeft)return;
  const leftVal=matchState.selectedLeft;
  if(matchState.matched[leftVal]!==undefined)return;
  // find correct right for this left
  const correctRight=pairs.find(p=>p.left===leftVal).right;
  const isCorrect=rightVal===correctRight;
  // mark left
  const leftBtn=document.querySelector(`.match-item[data-left="${CSS.escape(leftVal)}"]`);
  if(leftBtn){leftBtn.classList.remove('sel-left');leftBtn.classList.add(isCorrect?'matched-correct':'matched-wrong');}
  // mark right
  btn.classList.add(isCorrect?'matched-correct':'matched-wrong');
  matchState.matched[leftVal]=isCorrect;
  matchState.selectedLeft=null;

  // Check if all matched
  const allDone=Object.keys(matchState.matched).length===pairs.length;
  if(allDone){
    const numCorrect=Object.values(matchState.matched).filter(Boolean).length;
    const pts=numCorrect===pairs.length?1:numCorrect>=pairs.length/2?0.5:0;
    if(pts>0)score+=pts;
    const pct=Math.round((numCorrect/pairs.length)*100);
    // show result and record answer
    const q=quiz[cur];
    answers.push({...q,userAnswer:`${numCorrect}/${pairs.length} correct`,correct:numCorrect===pairs.length});
    if(window.StudentCompassData){
      window.StudentCompassData.recordAttempt({domain:'APUSH',skill:q.pl||q.cat||'APUSH Matching',correct:numCorrect===pairs.length,question:q.q,userAnswer:`${numCorrect}/${pairs.length} correct`,correctAnswer:'Full match',explanation:q.e,source:'APUSH Matching'});
    }
    const expl=document.getElementById('q-expl');
    expl.className='expl '+(numCorrect===pairs.length?'ok':'bad');
    expl.innerHTML=`<span class="verdict ${numCorrect===pairs.length?'ok':'bad'}">${numCorrect===pairs.length?' Perfect Match! ':'X '+numCorrect+'/'+pairs.length+' correct. '}</span>${q.e}`;
    expl.style.display='block';
    const nxt=document.getElementById('q-next');
    nxt.style.display='flex';
    nxt.textContent=cur+1>=quiz.length?'See Results ->':'Next ->';
    document.getElementById('q-score').textContent=`Score: ${Math.round(score*10)/10}`;
    // dim unmatched rights
    document.querySelectorAll('.match-item[data-right]').forEach(b=>{
      if(!b.classList.contains('matched-correct')&&!b.classList.contains('matched-wrong'))b.classList.add('dimmed');
    });
  }
}

function handleSelect(key){
  const q=quiz[cur];const ok=key===q.a;
  if(ok){score++;curStreak++;}else{curStreak=0;}
  answers.push({...q,userAnswer:key,correct:ok});
  if(window.StudentCompassData){
    window.StudentCompassData.recordAttempt({domain:'APUSH',skill:q.pl||q.cat||'APUSH Practice',correct:ok,question:q.q,userAnswer:key,correctAnswer:q.a,explanation:q.e,source:'APUSH Practice'});
  }
  document.querySelectorAll('.choice').forEach(btn=>{
    const k=btn.querySelector('.key').textContent;btn.disabled=true;
    if(k===q.a)btn.classList.add('correct');
    else if(k===key)btn.classList.add('wrong');
    else btn.classList.add('dim');
  });
  const expl=document.getElementById('q-expl');
  expl.className='expl '+(ok?'ok':'bad');
  expl.innerHTML=`<span class="verdict ${ok?'ok':'bad'}">${ok?' Correct! ':`X Correct answer: ${q.a}. `}</span>${q.e}`;
  expl.style.display='block';
  const nxt=document.getElementById('q-next');nxt.style.display='flex';
  nxt.textContent=cur+1>=quiz.length?'See Results ->':'Next ->';
}

function nextQ(){if(cur+1>=quiz.length)showResults();else{cur++;renderQ();}}

function showResults(){
  const total=quiz.length,pct=score/total;
  stats=loadStats();
  const xpEarned=calcXP(score,total),prevXP=stats.xp;
  stats.xp+=xpEarned;stats.quizzes++;stats.totalQs+=total;stats.totalCorrect+=score;if(total>stats.longestQuiz)stats.longestQuiz=total;
  if(pct===1)stats.perfectScores++;
  if(curStreak>stats.maxStreak)stats.maxStreak=curStreak;
  if(selectedPeriod!=='all')stats.periodsPlayed.add(+selectedPeriod);
  else for(let i=1;i<=9;i++)stats.periodsPlayed.add(i);

  const newAchs=[];
  ACHIEVEMENTS.forEach(ach=>{
    if(!stats.earnedAchs.includes(ach.id)&&ach.check(stats)){stats.earnedAchs.push(ach.id);newAchs.push(ach);}
  });
  saveStats(stats);

  document.getElementById('r-score').textContent=`${score}/${total}`;
  const [label,color]=pct>=.9?['Outstanding!','#4ade80']:pct>=.8?['Great Work!','#facc15']:pct>=.6?['Almost There','#fb923c']:['Keep Studying','#f87171'];
  const g=document.getElementById('r-grade');g.textContent=label;g.style.color=color;
  document.getElementById('r-msg').textContent=pct>=.8?'You\'re well prepared for the AP exam.':pct>=.6?'Review the periods where you made mistakes.':'Focus on primary sources and key events from each period.';
  document.getElementById('r-xp-earned').textContent=`+${xpEarned} XP earned`;
  const lp=lvPct(stats.xp);
  setTimeout(()=>{document.getElementById('r-xp-bar').style.width=lp+'%';},300);
  const curLv=getLevel(stats.xp),nxtLv=getNextLevel(stats.xp);
  document.getElementById('r-xp-label').textContent=nxtLv?`${curLv.name} - ${stats.xp} XP - ${nxtLv.minXP-stats.xp} XP to ${nxtLv.name}`:`${curLv.name} - ${stats.xp} XP - MAX LEVEL `;

  const prevLv=getLevel(prevXP),newLv=getLevel(stats.xp);
  if(newLv.name!==prevLv.name)setTimeout(()=>showToast(newLv.icon,'Level Up!',`You are now a ${newLv.name}!`),800);
  newAchs.forEach((ach,i)=>setTimeout(()=>showToast(ach.icon,'Achievement Unlocked!',ach.name),1600+i*2200));

  const rev=document.getElementById('r-review');rev.innerHTML='';
  answers.forEach((a,i)=>{
    const d=document.createElement('div');d.className='rev-item '+(a.correct?'ok':'bad');
    const youAns=a.correct
      ?`<span style="color:#4ade80;font-weight:600">You answered: ${a.userAnswer} - Correct </span>`
      :`<span style="color:var(--err);font-weight:600">You answered: ${a.userAnswer} &nbsp;-&nbsp; Correct: ${a.a}</span>`;
    d.innerHTML=`<div style="width:100%"><div class="rev-period">Q${i+1} - ${a.pl}</div><div class="rev-q">${a.q}</div><div class="rev-ans">${youAns}</div><div class="rev-expl"> ${a.e}</div></div>`;
    rev.appendChild(d);
  });
  show('s-results');setNav('nav-quiz');
}

function renderAch(){
  stats=loadStats();
  const lv=getLevel(stats.xp),next=getNextLevel(stats.xp),pct=lvPct(stats.xp);
  document.getElementById('lv-icon').textContent=lv.icon;
  document.getElementById('lv-name').textContent=lv.name;
  document.getElementById('lv-name').style.color=lv.color;
  document.getElementById('lv-xp').textContent=`${stats.xp} XP total`;
  const bar=document.getElementById('lv-bar');bar.style.width='0%';
  setTimeout(()=>{bar.style.width=pct+'%';bar.style.background=`linear-gradient(90deg,${lv.color}88,${lv.color})`;},120);
  document.getElementById('lv-next').textContent=next?`${next.minXP-stats.xp} XP to ${next.name}`:'Maximum level reached!';

  const acc=stats.totalQs>0?Math.round((stats.totalCorrect/stats.totalQs)*100):0;
  document.getElementById('stats-grid').innerHTML=`
    <div class="stat-box"><div class="stat-box-num">${stats.quizzes}</div><div class="stat-box-lbl">Quizzes</div></div>
    <div class="stat-box"><div class="stat-box-num">${stats.totalQs}</div><div class="stat-box-lbl">Questions</div></div>
    <div class="stat-box"><div class="stat-box-num">${acc}%</div><div class="stat-box-lbl">Accuracy</div></div>
    <div class="stat-box"><div class="stat-box-num">${stats.totalCorrect}</div><div class="stat-box-lbl">Correct</div></div>
    <div class="stat-box"><div class="stat-box-num">${stats.maxStreak}</div><div class="stat-box-lbl">Best Streak</div></div>
    <div class="stat-box"><div class="stat-box-num">${stats.perfectScores}</div><div class="stat-box-lbl">Perfect</div></div>`;

  const ag=document.getElementById('ach-grid');ag.innerHTML='';
  const rarityOrder=['common','rare','epic','legendary','mythic'];
  const rarityLabels={common:'âšª Common',rare:'ðŸ”µ Rare',epic:'ðŸŸ£ Epic',legendary:'ðŸŸ¡ Legendary',mythic:'ðŸŒˆ Mythic'};
  const earned_total=stats.earnedAchs.length;
  const total_count=ACHIEVEMENTS.length;
  // Summary line
  const summary=document.createElement('p');
  summary.style.cssText='font-size:15px;color:var(--muted);margin-bottom:20px;text-align:center;letter-spacing:.5px';
  summary.textContent=`${earned_total} of ${total_count} achievements earned`;
  ag.appendChild(summary);

  // Recommended next - 3 closest to unlocking
  const locked = ACHIEVEMENTS.filter(a => !stats.earnedAchs.includes(a.id));
  if (locked.length > 0) {
    const recSection = document.createElement('div');
    recSection.style.cssText = 'background:rgba(59,130,246,.04);border:1px solid rgba(59,130,246,.14);border-radius:12px;padding:18px;margin-bottom:24px';
    let recHTML = '<div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:12px;font-weight:600">Closest to Unlocking</div><div style="display:flex;flex-direction:column;gap:10px">';
    // Score each locked achievement by how close based on check function heuristics
    const withScore = locked.map(a => {
      const r = RARITY[a.tier] || RARITY.common;
      // Priority: common first (easiest), then rare, epic, legendary, mythic
      const rarityScore = ['common','rare','epic','legendary','mythic'].indexOf(a.tier);
      return { a, r, score: rarityScore };
    }).sort((a,b) =>a.score - b.score).slice(0, 3);

    withScore.forEach(({a, r}) => {
      recHTML += `<div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:22px">${a.icon}</span>
        <div style="flex:1;min-width:0">
          <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:15px;color:${r.color};margin-bottom:2px">${a.name}</div>
          <div style="font-size:13px;color:var(--muted);line-height:1.45">${a.desc}</div>
        </div>
        <span style="font-size:10px;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;border-radius:4px;background:${r.bg};color:${r.color};border:1px solid ${r.border};white-space:nowrap;flex-shrink:0">${r.label}</span>
      </div>`;
    });
    recHTML += '</div>';
    recSection.innerHTML = recHTML;
    ag.appendChild(recSection);
  }

  rarityOrder.forEach(rarity=>{
    const group=ACHIEVEMENTS.filter(a=>a.tier===rarity);
    if(!group.length)return;
    const r=RARITY[rarity];
    const earnedInGroup=group.filter(a=>stats.earnedAchs.includes(a.id)).length;

    // Section header
    const sec=document.createElement('div');sec.className='ach-section';
    const hdr=document.createElement('div');hdr.className='ach-section-header';
    hdr.innerHTML=`<span class="ach-section-title" style="color:${r.color}">${rarityLabels[rarity]}</span><span class="ach-section-count">${earnedInGroup}/${group.length}</span><div class="ach-section-line" style="background:${r.color}"></div>`;
    sec.appendChild(hdr);

    const grid=document.createElement('div');grid.className='ach-grid';
    // Sort: earned first, then locked
    [...group].sort((a,b)=>{
      const ae=stats.earnedAchs.includes(a.id),be=stats.earnedAchs.includes(b.id);
      return ae===be?0:ae?-1:1;
    }).forEach(ach=>{
      const earned=stats.earnedAchs.includes(ach.id);
      const d=document.createElement('div');
      d.className=`ach-item rarity-${rarity} `+(earned?'earned':'locked');
      d.style.cssText=earned?`background:${r.bg};`:'';
      d.innerHTML=`<div class="ach-rarity-bar"></div>
        <div class="ach-icon">${ach.icon}</div>
        <div style="min-width:0">
          <div class="ach-rarity-badge" style="background:${r.bg};color:${r.color};border:1px solid ${r.border}">${r.label}</div>
          <div class="ach-name" style="color:${earned?r.color:'var(--muted)'}">${ach.name}</div>
          <div class="ach-desc">${ach.desc}</div>
          ${earned
            ? `<div class="ach-earned-tag"> Earned</div>`
            : `<div style="font-size:12px;color:rgba(136,153,180,.45);margin-top:4px;font-style:italic">Not yet unlocked</div>`
          }
        </div>`;
      grid.appendChild(d);
    });
    sec.appendChild(grid);
    ag.appendChild(sec);
  });
}

let toastTimer;
function showToast(icon,title,desc){
  const t=document.getElementById('toast');
  document.getElementById('t-icon').textContent=icon;
  document.getElementById('t-title').textContent=title;
  document.getElementById('t-desc').textContent=desc;
  t.classList.add('show');clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),3400);
}


// â•â• SAT ENGLISH BANK (50 questions) â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•


// â•â• SAT MATH BANK (50 questions) â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•



// Rebuild SAT banks with generated, internally consistent SAT-style questions.
(function rebuildSATQuestionBanks(){
  const letters=['A','B','C','D'];
  function pack(correct, wrong, seed){
    const vals=[String(correct),...wrong.map(String)].filter((v,i,a)=>a.indexOf(v)===i).slice(0,4);
    while(vals.length<4) vals.push(String(Number(correct)+vals.length+seed));
    const pos=seed%4, ordered=[]; let wi=1;
    for(let i=0;i<4;i++) ordered[i]=i===pos?String(correct):vals[wi++];
    return {c:{A:ordered[0],B:ordered[1],C:ordered[2],D:ordered[3]},a:letters[pos]};
  }
  function q(cat, question, correct, wrong, exp, seed, extra){
    return Object.assign({cat:cat,q:question,...pack(correct,wrong,seed),e:exp},extra||{});
  }
  const eng=[], math=[];

  const vocab=[
    ['meticulous','careful and precise','careless','ordinary','temporary'],['ambivalent','having mixed feelings','certain','angry','generous'],['bolster','support or strengthen','criticize','hide','simplify'],['novel','new or original','ancient','predictable','minor'],['pragmatic','practical','idealistic','careless','emotional'],['scrutinize','examine closely','ignore','summarize','decorate'],['concise','brief but complete','wordy','unclear','untrue'],['resilient','able to recover','fragile','silent','wealthy'],['subtle','delicate or not obvious','loud','false','rapid'],['vindicate','clear from blame','accuse','delay','imitate']
  ];
  for(let i=0;i<60;i++){
    const v=vocab[i%vocab.length];
    eng.push(q('Vocabulary in Context',`Researchers praised the ${v[0]} design because every measurement was checked twice before publication. As used here, "${v[0]}" most nearly means:`,v[1],[v[2],v[3],v[4]],`The surrounding context says the measurements were checked twice, so "${v[0]}" means ${v[1]}.`,i));
  }
  const grammarRules=[
    ['The committee ___ meeting after school.','is','are','were','have been','A collective noun acting as one unit takes a singular verb.'],
    ['Neither the coach nor the players ___ ready.','are','is','was','has been','With neither/nor, the verb agrees with the nearer subject, "players."'],
    ['The scientist revised the report ___ submitting it.','before','because','although','therefore','"Before" correctly shows sequence.'],
    ['Running through the archive, Maya found the missing letter. Which revision is clearest?','While running through the archive, Maya found the missing letter.','Running through the archive, the missing letter was found by Maya.','The missing letter, running through the archive, was found.','Maya found, running, the archive letter.','The modifier must clearly describe Maya, not the letter.'],
    ['The novel was long ___ engaging.','but','therefore','for example','however','"But" correctly contrasts length with engagement.']
  ];
  for(let i=0;i<70;i++){
    const r=grammarRules[i%grammarRules.length];
    eng.push(q('Grammar & Usage',r[0],r[1],[r[2],r[3],r[4]],r[5],100+i));
  }
  for(let i=0;i<40;i++){
    eng.push(q('Text Structure',`A passage first describes a common belief about urban parks, then presents a study showing that small neighborhood parks can be as beneficial as large central parks. What is the main function of the study in the passage?`,`It challenges a common assumption with evidence`,[`It introduces an unrelated historical detail`,`It summarizes both sides without taking a position`,`It defines a technical term from ecology`],`The study is used to challenge the opening belief by providing evidence against it.`,200+i));
  }
  for(let i=0;i<40;i++){
    eng.push(q('Command of Evidence',`A student claims that later school start times improve attendance. Which finding would best support the claim?`,`A district reported fewer morning absences after moving high school start times from 7:30 to 8:45.`,[`Students in the district said they preferred longer lunch periods.`,`The district changed its mascot in the same year.`,`Some schools start before 8:00 and some start after 8:00.`],`The correct evidence directly connects later start times with improved attendance.`,300+i));
  }
  const transitions=[['The first trial failed; ___, the team adjusted the procedure and tried again.','therefore','similarly','for example','in contrast'],['Many deserts are hot during the day; ___, they can become cold at night.','however','because','accordingly','for instance'],['The material is lightweight. ___, it is strong enough for bridge repairs.','Moreover','Nevertheless','Instead','Earlier']];
  for(let i=0;i<30;i++){
    const t=transitions[i%transitions.length];
    eng.push(q('Transitions & Rhetoric',t[0],t[1],[t[2],t[3],t[4]],`The transition must express the logical relationship between the two clauses.`,400+i));
  }
  for(let i=0;i<25;i++){
    eng.push(q('Rhetorical Synthesis',`A student wants to emphasize that two scientists reached similar conclusions independently. Which sentence best uses the notes?`,`Working separately, both scientists concluded that the enzyme responds to changes in temperature.`,[`The scientists worked in laboratories that used modern equipment.`,`Temperature can affect many enzymes in living cells.`,`One scientist published several articles before joining the university.`],`This choice directly emphasizes independent work and similar conclusions.`,500+i));
  }

  for(let i=0;i<60;i++){
    const a=2+(i%7), x=3+(i%11), b=1+(i%9), c=a*x+b;
    math.push(q('Linear Equations',`If ${a}x + ${b} = ${c}, what is the value of x?`,x,[x+1,x-1,x+2],`Subtract ${b} from both sides to get ${a}x = ${c-b}. Divide by ${a}: x = ${x}.`,600+i));
  }
  for(let i=0;i<60;i++){
    const r1=2+(i%8), r2=r1+1+(i%5), sum=r1+r2, prod=r1*r2;
    math.push(q('Advanced Math',`What are the solutions to x² - ${sum}x + ${prod} = 0?`,`x = ${r1} and x = ${r2}`,[`x = ${-r1} and x = ${-r2}`,`x = ${r1} only`,`x = ${sum} and x = ${prod}`],`The quadratic factors as (x - ${r1})(x - ${r2}) = 0, so the solutions are ${r1} and ${r2}.`,700+i));
  }
  for(let i=0;i<50;i++){
    const n=5+(i%6), mean=70+(i%12), added=80+(i%10), newMean=((n*mean+added)/(n+1)).toFixed(1);
    math.push(q('Data Analysis',`A class of ${n} students has a mean score of ${mean}. A new student with a score of ${added} joins the class. What is the new mean score?`,newMean,[Number(newMean)+1,Number(newMean)-1,mean],`Original total = ${n} x ${mean} = ${n*mean}. New total = ${n*mean+added}. Divide by ${n+1} to get ${newMean}.`,800+i));
  }
  for(let i=0;i<50;i++){
    const w=3+(i%8), h=4+(i%7), area=w*h;
    math.push(q('Geometry',`A rectangle has width ${w} and height ${h}. What is its area?`,area,[area+w,area+h,2*(w+h)],`Area of a rectangle is width x height: ${w} x ${h} = ${area}.`,900+i));
  }

  SAT_ENG.splice(0,SAT_ENG.length,...eng);
  SAT_MATH.splice(0,SAT_MATH.length,...math);
  window.SAT_ENG=SAT_ENG;
  window.SAT_MATH=SAT_MATH;
  window.__SAT_BANK_COUNTS__={english:SAT_ENG.length,math:SAT_MATH.length};
})();
// â•â• SAT STATE & FUNCTIONS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
let satSubject='english', satUnit='all', satQuiz=[], satCur=0, satScore=0, satAnswers=[];

function showSAT(){show('s-sat');setNav('nav-sat'); const tab=window._lastSatSubject||'overview'; showSATTab(tab);}

function showSATTab(tab){
  document.getElementById('sat-tab-overview').style.display = tab==='overview'?'':'none';
  document.getElementById('sat-tab-english').style.display  = tab==='english'?'':'none';
  document.getElementById('sat-tab-math').style.display     = tab==='math'?'':'none';
  const ptEl=document.getElementById('sat-tab-pt');
  if(ptEl) ptEl.style.display = tab==='pt'?'':'none';
  const drEl=document.getElementById('sat-tab-drills');
  if(drEl) drEl.style.display = tab==='drills'?'':'none';
  // Reset step flows on tab switch
  if(typeof satResetStep==='function'){satResetStep('english');satResetStep('math');}
  if(typeof drillsResetStep==='function') drillsResetStep();
  ['tab-overview','tab-english','tab-math','tab-pt','tab-drills'].forEach(id=>{
    const el=document.getElementById(id);
    if(!el)return;
    el.className='sat-tab';
    if(id==='tab-'+tab){
      if(tab==='overview') el.classList.add('active-overview');
      else if(tab==='english') el.classList.add('active-eng');
      else if(tab==='math') el.classList.add('active-math');
      else el.classList.add('pt-tab-active');
    }
  });
}

// â”€â”€ SAT Overview interactions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function satScoreSlider(val){
  val=+val;
  document.getElementById('score-slider-val').textContent=val;
  var label,color;
  if(val>=1500){label='Top 1% - Elite colleges (Harvard, MIT, Stanford)';color='#4ade80';}
  else if(val>=1400){label='Top 5% - Highly competitive (Ivy+, top LACs)';color='#4f8ef7';}
  else if(val>=1300){label='Top 10% - Strong (flagship state schools, strong privates)';color='#4f8ef7';}
  else if(val>=1200){label='Top 25% - Solid (most mid-tier schools, scholarships possible)';color='#a78bfa';}
  else if(val>=1000){label='Average range - Community college or open-enrollment schools';color='#f59e0b';}
  else{label='Below average - Focus on fundamentals before test day';color='#f87171';}
  document.getElementById('score-slider-label').textContent=label;
  document.getElementById('score-slider-label').style.color=color;
  try{localStorage.setItem('scSatGoal',JSON.stringify({score:val,label:label,updated:Date.now()}));}catch(e){}
}

function satAccToggle(btn){
  var body=btn.nextElementSibling;
  var arrow=btn.querySelector('.sat-acc-arrow');
  var isOpen=body.style.display!=='none';
  body.style.display=isOpen?'none':'block';
  arrow.style.transform=isOpen?'rotate(0deg)':'rotate(180deg)';
}

// â”€â”€ 3-step SAT flow helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var _satPendingSubject=null, _satPendingUnit=null;

function satPickSkill(subject, unit, card){
  _satPendingSubject=subject; _satPendingUnit=unit;
  var prefix=subject==='english'?'eng':'math';
  var skillDiv=document.getElementById(prefix+'-step-skill');
  var startDiv=document.getElementById(prefix+'-step-start');
  if(skillDiv) skillDiv.querySelectorAll('.sat-unit-card').forEach(function(c){
    c.style.opacity=c===card?'1':'0.45';
    c.style.transform=c===card?'translateY(-3px) scale(1.02)':'none';
  });
  if(startDiv) startDiv.style.display='block';
}

function satLaunchUnit(){
  if(!_satPendingSubject||!_satPendingUnit) return;
  window.startSATUnit(_satPendingSubject, _satPendingUnit);
}

function satResetStep(subject){
  _satPendingSubject=null; _satPendingUnit=null;
  var prefix=subject==='english'?'eng':'math';
  var skillDiv=document.getElementById(prefix+'-step-skill');
  var startDiv=document.getElementById(prefix+'-step-start');
  if(skillDiv){ if(startDiv) startDiv.style.display='none'; skillDiv.querySelectorAll('.sat-unit-card').forEach(function(c){c.style.opacity='1';c.style.transform='none';}); }
}

var _drillPendingSubject=null;

function drillsPickSubject(subject, card){
  _drillPendingSubject=subject;
  var skillDiv=document.getElementById('drills-step-skill');
  var startDiv=document.getElementById('drills-step-start');
  if(skillDiv) skillDiv.querySelectorAll('.sat-unit-card').forEach(function(c){
    c.style.opacity=c===card?'1':'0.45';
    c.style.transform=c===card?'translateY(-3px) scale(1.02)':'none';
  });
  if(startDiv) startDiv.style.display='block';
}

function drillsLaunch(){
  if(!_drillPendingSubject) return;
  var count=+(document.getElementById('drills-count-slider').value)||10;
  var bank=_drillPendingSubject==='english'?SAT_ENG:SAT_MATH;
  drillQ=shuffle([...bank]).slice(0,Math.min(count,bank.length));
  drillCur=0; drillDecisions=[];
  window._drillSubject=_drillPendingSubject;
  renderDrillQ();
  show('s-drills-quiz'); setNav('nav-sat');
}

function drillsResetStep(){
  _drillPendingSubject=null;
  var skillDiv=document.getElementById('drills-step-skill');
  var startDiv=document.getElementById('drills-step-start');
  if(startDiv) startDiv.style.display='none';
  if(skillDiv) skillDiv.querySelectorAll('.sat-unit-card').forEach(function(c){c.style.opacity='1';c.style.transform='none';});
}

function updateSATSlider(input){
  const val=+input.value, min=+input.min, max=+input.max;
  input.style.setProperty('--pct',((val-min)/(max-min)*100).toFixed(1)+'%');
  document.getElementById('sat-count-display').textContent=val;
  const note=document.getElementById('sat-avail-note');
  if(note) note.textContent=`${val} question${val>1?'s':''} selected.`;
}

function updateSATSliderMath(input){
  const val=+input.value, min=+input.min, max=+input.max;
  input.style.setProperty('--pct',((val-min)/(max-min)*100).toFixed(1)+'%');
  document.getElementById('sat-count-display-math').textContent=val;
  const note=document.getElementById('sat-avail-note-math');
  if(note) note.textContent=`${val} question${val>1?'s':''} selected.`;
}

function startSATUnit(subject, unit){
  try{
    if(typeof stats!=='undefined' && stats.satUnitsPracticed){stats.satUnitsPracticed.add(subject+':'+unit);saveStats(stats);}
    satSubject=subject;
    satUnit=unit;
    const bank=subject==='english'?SAT_ENG:SAT_MATH;
    const unitMap={'Grammar':['Grammar & Usage'],'Text Structure':['Transitions & Rhetoric','Text Structure'],'Evidence-Based':['Command of Evidence','Data Analysis','Evidence-Based'],'Rhetorical Synthesis':['Transitions & Rhetoric','Rhetorical Synthesis'],'Vocabulary in Context':['Vocabulary in Context'],'Linear Equations':['Linear Equations'],'Advanced Math':['Advanced Math'],'Data Analysis':['Data Analysis'],'Geometry':['Geometry']};
    let pool = unit==='all' ? bank : bank.filter(q=>{
      const targets=unitMap[unit]||[unit];
      return targets.some(t=>q.cat===t||String(q.cat).includes(t.split(' ')[0]));
    });
    if(!pool.length) pool=bank;
    if(!pool.length) throw new Error('No SAT questions found for '+subject+' / '+unit);
    const sliderEl=document.getElementById(subject==='english'?'sat-count-slider':'sat-count-slider-math');
    const want=Math.max(1,Math.min(+(sliderEl?sliderEl.value:10), pool.length));
    satQuiz=shuffle([...pool]).slice(0,want);
    satCur=0;satScore=0;satAnswers=[];_qTimes=[];
    if(typeof resetPauseControl==='function') resetPauseControl();
    show('s-sat-quiz');setNav('nav-sat');
    renderSATQ();
  }catch(err){
    console.error('SAT start failed',err);
    show('s-sat-quiz');setNav('nav-sat');
    renderSATError(err);
  }
}

function renderSATError(err){
  const text=document.getElementById('sq-text'), choices=document.getElementById('sq-choices');
  const lbl=document.getElementById('sq-lbl'), score=document.getElementById('sq-score'), bar=document.getElementById('sq-bar'), tag=document.getElementById('sq-tag'), stim=document.getElementById('sq-stimulus'), expl=document.getElementById('sq-expl'), next=document.getElementById('sq-next');
  if(lbl) lbl.textContent='SAT Practice';
  if(score) score.textContent='Setup issue';
  if(bar) bar.style.width='0%';
  if(tag) tag.innerHTML='<span class="sat-quiz-unit-tag math">SAT module error</span>';
  if(stim){stim.innerHTML='';stim.style.display='none';}
  if(text) text.textContent='The SAT quiz could not start. Error: '+(err&&err.message?err.message:String(err));
  if(choices) choices.innerHTML='<button class="choice" onclick="showSAT();showSATTab(\'overview\')"><span class="key">â†©</span><span>Back to SAT overview</span></button>';
  if(expl) expl.style.display='none';
  if(next) next.style.display='none';
}

function startSAT(subject){
  startSATUnit(subject,'all');
}

function renderSATQ(){
  const q=satQuiz[satCur];
  const isEng=satSubject==='english';
  document.getElementById('sq-lbl').textContent=`Question ${satCur+1} of ${satQuiz.length}`;
  document.getElementById('sq-score').textContent=`Score: ${satScore}`;
  document.getElementById('sq-bar').style.width=`${Math.round((satCur/satQuiz.length)*100)}%`;

  // Tag - show unit name
  const tag=document.getElementById('sq-tag');
  const unitLabel=satUnit==='all'?q.cat:q.cat;
  tag.innerHTML=`<span class="sat-quiz-unit-tag ${isEng?'eng':'math'}">${unitLabel}</span>`;

  // Stimulus / passage
  const stimEl=document.getElementById('sq-stimulus');
  if(q.passage){
    stimEl.innerHTML=`<div class="sat-passage"><div class="sat-passage-src">Passage</div>${q.passage.replace(/\n/g,'<br/>')}</div>`;
    stimEl.style.display='block';
  } else if(q.formula){
    stimEl.innerHTML=`<div class="sat-formula">${q.formula}</div>`;
    stimEl.style.display='block';
  } else {
    stimEl.innerHTML='';stimEl.style.display='none';
  }

  document.getElementById('sq-text').textContent=q.q;
  document.getElementById('sq-expl').style.display='none';
  const _nxt=document.getElementById('sq-next');
  if(_nxt){_nxt.style.display='none';_nxt.onclick=null;}
  stratStartTimer();

  const box=document.getElementById('sq-choices');
  box.innerHTML='';
  Object.entries(q.c).forEach(([k,v])=>{
    const btn=document.createElement('button');
    btn.className='choice';
    btn.innerHTML=`<span class="key" style="border-color:${isEng?'#4f8ef7':'#a78bfa'};color:${isEng?'#4f8ef7':'#a78bfa'}">${k}</span><span>${v}</span>`;
    btn.onclick=()=>handleSATSelect(k);
    box.appendChild(btn);
  });
}

function handleSATSelect(key){
  const q=satQuiz[satCur];
  const timeSpentSec=stratStopTimer(q);
  const ok=key===q.a;
  if(ok){satScore++;window._curSatStreak=(window._curSatStreak||0)+1;}
  else{window._curSatStreak=0;}
  satAnswers.push({...q,userAnswer:key,correct:ok});
  if(window.StudentCompassData){
    window.StudentCompassData.recordAttempt({domain:satSubject==='english'?'SAT Reading & Writing':'SAT Math',skill:q.cat||satUnit||'SAT Practice',correct:ok,question:q.q,userAnswer:key,correctAnswer:q.a,explanation:q.e,source:'SAT Unit Practice'});
  }

  document.querySelectorAll('#sq-choices .choice').forEach(btn=>{
    const k=btn.querySelector('.key').textContent;
    btn.disabled=true;
    if(k===q.a)btn.classList.add('correct');
    else if(k===key)btn.classList.add('wrong');
    else btn.classList.add('dim');
  });

  const expl=document.getElementById('sq-expl');
  expl.className='expl '+(ok?'ok':'bad');
  expl.innerHTML=`<span class="verdict ${ok?'ok':'bad'}">${ok?' Correct! ':`X Answer: ${q.a}. `}</span>${q.e}`;
  expl.style.display='block';

  const nxt=document.getElementById('sq-next');
  nxt.style.display='flex';
  nxt.textContent=satCur+1>=satQuiz.length?'See Results ->':'Next ->';
  nxt.onclick=window.satNextQ || satNextQ;
}

function satNextQ(){
  if(satCur+1>=satQuiz.length) showSATResults();
  else{satCur++;renderSATQ();}
}


function showSATResults(){
  const total=satQuiz.length;
  const pct=satScore/total;
  document.getElementById('sr-score').textContent=`${satScore}/${total}`;
  const isEng=satSubject==='english';
  const [label,color]=
    pct>=.9?['Excellent!','#4ade80']:
    pct>=.8?['Strong',isEng?'#4f8ef7':'#a78bfa']:
    pct>=.6?['Developing','#a78bfa']:
             ['Keep Practicing','#f87171'];
  const g=document.getElementById('sr-grade');
  g.textContent=label;g.style.color=color;
  document.getElementById('sr-msg').textContent=
    pct>=.8?`Solid ${isEng?'English':'Math'} performance - keep it up!`:
    pct>=.6?'Review the explanations and retry the missed questions.':
    'Focus on the question categories where you struggled most.';

  // Track SAT stats
  stats=loadStats();
  stats.satQuizzes=(stats.satQuizzes||0)+1;
  // Track category accuracy history
  if(!stats.catHistory) stats.catHistory={};
  const catAcc={};
  satAnswers.forEach(a=>{
    if(!catAcc[a.cat]) catAcc[a.cat]={c:0,t:0};
    catAcc[a.cat].t++;
    if(a.correct) catAcc[a.cat].c++;
  });
  Object.entries(catAcc).forEach(([cat,data])=>{
    if(!stats.catHistory[cat]) stats.catHistory[cat]=[];
    stats.catHistory[cat].push({pct:Math.round(data.c/data.t*100),date:Date.now()});
    if(stats.catHistory[cat].length>20) stats.catHistory[cat].shift(); // keep last 20
  });
  if(!stats.quizLog) stats.quizLog=[];
  stats.quizLog.push({date:Date.now(),score:satScore,total:satQuiz.length,subject:satSubject});
  if(stats.quizLog.length>50) stats.quizLog.shift();
  if(isEng) stats.satEngQuizzes=(stats.satEngQuizzes||0)+1;
  else       stats.satMathQuizzes=(stats.satMathQuizzes||0)+1;
  stats.satTotalQs=(stats.satTotalQs||0)+total;
  stats.satCorrect=(stats.satCorrect||0)+satScore;
  if(pct===1){
    stats.satPerfect=(stats.satPerfect||0)+1;
    if(isEng) stats.satEngPerfect=(stats.satEngPerfect||0)+1;
    else       stats.satMathPerfect=(stats.satMathPerfect||0)+1;
  }
  // combo: if APUSH quiz was done this session too
  if(window._apushDoneThisSession) stats.comboQuizzes=(stats.comboQuizzes||0)+1;
  window._satDoneThisSession=true;
  // max sat streak (track during quiz)
  if((window._curSatStreak||0)>(stats.maxSatStreak||0)) stats.maxSatStreak=window._curSatStreak||0;

  // Check new achievements
  const newAchs=[];
  ACHIEVEMENTS.forEach(ach=>{
    if(!stats.earnedAchs.includes(ach.id)&&ach.check(stats)){
      stats.earnedAchs.push(ach.id);newAchs.push(ach);
    }
  });
  saveStats(stats);

  newAchs.forEach((ach,i)=>setTimeout(()=>showAchToast(ach),800+i*2200));

  const rev=document.getElementById('sr-review');
  rev.innerHTML='';
  satAnswers.forEach((a,i)=>{
    const d=document.createElement('div');
    d.className='rev-item '+(a.correct?'ok':'bad');
    const youAns=a.correct
      ?`<span style="color:#4ade80;font-weight:600">You answered: ${a.userAnswer} </span>`
      :`<span style="color:var(--err);font-weight:600">You answered: ${a.userAnswer} - Correct: ${a.a}</span>`;
    d.innerHTML=`<div style="width:100%">
      <div class="rev-period">Q${i+1} - ${a.cat}</div>
      <div class="rev-q" style="margin-bottom:6px">${a.q.slice(0,120)}${a.q.length>120?'...':''}</div>
      <div class="rev-ans">${youAns}</div>
      <div class="rev-expl"> ${a.e}</div>
    </div>`;
    rev.appendChild(d);
  });
  // Strategy Score
  const ss = calcStrategyScore(satAnswers, _qTimes);
  renderStrategyScore(ss);
  renderTimeChart(satAnswers, _qTimes);

  renderNextAction(satAnswers);
  show('s-sat-results');setNav('nav-sat');window._lastSatSubject=satSubject;
}


// â•â• PRACTICE TEST â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
let ptQuiz=[], ptCur=0, ptAnswers=[], ptSection='english';

// SAT score conversion: raw pct ->scaled score (200-800)
function scaleSATScore(pct, section){
  // Approximate conversion table based on College Board data
  const table=[
    [1.00,800],[0.95,780],[0.90,760],[0.85,740],[0.80,720],
    [0.75,700],[0.70,670],[0.65,640],[0.60,610],[0.55,580],
    [0.50,550],[0.45,520],[0.40,490],[0.35,460],[0.30,430],
    [0.25,400],[0.20,370],[0.15,340],[0.10,310],[0.05,280],[0,200]
  ];
  for(let i=0;i<table.length-1;i++){
    const [p1,s1]=table[i],[p2,s2]=table[i+1];
    if(pct>=p2){
      const frac=(pct-p2)/(p1-p2);
      return Math.round((s2+frac*(s1-s2))/10)*10;
    }
  }
  return 200;
}

function satPercentile(total){
  if(total>=1500)return'Top 1%';
  if(total>=1400)return'Top 5%';
  if(total>=1300)return'Top 10%';
  if(total>=1200)return'Top 25%';
  if(total>=1050)return'About average';
  if(total>=900)return'Below average';
  return'Well below average - lots of room to grow!';
}

function buildPracticeTest(){
  // Build proportional question sets matching real SAT
  // English: 54 questions
  const engTargets={
    'Vocabulary in Context':10,
    'Grammar & Usage':14,
    'Command of Evidence':11,
    'Text Structure':8,
    'Transitions & Rhetoric':8,
    'Rhetorical Synthesis':3
  };
  // Math: 44 questions
  const mathTargets={
    'Linear Equations':15,
    'Advanced Math':13,
    'Data Analysis':9,
    'Geometry':7
  };

  const engPool={};
  SAT_ENG.forEach(q=>{
    const cat=q.cat;
    // Normalize category names
    const mapped=
      cat==='Grammar & Usage'?'Grammar & Usage':
      cat==='Command of Evidence'?'Command of Evidence':
      cat==='Transitions & Rhetoric'?'Transitions & Rhetoric':
      cat==='Data Analysis'?'Command of Evidence': // fold into evidence
      cat==='Text Structure'?'Text Structure':
      cat==='Rhetorical Synthesis'?'Rhetorical Synthesis':
      cat;
    if(!engPool[mapped])engPool[mapped]=[];
    engPool[mapped].push({...q,_displayCat:cat});
  });

  const mathPool={};
  SAT_MATH.forEach(q=>{
    const cat=q.cat;
    if(!mathPool[cat])mathPool[cat]=[];
    mathPool[cat].push(q);
  });

  let engQs=[];
  Object.entries(engTargets).forEach(([cat,n])=>{
    const pool=shuffle([...(engPool[cat]||[])]);
    engQs=engQs.concat(pool.slice(0,n).map(q=>({...q,_section:'english'})));
  });
  // pad to 54 if needed
  const extraEng=shuffle([...SAT_ENG]).filter(q=>!engQs.includes(q));
  while(engQs.length<54&&extraEng.length>0) engQs.push({...extraEng.shift(),_section:'english'});
  engQs=shuffle(engQs);

  let mathQs=[];
  Object.entries(mathTargets).forEach(([cat,n])=>{
    const pool=shuffle([...(mathPool[cat]||[])]);
    mathQs=mathQs.concat(pool.slice(0,n).map(q=>({...q,_section:'math'})));
  });
  const extraMath=shuffle([...SAT_MATH]).filter(q=>!mathQs.includes(q));
  while(mathQs.length<44&&extraMath.length>0) mathQs.push({...extraMath.shift(),_section:'math'});
  mathQs=shuffle(mathQs);

  // Interleave: english first, then math (with divider)
  return [...engQs.slice(0,54),...mathQs.slice(0,44)];
}

// startPracticeTest now defined in adaptive PT section above

function renderPTQ(){
  const q=ptQuiz[ptCur];
  const isEng=q._section==='english';
  const total=ptQuiz.length;
  const engCount=ptQuiz.filter(x=>x._section==='english').length;
  
  // Section label
  const sectionLabel=ptCur<engCount?`English - Q${ptCur+1} of ${engCount}`:`Math - Q${ptCur-engCount+1} of ${total-engCount}`;
  document.getElementById('sq-lbl').textContent=sectionLabel;
  document.getElementById('sq-score').textContent=`${ptCur+1}/${total}`;
  document.getElementById('sq-bar').style.width=`${Math.round((ptCur/total)*100)}%`;

  const tag=document.getElementById('sq-tag');
  tag.innerHTML=`<span class="sat-quiz-unit-tag ${isEng?'eng':'math'}">${q.cat}</span>`;

  const stimEl=document.getElementById('sq-stimulus');
  if(q.passage){
    stimEl.innerHTML=`<div class="sat-passage"><div class="sat-passage-src">Passage</div>${q.passage.replace(/\\n/g,'<br/>')}</div>`;
    stimEl.style.display='block';
  } else if(q.formula){
    stimEl.innerHTML=`<div class="sat-formula">${q.formula}</div>`;
    stimEl.style.display='block';
  } else {
    stimEl.innerHTML='';stimEl.style.display='none';
  }

  document.getElementById('sq-text').textContent=q.q;
  document.getElementById('sq-expl').style.display='none';
  document.getElementById('sq-next').style.display='none';

  const box=document.getElementById('sq-choices');
  box.innerHTML='';
  Object.entries(q.c).forEach(([k,v])=>{
    const btn=document.createElement('button');
    btn.className='choice';
    btn.innerHTML=`<span class="key" style="border-color:${isEng?'#4f8ef7':'#a78bfa'};color:${isEng?'#4f8ef7':'#a78bfa'}">${k}</span><span>${v}</span>`;
    btn.onclick=()=>handlePTSelect(k);
    box.appendChild(btn);
  });
}

function handlePTSelect(key){
  const q=ptQuiz[ptCur];
  const ok=key===q.a;
  ptAnswers.push({...q,userAnswer:key,correct:ok});

  document.querySelectorAll('#sq-choices .choice').forEach(btn=>{
    const k=btn.querySelector('.key').textContent;
    btn.disabled=true;
    if(k===q.a)btn.classList.add('correct');
    else if(k===key)btn.classList.add('wrong');
    else btn.classList.add('dim');
  });

  const expl=document.getElementById('sq-expl');
  expl.className='expl '+(ok?'ok':'bad');
  expl.innerHTML=`<span class="verdict ${ok?'ok':'bad'}">${ok?' Correct! ':`X Answer: ${q.a}. `}</span>${q.e}`;
  expl.style.display='block';

  const nxt=document.getElementById('sq-next');
  nxt.style.display='flex';
  nxt.textContent=ptCur+1>=ptQuiz.length?'See My Score ->':'Next ->';
  nxt.onclick=ptNextQ;
}

function ptNextQ(){
  if(ptCur+1>=ptQuiz.length) showPTResults();
  else{ptCur++;renderPTQ();}
}

function showPTResults(){
  window._ptMode=false;
  // Separate by section
  const engAns=ptAnswers.filter(a=>a._section==='english');
  const mathAns=ptAnswers.filter(a=>a._section==='math');

  const engCorrect=engAns.filter(a=>a.correct).length;
  const mathCorrect=mathAns.filter(a=>a.correct).length;
  const engPct=engCorrect/engAns.length;
  const mathPct=mathCorrect/mathAns.length;

  const engScore=scaleSATScore(engPct,'english');
  const mathScore=scaleSATScore(mathPct,'math');
  const totalScore=engScore+mathScore;
  try{
    stats=loadStats();
    stats.satPtTaken=(stats.satPtTaken||0)+1;
    stats.satPtBestScore=Math.max(stats.satPtBestScore||0,totalScore);
    saveStats(stats);
  }catch(e){}
  try{localStorage.setItem('scSatLastScore',JSON.stringify({total:totalScore,english:engScore,math:mathScore,updated:Date.now()}));}catch(e){}

  document.getElementById('pt-total-score').textContent=totalScore;
  document.getElementById('pt-percentile').textContent=satPercentile(totalScore);
  document.getElementById('pt-eng-score').textContent=engScore;
  document.getElementById('pt-eng-raw').textContent=`${engCorrect}/${engAns.length} correct`;
  document.getElementById('pt-math-score').textContent=mathScore;
  document.getElementById('pt-math-raw').textContent=`${mathCorrect}/${mathAns.length} correct`;

  // Per-category breakdown
  function buildBreakdown(answers, containerId, barClass){
    const cats={};
    answers.forEach(a=>{
      if(!cats[a.cat])cats[a.cat]={correct:0,total:0};
      cats[a.cat].total++;
      if(a.correct)cats[a.cat].correct++;
    });
    const container=document.getElementById(containerId);
    container.innerHTML='';
    Object.entries(cats).sort((a,b)=>(a[1].correct/a[1].total)-(b[1].correct/b[1].total)).forEach(([cat,data])=>{
      const pct=Math.round((data.correct/data.total)*100);
      const cls=pct>=80?barClass:pct>=60?'mid':'low';
      const row=document.createElement('div');
      row.className='breakdown-row';
      row.innerHTML=`<div class="breakdown-label">${cat}</div><div class="breakdown-bar-wrap"><div class="breakdown-bar ${cls}" style="width:0%" data-pct="${pct}"></div></div><div class="breakdown-pct" style="color:${pct>=80?'#22c55e':pct>=60?'#a78bfa':'#ef4444'}">${pct}%</div>`;
      container.appendChild(row);
    });
    // Animate bars
    setTimeout(()=>{
      container.querySelectorAll('.breakdown-bar').forEach(bar=>{
        bar.style.width=bar.dataset.pct+'%';
      });
    },150);
  }

  buildBreakdown(engAns,'pt-eng-breakdown','eng');
  buildBreakdown(mathAns,'pt-math-breakdown','math');

  // Study plan
  function genStudyPlan(){
    const allCats=[];
    const processAns=(answers)=>{
      const cats={};
      answers.forEach(a=>{
        if(!cats[a.cat])cats[a.cat]={correct:0,total:0,section:a._section};
        cats[a.cat].total++;
        if(a.correct)cats[a.cat].correct++;
      });
      Object.entries(cats).forEach(([cat,data])=>{
        allCats.push({cat,pct:data.correct/data.total,section:data.section,total:data.total});
      });
    };
    processAns(engAns);
    processAns(mathAns);
    allCats.sort((a,b)=>a.pct-b.pct);

    const studyDescs={
      'Vocabulary in Context':'Focus on elimination strategy - remove answers that are close but wrong in tone or intensity. Learn to recognize: ubiquitous, prescient, nuanced, seminal, ascetic.',
      'Grammar & Usage':'Review: subject-verb agreement with collective nouns, parallel structure in lists, comma vs. semicolon vs. colon, dangling modifiers, and pronoun agreement.',
      'Command of Evidence':'Practice reading data carefully before answering. Watch for: overstated conclusions, correlation vs. causation, and what the data actually shows vs. what it implies.',
      'Text Structure':'Practice identifying: main idea, author\'s purpose, what a specific sentence does, and how paragraphs are organized (problem/solution, compare/contrast, claim/evidence).',
      'Transitions & Rhetoric':'Memorize transition types: contrast (however, yet), addition (furthermore, moreover), example (for instance), cause (therefore, as a result), time (subsequently).',
      'Rhetorical Synthesis':'The student always has a specific goal. Match the goal to the answer: emphasize, contrast, illustrate, or specify. Eliminate answers that do different things.',
      'Linear Equations':'Practice: solving systems, writing equations from word problems, slope-intercept form, finding intercepts, and parallel/perpendicular lines.',
      'Advanced Math':'Focus on: factoring quadratics, function notation, exponential growth/decay, absolute value equations, and the vertex formula for parabolas.',
      'Data Analysis':'Review: mean/median/mode, correlation vs. causation, reading graphs accurately, exponential vs. linear models, probability rules, and normal distribution.',
      'Geometry':'Study: Pythagorean theorem, special right triangles (30-60-90, 45-45-90), circle formulas (arc length, sector area), similar triangles, and basic trig (sin/cos/tan).',
      'Text Structure':'Identify organizational patterns: how paragraphs begin, pivot, and conclude. Practice distinguishing between author\'s purpose and passage content.'
    };

    const container=document.getElementById('pt-study-items');
    container.innerHTML='';
    allCats.slice(0,6).forEach((item,i)=>{
      const pct=Math.round(item.pct*100);
      const priority=pct<50?'high':pct<70?'med':'good';
      const priorityLabel=pct<50?'!':pct<70?'~':'';
      const desc=studyDescs[item.cat]||`Practice more ${item.cat} questions in the unit drill mode.`;
      const div=document.createElement('div');
      div.className='study-item';
      div.innerHTML=`<div class="study-priority ${priority}">${priorityLabel}</div><div class="study-item-text"><div class="study-item-name">${item.cat} <span style="font-size:13px;color:var(--muted)">(${pct}% correct)</span></div><div class="study-item-desc">${desc}</div></div>`;
      container.appendChild(div);
    });
  }
  genStudyPlan();

  // Full review
  const rev=document.getElementById('pt-review');
  rev.innerHTML='';
  ptAnswers.forEach((a,i)=>{
    const d=document.createElement('div');
    d.className='rev-item '+(a.correct?'ok':'bad');
    const isEng=a._section==='english';
    const youAns=a.correct
      ?`<span style="color:#4ade80;font-weight:600"> ${a.userAnswer}</span>`
      :`<span style="color:var(--err);font-weight:600">X ${a.userAnswer} ->Correct: ${a.a}</span>`;
    d.innerHTML=`<div style="width:100%"><div class="rev-period">Math</div><div class="rev-q">${a.q.slice(0,100)}${a.q.length>100?'...':''}</div><div class="rev-ans">${youAns}</div><div class="rev-expl"> ${a.e}</div></div>`;
    rev.appendChild(d);
  });

  show('s-sat-pt-results');setNav('nav-sat');
}





// â•â• FLASHCARDS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
let fcDeck = 'vocab';
let fcQueue = [];
let fcCur = 0;
let fcKnew = 0;
let fcAgain = [];
let fcFlipped = false;
let fcReview = false;

function fcSetDeck(deck) {
  fcDeck = deck;
  document.getElementById('fc-tab-vocab').classList.toggle('active', deck === 'vocab');
  document.getElementById('fc-tab-roots').classList.toggle('active', deck === 'roots');
  fcRestart();
}

function fcShuffle() {
  for (let i = fcQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fcQueue[i], fcQueue[j]] = [fcQueue[j], fcQueue[i]];
  }
  fcCur = 0; fcKnew = 0; fcAgain = [];
  fcShowCard();
  document.getElementById('fc-done').style.display = 'none';
  document.getElementById('fc-card').style.display = '';
  document.getElementById('fc-controls') && null;
  document.querySelector('.fc-controls').style.display = 'flex';
  document.querySelector('.fc-meta').style.display = 'flex';
  document.querySelector('.fc-shuffle-row').style.display = 'flex';
}

function fcRestart(fromReview) {
  const base = fcDeck === 'vocab' ? FC_VOCAB : FC_ROOTS;
  fcQueue = [...base];
  fcCur = 0; fcKnew = 0; fcAgain = []; fcReview = false;
  document.getElementById('fc-done').style.display = 'none';
  document.getElementById('fc-card').style.display = '';
  document.querySelector('.fc-controls').style.display = 'flex';
  document.querySelector('.fc-meta').style.display = 'flex';
  document.querySelector('.fc-shuffle-row').style.display = 'flex';
  document.getElementById('fc-review-btn').style.display = 'none';
  document.getElementById('fc-score').textContent = ' 0';
  fcShowCard();
}

function fcReviewMode() {
  if (fcAgain.length === 0) return;
  fcQueue = [...fcAgain];
  fcAgain = []; fcCur = 0; fcKnew = 0; fcReview = true;
  document.getElementById('fc-done').style.display = 'none';
  document.getElementById('fc-card').style.display = '';
  document.querySelector('.fc-controls').style.display = 'flex';
  document.querySelector('.fc-meta').style.display = 'flex';
  document.querySelector('.fc-shuffle-row').style.display = 'flex';
  document.getElementById('fc-review-btn').style.display = 'none';
  fcShowCard();
}

function fcShowCard() {
  const card = document.getElementById('fc-card');
  // Remove flip without animation
  card.style.transition = 'none';
  card.classList.remove('flipped');
  fcFlipped = false;
  setTimeout(() => { card.style.transition = ''; }, 20);

  // Disable know/again buttons until flipped
  document.getElementById('fc-btn-knew').disabled = true;
  document.getElementById('fc-btn-again').disabled = true;

  const total = fcQueue.length;
  const item = fcQueue[fcCur];
  const isRoot = fcDeck === 'roots' && !fcReview ? true : (fcDeck === 'roots');

  // Update counter and progress
  document.getElementById('fc-counter').textContent = `${fcCur + 1} / ${total}`;
  document.getElementById('fc-progress').style.width = `${Math.round((fcCur / total) * 100)}%`;
  document.getElementById('fc-score').textContent = ` ${fcKnew}`;

  // Front face
  document.getElementById('fc-word').textContent = item.w;

  if (isRoot) {
    document.getElementById('fc-pos').textContent = 'Word Root / Prefix / Suffix';
  } else {
    document.getElementById('fc-pos').textContent = '';
  }

  // Back face
  document.getElementById('fc-def').textContent = item.d;
  document.getElementById('fc-ex').textContent = item.ex;
}

function fcFlip() {
  const card = document.getElementById('fc-card');
  fcFlipped = !fcFlipped;
  card.classList.toggle('flipped', fcFlipped);
  if (fcFlipped) {
    document.getElementById('fc-btn-knew').disabled = false;
    document.getElementById('fc-btn-again').disabled = false;
  }
}

function fcMark(knew) {
  if (!fcFlipped) return;
  if (knew) {
    fcKnew++;
    if(typeof stats!=='undefined'){
      if(fcDeck==='vocab') stats.fcVocabKnew++;
      else stats.fcRootsKnew++;
      stats.fcCardsFlipped++;
      saveStats(stats);
    }
  } else {
    fcAgain.push(fcQueue[fcCur]);
  }
  fcCur++;
  if (fcCur >= fcQueue.length) {
    fcShowDone();
  } else {
    fcShowCard();
  }
}

function fcShowDone() {
  document.getElementById('fc-card').style.display = 'none';
  document.querySelector('.fc-controls').style.display = 'none';
  document.querySelector('.fc-meta').style.display = 'none';
  document.querySelector('.fc-shuffle-row').style.display = 'none';
  document.getElementById('fc-done').style.display = 'block';
  document.getElementById('fc-done-knew').textContent = fcKnew;
  if(typeof stats!=='undefined'){
    stats.fcDecksCompleted++;
    if(fcAgain.length===0) stats.fcPerfectDecks++;
    const newAchs=[];
    ACHIEVEMENTS.forEach(a=>{if(!stats.earnedAchs.includes(a.id)&&a.check(stats)){stats.earnedAchs.push(a.id);newAchs.push(a);}});
    saveStats(stats);
    newAchs.forEach(a=>showToast(a.icon,a.name,'Achievement unlocked!'));
  }
  document.getElementById('fc-done-again').textContent = fcAgain.length;

  const pct = Math.round((fcKnew / fcQueue.length) * 100);
  let msg = '';
  if (pct === 100) msg = 'Perfect score! You know this deck cold.';
  else if (pct >= 80) msg = `Strong work - ${fcKnew} of ${fcQueue.length} cards mastered. Review the ${fcAgain.length} you missed.`;
  else if (pct >= 60) msg = `Good progress! Use "Review missed" to drill the ${fcAgain.length} you need to practice.`;
  else msg = `Keep at it! Vocabulary builds over time. Try reviewing the missed cards right now.`;
  document.getElementById('fc-done-msg').textContent = msg;

  const reviewBtn = document.getElementById('fc-done-review-btn');
  if (fcAgain.length > 0) {
    reviewBtn.style.display = '';
    document.getElementById('fc-review-btn').style.display = '';
  } else {
    reviewBtn.style.display = 'none';
  }
}

function showFlashcards() {
  show('s-fc');
  setNav('nav-fc');
  // Initialize deck on first open
  if (fcQueue.length === 0) {
    fcRestart();
  }
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();deferredPrompt=e;
  if(!localStorage.getItem('install_dismissed'))
    document.getElementById('install-banner').style.display='flex';
});
function doInstall(){
  if(!deferredPrompt)return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(r=>{
    if(r.outcome==='accepted'){document.getElementById('install-banner').style.display='none';showToast('ðŸ“±','App Installed!','Student Compass added to your home screen');}
    deferredPrompt=null;
  });
}
function dismissInstall(){document.getElementById('install-banner').style.display='none';localStorage.setItem('install_dismissed','1');}


const mBlob=new Blob([JSON.stringify(MANIFEST)], {type:'application/manifest+json'});
document.getElementById('manifest-link').href=URL.createObjectURL(mBlob);


// â•â• STRATEGY SCORE ENGINE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var _qStartTime = null;
var _timerInterval = null;
var _qTimes = []; // ms spent per question

// Difficulty map by category

 // seconds

function stratStartTimer() {
  _qStartTime = Date.now();
  clearInterval(_timerInterval);
  _timerInterval = setInterval(() => {
    const el = document.getElementById('sq-timer');
    if (!el) return;
    const secs = Math.round((Date.now() - _qStartTime) / 1000);
    el.textContent = ' ' + secs + 's';
    el.className = 'strategy-timer-badge' + (secs > 120 ? ' slow' : secs < 10 ? ' fast' : '');
  }, 1000);
}

function stratStopTimer(q) {
  clearInterval(_timerInterval);
  const ms = _qStartTime ? Date.now() - _qStartTime : 60000;
  _qTimes.push({ ms, cat: q.cat });
  _qStartTime = null;
  return Math.round(ms / 1000); // seconds
}

function getDifficulty(cat) {
  return DIFFICULTY[cat] || 'medium';
}

function calcStrategyScore(answers, times) {
  if (!times || times.length === 0) return null;
  const n = Math.min(answers.length, times.length);

  // 1. Time Efficiency (35%)
  const timeScores = [];
  for (let i = 0; i < n; i++) {
    const diff = getDifficulty(answers[i].cat);
    const ideal = IDEAL_TIME[diff];
    const spent = times[i].ms / 1000;
    const raw = Math.max(0, 100 - (Math.abs(spent - ideal) / ideal) * 100);
    // Extra penalty for overthinking easy questions
    const penalty = (diff === 'easy' && spent >ideal * 1.5) ? 20 : 0;
    timeScores.push(Math.max(0, raw - penalty));
  }
  const T = timeScores.reduce((a, b) =>a + b, 0) / timeScores.length;

  // 2. Decision Quality (25%)
  const dqScores = [];
  for (let i = 0; i < n; i++) {
    const diff = getDifficulty(answers[i].cat);
    const ideal = IDEAL_TIME[diff];
    const spent = times[i].ms / 1000;
    const correct = answers[i].correct;
    let score;
    if (correct && spent <= ideal * 1.5) score = 100;
    else if (correct && spent >ideal * 1.5) score = 70;
    else if (!correct && spent >ideal * 1.5) score = 20;
    else if (!correct && diff === 'easy' && spent < ideal * 0.5) score = 10;
    else if (!correct && diff === 'hard' && spent < ideal * 0.5) score = 60;
    else score = 40;
    dqScores.push(score);
  }
  const D = dqScores.reduce((a, b) =>a + b, 0) / dqScores.length;

  // 3. Consistency (20%)
  const spentArr = times.slice(0, n).map(t =>t.ms / 1000);
  const mean = spentArr.reduce((a, b) =>a + b, 0) / spentArr.length;
  const variance = spentArr.reduce((a, b) =>a + Math.pow(b - mean, 2), 0) / spentArr.length;
  const stdDev = Math.sqrt(variance);
  const normStdDev = Math.min(stdDev / 60, 1); // normalize: 60s stddev = fully inconsistent
  const C = Math.max(0, 100 - normStdDev * 100);

  // 4. Guessing Skill (20%)
  const guessThreshold = 15; // seconds
  const guesses = [];
  for (let i = 0; i < n; i++) {
    if (times[i].ms / 1000 < guessThreshold) {
      guesses.push(answers[i].correct ? 1 : 0);
    }
  }
  let G = 50; // neutral if no guesses detected
  if (guesses.length >= 2) {
    const guessAcc = guesses.reduce((a, b) =>a + b, 0) / guesses.length;
    const expectedRandom = 0.25;
    G = Math.max(0, Math.min(100, ((guessAcc - expectedRandom) / (1 - expectedRandom)) * 100));
  }

  const total = Math.round(0.35 * T + 0.25 * D + 0.20 * C + 0.20 * G);

  return {
    total: Math.max(0, Math.min(100, total)),
    T: Math.round(T), D: Math.round(D), C: Math.round(C), G: Math.round(G),
    guessCount: guesses.length,
    timeScores, dqScores
  };
}

function getStrategyGrade(score) {
  if (score >= 85) return { label: 'Elite Strategist ', color: '#4ade80' };
  if (score >= 70) return { label: 'Smart Tactician ', color: '#4f8ef7' };
  if (score >= 55) return { label: 'Developing Strategy', color: '#a78bfa' };
  return { label: 'Needs Work', color: '#f87171' };
}

function getComponentInsight(component, score) {
  const insights = {
    T: score >= 80 ? 'Excellent pacing' : score >= 60 ? 'Good pace overall' : score >= 40 ? 'Overthinking some questions' : 'Rushing or overthinking too much',
    D: score >= 80 ? 'Strong decision-making' : score >= 60 ? 'Good instincts, some late mistakes' : score >= 40 ? 'Inconsistent decisions' : 'Staying too long on wrong answers',
    C: score >= 80 ? 'Very stable pacing' : score >= 60 ? 'Minor timing swings' : score >= 40 ? 'Inconsistent rhythm' : 'Unpredictable speed - stay steady',
    G: score >= 70 ? 'Strategic guessing' : score >= 40 ? 'Some elimination, not enough' : score >= 10 ? 'Guessing randomly' : 'No guesses detected',
  };
  return insights[component] || '';
}


function renderTimeChart(answers, times) {
  const chart = document.getElementById('sr-timechart');
  const barsEl = document.getElementById('sr-chart-bars');
  const labelsEl = document.getElementById('sr-chart-labels');
  if (!chart || !barsEl || times.length === 0) return;
  chart.style.display = 'block';

  const maxTime = Math.max(...times.map(t =>t.ms / 1000), 1);
  barsEl.innerHTML = ''; labelsEl.innerHTML = '';

  times.slice(0, answers.length).forEach((t, i) => {
    const sec = t.ms / 1000;
    const diff = getDifficulty(answers[i].cat);
    const ideal = IDEAL_TIME[diff];
    const ratio = Math.abs(sec - ideal) / ideal;
    const color = ratio < 0.3 ? '#4ade80' : ratio < 0.7 ? '#a78bfa' : '#f87171';
    const heightPct = Math.min(100, (sec / maxTime) * 100);

    const bar = document.createElement('div');
    bar.className = 'time-bar';
    bar.style.cssText = `height:${heightPct}%;background:${color};opacity:${answers[i].correct ? '1' : '0.6'}`;
    bar.title = `Q${i+1}: ${Math.round(sec)}s - ${answers[i].correct ? '' : 'X'}`;
    barsEl.appendChild(bar);

    const lbl = document.createElement('div');
    lbl.className = 'time-chart-label';
    lbl.textContent = `Q${i+1}`;
    labelsEl.appendChild(lbl);
  });
}

function renderStrategyScore(ss) {
  if (!ss) return;
  const card = document.getElementById('sr-strategy');
  if (!card) return;
  card.style.display = 'block';

  const grade = getStrategyGrade(ss.total);
  document.getElementById('sr-strat-score').textContent = ss.total;
  document.getElementById('sr-strat-score').style.color = grade.color;
  document.getElementById('sr-strat-grade').textContent = grade.label;
  document.getElementById('sr-strat-grade').style.color = grade.color;

  const components = [
    { key: 'T', icon: '', label: 'Time Efficiency', score: ss.T, weight: '35%' },{ key: 'D', icon: '', label: 'Decision Quality', score: ss.D, weight: '25%' },{ key: 'C', icon: 'ðŸ”„', label: 'Consistency',      score: ss.C, weight: '20%' },{ key: 'G', icon: '', label: 'Guessing Skill',   score: ss.G, weight: '20%' },
  ];

  const breakdown = document.getElementById('sr-strat-breakdown');
  breakdown.innerHTML = '';
  components.forEach(comp => {
    const barColor = comp.score >= 75 ? '#4ade80' : comp.score >= 50 ? '#4f8ef7' : comp.score >= 30 ? '#a78bfa' : '#f87171';
    const insight = getComponentInsight(comp.key, comp.score);
    const row = document.createElement('div');
    row.innerHTML = `
      <div class="strategy-comp-row">
        <span class="strategy-comp-icon">${comp.icon}</span>
        <span class="strategy-comp-label">${comp.label} <span style="opacity:.5;font-size:12px">(${comp.weight})</span></span>
        <div class="strategy-comp-bar-wrap"><div class="strategy-comp-bar" style="width:0%;background:${barColor}" data-w="${comp.score}"></div></div>
        <span class="strategy-comp-score" style="color:${barColor}">${comp.score}</span>
      </div>
      <div class="strategy-comp-insight">${insight}</div>`;
    breakdown.appendChild(row);
  });

  // Animate bars
  setTimeout(() => {
    breakdown.querySelectorAll('.strategy-comp-bar').forEach(bar => {
      bar.style.width = bar.dataset.w + '%';
    });
  }, 200);

  // Points lost
  const pointsLost = Math.round((100 - ss.total) * 4.5); // scale: 100 pts = perfect, 0 = lose ~450
  document.getElementById('sr-strat-lost-num').textContent = '~' + pointsLost + ' SAT points';
}


// â•â• STRATEGY DRILLS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
let drillQ = [], drillCur = 0, drillDecisions = [], drillTimer = null;
let drillCountdown = 12;
window._drillSubject = 'english';



function startDrills(subject) {
  window._drillSubject = subject;
  const bank = subject === 'english' ? SAT_ENG : SAT_MATH;
  drillQ = shuffle([...bank]).slice(0, 10);
  drillCur = 0; drillDecisions = [];
  renderDrillQ();
  show('s-drills-quiz'); setNav('nav-sat');
}

function renderDrillQ() {
  const q = drillQ[drillCur];
  const isEng = window._drillSubject === 'english';
  document.getElementById('dq-lbl').textContent = `Drill ${drillCur + 1} of ${drillQ.length}`;
  document.getElementById('dq-score').textContent = `Decisions: ${drillDecisions.length}`;
  document.getElementById('dq-bar').style.width = `${Math.round((drillCur / drillQ.length) * 100)}%`;

  const tag = document.getElementById('dq-tag');
  tag.innerHTML = `<span class="sat-quiz-unit-tag ${isEng ? 'eng' : 'math'}">${isEng ? '' : ''} ${q.cat}</span>`;

  const stimEl = document.getElementById('dq-stimulus');
  if (q.passage) {
    stimEl.innerHTML = `<div class="sat-passage"><div class="sat-passage-src">Passage</div>${q.passage.replace(/\n/g, '<br/>')}</div>`;
    stimEl.style.display = 'block';
  } else { stimEl.innerHTML = ''; stimEl.style.display = 'none'; }

  document.getElementById('dq-text').textContent = q.q;
  document.getElementById('dq-feedback').style.display = 'none';
  document.getElementById('dq-next').style.display = 'none';

  // Reset buttons
  document.querySelectorAll('.drill-btn').forEach(b => {
    b.disabled = false;
    b.classList.remove('chosen');
  });

  // Start countdown
  drillCountdown = 12;
  updateRing(12, 12);
  clearInterval(drillTimer);
  drillTimer = setInterval(() => {
    drillCountdown--;
    updateRing(drillCountdown, 12);
    document.getElementById('dq-countdown').textContent = drillCountdown;
    if (drillCountdown <= 3) {
      document.getElementById('dq-ring').style.stroke = '#f87171';
    } else if (drillCountdown <= 7) {
      document.getElementById('dq-ring').style.stroke = '#a78bfa';
    } else {
      document.getElementById('dq-ring').style.stroke = 'var(--purple)';
    }
    if (drillCountdown <= 0) {
      clearInterval(drillTimer);
      drillDecide('timeout');
    }
  }, 1000);
}

function updateRing(remaining, total) {
  const circumference = 213.6;
  const offset = ((total - remaining) / total) * circumference;
  const ring = document.getElementById('dq-ring');
  if (ring) ring.style.strokeDashoffset = offset;
}

function drillDecide(decision) {
  clearInterval(drillTimer);
  const q = drillQ[drillCur];
  const timeUsed = 12 - drillCountdown;
  const diff = getDifficulty(q.cat);

  drillDecisions.push({ q, decision, timeUsed, diff });

  // Disable all buttons and highlight chosen
  document.querySelectorAll('.drill-btn').forEach(b => { b.disabled = true; });
  if (decision !== 'timeout') {
    const btn = document.querySelector(`.drill-btn.${decision}`);
    if (btn) btn.classList.add('chosen');
  }

  // Generate feedback
  const feedbackEl = document.getElementById('dq-feedback');
  let feedback = '', color = 'rgba(79,142,247,.08)', border = 'rgba(79,142,247,.2)';

  if (decision === 'timeout') {
    feedback = 'Time Time\'s up! On the real SAT, indecision costs you. If you\'re not sure, guess and move on - never leave blank.';
    color = 'rgba(248,113,113,.08)'; border = 'rgba(248,113,113,.25)';
  } else if (decision === 'solve') {
    if (diff === 'easy') { feedback = ' Good - easy questions should be solved quickly. Aim for under 60 seconds.'; color = 'rgba(74,222,128,.08)'; border = 'rgba(74,222,128,.25)'; }
    else if (diff === 'hard') { feedback = ' Bold call on a hard question. Only commit to solving if you have a clear path to the answer - otherwise skip and revisit.'; color = 'rgba(167,139,250,.08)'; border = 'rgba(167,139,250,.25)'; }
    else { feedback = ' Reasonable choice. Medium questions are where most of your points live - invest 60-90 seconds.'; color = 'rgba(74,222,128,.08)'; border = 'rgba(74,222,128,.25)'; }
  } else if (decision === 'skip') {
    if (diff === 'hard') { feedback = ' Smart skip. Hard questions eat time. Guess, flag it, and come back if you finish early.'; color = 'rgba(74,222,128,.08)'; border = 'rgba(74,222,128,.25)'; }
    else if (diff === 'easy') { feedback = ' Skipping an easy question? That\'s a point you should be earning. On the real SAT, easy questions are your foundation.'; color = 'rgba(248,113,113,.08)'; border = 'rgba(248,113,113,.25)'; }
    else { feedback = ' Skipping a medium question. If you have time, these are usually worth attempting - but guessing quickly and moving on is also fine.'; color = 'rgba(167,139,250,.08)'; border = 'rgba(167,139,250,.25)'; }
  } else if (decision === 'guess') {
    if (diff === 'easy') { feedback = ' Guessing on an easy question suggests it might not be as easy for you. Review this category.'; color = 'rgba(248,113,113,.08)'; border = 'rgba(248,113,113,.25)'; }
    else { feedback = ` Strategic guess on a ${diff} question. On the SAT there\'s no penalty - always guess if you\'re not solving. Try to eliminate 1-2 choices first.`; color = 'rgba(79,142,247,.08)'; border = 'rgba(79,142,247,.2)'; }
  }

  feedbackEl.style.cssText = `display:block;background:${color};border:1px solid ${border};border-radius:10px;padding:14px;font-size:13px;line-height:1.6;color:var(--muted)`;
  feedbackEl.innerHTML = feedback;
  document.getElementById('dq-next').style.display = 'flex';
  document.getElementById('dq-next').textContent = drillCur + 1 >= drillQ.length ? 'See My Profile ->' : 'Next ->';
}

function drillNext() {
  drillCur++;
  if (drillCur >= drillQ.length) showDrillResults();
  else renderDrillQ();
}

function showDrillResults() {
  clearInterval(drillTimer);

  // Classify profile
  const solves = drillDecisions.filter(d =>d.decision === 'solve').length;
  const skips = drillDecisions.filter(d =>d.decision === 'skip').length;
  const guesses = drillDecisions.filter(d =>d.decision === 'guess').length;
  const timeouts = drillDecisions.filter(d =>d.decision === 'timeout').length;
  const avgTime = drillDecisions.reduce((a, b) =>a + b.timeUsed, 0) / drillDecisions.length;
  const times = drillDecisions.map(d =>d.timeUsed);
  const stdDev = Math.sqrt(times.reduce((a, b) =>a + Math.pow(b - avgTime, 2), 0) / times.length);

  let profileKey;
  if (avgTime >= 9 || timeouts >= 2) profileKey = 'overthinker';
  else if (avgTime <= 3) profileKey = 'rusher';
  else if (stdDev >= 3.5) profileKey = 'inconsistent';
  else profileKey = 'balanced';

  const profile = COGNITIVE_PROFILES[profileKey];
  document.getElementById('dr-profile-icon').textContent = profile.icon;
  document.getElementById('dr-profile-name').textContent = profile.name;
  document.getElementById('dr-profile-name').style.color = profile.color;
  document.getElementById('dr-profile-desc').innerHTML =
    `<span style="color:var(--muted)">${profile.desc}</span><br/><br/><strong style="color:var(--purple)">Tip: </strong><span style="color:var(--muted)">${profile.tip}</span>`;

  // Stats
  document.getElementById('dr-stats').innerHTML = `
    <div class="dr-stat-box"><div class="dr-stat-num" style="color:#4ade80">${solves}</div><div class="dr-stat-lbl">Solved</div></div>
    <div class="dr-stat-box"><div class="dr-stat-num" style="color:#a78bfa">${skips + timeouts}</div><div class="dr-stat-lbl">Skipped</div></div>
    <div class="dr-stat-box"><div class="dr-stat-num" style="color:#f87171">${guesses}</div><div class="dr-stat-lbl">Guessed</div></div>`;

  // Decision breakdown
  const breakdown = document.getElementById('dr-breakdown');
  breakdown.innerHTML = '';
  drillDecisions.forEach((d, i) => {
    const decisionColors = { solve: '#4ade80', skip: '#a78bfa', guess: '#f87171', timeout: '#f87171' };
    const decisionLabels = { solve: ' Solve', skip: ' Skip', guess: ' Guess', timeout: 'Timeout' };
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px';
    row.innerHTML = `<span style="color:var(--muted)">Q${i + 1} - ${d.diff} - ${d.q.cat.split(' ')[0]}</span><span style="color:${decisionColors[d.decision]};font-weight:600">${decisionLabels[d.decision]} <span style="font-size:13px;opacity:.7">(${d.timeUsed}s)</span></span>`;
    breakdown.appendChild(row);
  });

  show('s-drills-results'); setNav('nav-sat');
}


// â•â• ADAPTIVE PRACTICE TEST â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Real SAT structure: 4 modules
// RW M1: 27q / 32min ->RW M2: 27q / 32min (adaptive)
// Math M1: 22q / 35min ->Math M2: 22q / 35min (adaptive)



// Difficulty classification


function classifyQ(q) { return Q_DIFFICULTY[q.cat] || 'medium'; }

function buildAdaptivePT(m2HardEng, m2HardMath) {
  // Sort questions by difficulty
  const engByDiff = { easy:[], medium:[], hard:[] };
  const mathByDiff = { easy:[], medium:[], hard:[] };
  shuffle([...SAT_ENG]).forEach(q =>engByDiff[classifyQ(q)].push({...q, _section:'english', _diff:classifyQ(q)}));
  shuffle([...SAT_MATH]).forEach(q =>mathByDiff[classifyQ(q)].push({...q, _section:'math', _diff:classifyQ(q)}));

  // Module 1: balanced mix (40% easy, 40% medium, 20% hard)
  function buildM1(pool, n) {
    const e = Math.round(n * 0.4), m = Math.round(n * 0.4), h = n - e - m;
    return [...pool.easy.slice(0,e), ...pool.medium.slice(0,m), ...pool.hard.slice(0,h)].slice(0,n);
  }

  // Module 2 Hard: 15% easy, 30% medium, 55% hard (high score ceiling)
  function buildM2Hard(pool, n, usedEasy, usedMed, usedHard) {
    const e = Math.round(n * 0.15), m = Math.round(n * 0.30), h = n - e - m;
    return [
      ...pool.easy.slice(usedEasy, usedEasy+e),
      ...pool.medium.slice(usedMed, usedMed+m),
      ...pool.hard.slice(usedHard, usedHard+h)
    ].slice(0,n);
  }

  // Module 2 Standard: 55% easy, 35% medium, 10% hard (lower ceiling, but achievable)
  function buildM2Standard(pool, n, usedEasy, usedMed, usedHard) {
    const e = Math.round(n * 0.55), m = Math.round(n * 0.35), h = n - e - m;
    return [
      ...pool.easy.slice(usedEasy, usedEasy+e),
      ...pool.medium.slice(usedMed, usedMed+m),
      ...pool.hard.slice(usedHard, usedHard+h)
    ].slice(0,n);
  }

  const rw1 = shuffle(buildM1(engByDiff, 27));
  const rw2 = shuffle(m2HardEng
    ? buildM2Hard(engByDiff, 27, 11, 11, 5)
    : buildM2Standard(engByDiff, 27, 11, 11, 5));
  const math1 = shuffle(buildM1(mathByDiff, 22));
  const math2 = shuffle(m2HardMath
    ? buildM2Hard(mathByDiff, 22, 9, 9, 4)
    : buildM2Standard(mathByDiff, 22, 9, 9, 4));

  return { rw1, rw2, math1, math2 };
}

// â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let ptModuleIdx = 0;       // 0-3
let ptModuleQs = [];       // questions for current module
let ptModuleCur = 0;       // question index within module
let ptModuleAnswers = [];  // answers for current module
let ptAllAnswers = [];     // all answers across all modules
let ptBuilt = null;        // { rw1, rw2, math1, math2 }
let ptTimerInterval = null;
let ptSecondsLeft = 0;
let ptM2HardEng = false;
let ptM2HardMath = false;



function runPracticeTest() {
  // Reset everything
  ptModuleIdx = 0; ptAllAnswers = []; ptBuilt = null;
  ptM2HardEng = false; ptM2HardMath = false;

  // Build M1 first (M2 built after M1 results)
  const engByDiff = { easy:[], medium:[], hard:[] };
  const mathByDiff = { easy:[], medium:[], hard:[] };
  shuffle([...SAT_ENG]).forEach(q =>engByDiff[classifyQ(q)].push({...q, _section:'english', _diff:classifyQ(q)}));
  shuffle([...SAT_MATH]).forEach(q =>mathByDiff[classifyQ(q)].push({...q, _section:'math', _diff:classifyQ(q)}));

  // Store pools on window for M2 building later
  window._ptEngPool = engByDiff;
  window._ptMathPool = mathByDiff;

  // Build M1 modules
  function buildM1(pool, n) {
    const e = Math.round(n * 0.4), m = Math.round(n * 0.4), h = n - e - m;
    return shuffle([...pool.easy.slice(0,e), ...pool.medium.slice(0,m), ...pool.hard.slice(0,h)]).slice(0,n);
  }
  window._ptRW1 = buildM1(engByDiff, 27);
  window._ptMath1 = buildM1(mathByDiff, 22);

  launchModule(0);
}

function startPracticeTest() {
  try {
    return runPracticeTest();
  } catch (err) {
    console.error('Practice test start failed', err);
    show('s-sat-quiz');
    setNav('nav-sat');
    renderSATError(err);
  }
}

window.startPracticeTest = startPracticeTest;

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('pt-start-btn');
  if (btn) btn.addEventListener('click', (event) => {
    event.preventDefault();
    window.startPracticeTest();
  });
});

function launchModule(idx) {
  ptModuleIdx = idx;
  ptModuleCur = 0;
  ptModuleAnswers = [];
  window._ptMode = true;
  resetPauseControl();

  const mod = PT_MODULES[idx];
  const key = PT_MODULE_KEYS[idx];

  // Get questions for this module
  if (key === 'rw1') ptModuleQs = window._ptRW1;
  else if (key === 'rw2') ptModuleQs = window._ptRW2;
  else if (key === 'math1') ptModuleQs = window._ptMath1;
  else if (key === 'math2') ptModuleQs = window._ptMath2;
  if (!ptModuleQs || !ptModuleQs.length) {
    throw new Error('No questions were built for ' + (mod ? mod.label : 'this module') + '.');
  }

  // Start timer
  startPTTimer(mod.minutes * 60);

  // Show timer
  const timerEl = document.getElementById('pt-timer-display');
  if (timerEl) timerEl.style.display = 'flex';

  renderPTModuleQ();
  show('s-sat-quiz'); setNav('nav-sat');
}

function startPTTimer(seconds) {
  clearInterval(ptTimerInterval);
  ptSecondsLeft = seconds;
  updateTimerDisplay();
  ptTimerInterval = setInterval(() => {
    ptSecondsLeft--;
    updateTimerDisplay();
    if (ptSecondsLeft <= 0) {
      clearInterval(ptTimerInterval);
      timeUpForModule();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('pt-timer-text');
  const timerEl = document.getElementById('pt-timer-display');
  if (!el) return;
  const m = Math.floor(ptSecondsLeft / 60);
  const s = ptSecondsLeft % 60;
  el.textContent = `${m}:${s.toString().padStart(2,'0')}`;
  if (timerEl) {
    timerEl.className = 'pt-timer';
    if (ptSecondsLeft <= 60) timerEl.classList.add('danger');
    else if (ptSecondsLeft <= 300) timerEl.classList.add('warn');
  }
}

function timeUpForModule() {
  // Auto-submit any unanswered question and finish module
  showToast('Time',"Time's Up!",'Moving to next module...');
  setTimeout(() =>finishModule(), 1500);
}

function renderPTModuleQ() {
  const q = ptModuleQs[ptModuleCur];
  if (!q) return;
  const mod = PT_MODULES[ptModuleIdx];
  const isEng = mod.section === 'english';

  // Progress label
  document.getElementById('sq-lbl').textContent = `${mod.label} - Q${ptModuleCur+1} of ${ptModuleQs.length}`;
  document.getElementById('sq-score').textContent = `${ptModuleCur+1}/${ptModuleQs.length}`;
  document.getElementById('sq-bar').style.width = `${Math.round((ptModuleCur/ptModuleQs.length)*100)}%`;

  // Tag
  const tag = document.getElementById('sq-tag');
  tag.innerHTML = `<span class="sat-quiz-unit-tag ${isEng?'eng':'math'}">${q.cat}</span>`;

  // Stimulus
  const stimEl = document.getElementById('sq-stimulus');
  if (q.passage) {
    stimEl.innerHTML = `<div class="sat-passage"><div class="sat-passage-src">Passage</div>${q.passage.replace(/\n/g,'<br/>')}</div>`;
    stimEl.style.display='block';
  } else if (q.formula) {
    stimEl.innerHTML = `<div class="sat-formula">${q.formula}</div>`;
    stimEl.style.display='block';
  } else { stimEl.innerHTML=''; stimEl.style.display='none'; }

  document.getElementById('sq-text').textContent = q.q;
  document.getElementById('sq-expl').style.display='none';
  document.getElementById('sq-next').style.display='none';

  const box = document.getElementById('sq-choices');
  box.innerHTML='';
  Object.entries(q.c).forEach(([k,v]) => {
    const btn = document.createElement('button');
    btn.className='choice';
    btn.innerHTML=`<span class="key" style="border-color:${isEng?'#4f8ef7':'#a78bfa'};color:${isEng?'#4f8ef7':'#a78bfa'}">${k}</span><span>${v}</span>`;
    btn.onclick = () =>handlePTModuleSelect(k);
    box.appendChild(btn);
  });

  stratStartTimer && stratStartTimer();
}

function handlePTModuleSelect(key) {
  const q = ptModuleQs[ptModuleCur];
  if (typeof stratStopTimer === 'function') stratStopTimer(q);
  const ok = key === q.a;
  ptModuleAnswers.push({...q, userAnswer:key, correct:ok});
  ptAllAnswers.push({...q, userAnswer:key, correct:ok});
  if(window.StudentCompassData){
    const mod = PT_MODULES[ptModuleIdx] || {};
    window.StudentCompassData.recordAttempt({domain:mod.section==='math'?'SAT Math':'SAT Reading & Writing',skill:q.cat||'SAT Practice Test',correct:ok,question:q.q,userAnswer:key,correctAnswer:q.a,explanation:q.e,source:'Full SAT Practice'});
  }

  document.querySelectorAll('#sq-choices .choice').forEach(btn => {
    const k = btn.querySelector('.key').textContent;
    btn.disabled=true;
    if(k===q.a) btn.classList.add('correct');
    else if(k===key) btn.classList.add('wrong');
    else btn.classList.add('dim');
  });

  const expl = document.getElementById('sq-expl');
  expl.className='expl '+(ok?'ok':'bad');
  expl.innerHTML=`<span class="verdict ${ok?'ok':'bad'}">${ok?' Correct! ':`X Answer: ${q.a}. `}</span>${q.e}`;
  expl.style.display='block';

  const nxt = document.getElementById('sq-next');
  nxt.style.display='flex';
  const isLastInModule = ptModuleCur + 1 >= ptModuleQs.length;
  nxt.textContent = isLastInModule ? (ptModuleIdx >= 3 ? 'See Results ->' : 'Finish Module ->') : 'Next ->';
  nxt.onclick = ptNextModuleQ;
}

function ptNextModuleQ() {
  ptModuleCur++;
  if (ptModuleCur >= ptModuleQs.length) finishModule();
  else renderPTModuleQ();
}

function finishModule() {
  clearInterval(ptTimerInterval);
  const timerEl = document.getElementById('pt-timer-display');
  if (timerEl) timerEl.style.display = 'none';

  const mod = PT_MODULES[ptModuleIdx];
  const correct = ptModuleAnswers.filter(a=>a.correct).length;
  const pct = correct / ptModuleAnswers.length;

  // After M1 modules, determine M2 difficulty
  if (ptModuleIdx === 0) {
    // RW M1 done ->build RW M2
    ptM2HardEng = pct >= 0.65;
    buildM2('english', ptM2HardEng);
    showModuleTransition(0, pct, ptM2HardEng, 'english');
  } else if (ptModuleIdx === 1) {
    // RW M2 done ->start Math M1
    showModuleTransition(1, pct, null, 'break');
  } else if (ptModuleIdx === 2) {
    // Math M1 done ->build Math M2
    ptM2HardMath = pct >= 0.65;
    buildM2('math', ptM2HardMath);
    showModuleTransition(2, pct, ptM2HardMath, 'math');
  } else {
    // Math M2 done ->show results
    showPTResults();
  }
}

function buildM2(section, isHard) {
  const pool = section === 'english' ? window._ptEngPool : window._ptMathPool;
  const n = section === 'english' ? 27 : 22;
  let qs;
  if (isHard) {
    const e = Math.round(n*0.15), m = Math.round(n*0.30), h = n-e-m;
    qs = shuffle([...pool.easy.slice(11,11+e), ...pool.medium.slice(11,11+m), ...pool.hard.slice(5,5+h)]).slice(0,n);
  } else {
    const e = Math.round(n*0.55), m = Math.round(n*0.35), h = n-e-m;
    qs = shuffle([...pool.easy.slice(11,11+e), ...pool.medium.slice(11,11+m), ...pool.hard.slice(5,5+h)]).slice(0,n);
  }
  if (section === 'english') window._ptRW2 = qs;
  else window._ptMath2 = qs;
}

function showModuleTransition(completedIdx, pct, isHard, nextType) {
  const correct = ptModuleAnswers.filter(a=>a.correct).length;
  const total = ptModuleAnswers.length;

  // Configure transition screen
  const configs = {
    english: {
      icon: pct >= 0.65 ? '' : '',
      title: 'Reading & Writing - Module 1 Done',
      badge: ' RW Module 1 Complete',
      nextBtn: 'Start Module 2 ->',
      nextIdx: 1,
    },
    break: {
      icon: 'Pause',
      title: 'English Complete - Math Starts Next',
      badge: ' Starting Math Section',
      nextBtn: 'Begin Math ->',
      nextIdx: 2,
    },
    math: {
      icon: pct >= 0.65 ? '' : '',
      title: 'Math - Module 1 Done',
      badge: ' Math Module 1 Complete',
      nextBtn: 'Start Module 2 ->',
      nextIdx: 3,
    },
  };

  const cfg = configs[nextType] || configs.break;
  document.getElementById('mt-icon').textContent = cfg.icon;
  document.getElementById('mt-title').textContent = cfg.title;
  document.getElementById('mt-badge').textContent = cfg.badge;
  document.getElementById('mt-btn').textContent = cfg.nextBtn;
  document.getElementById('mt-btn').onclick = () =>launchModule(cfg.nextIdx);

  // Show difficulty info for adaptive modules
  const diffTag = document.getElementById('mt-difficulty-tag');
  if (isHard !== null && nextType !== 'break') {
    diffTag.style.display = 'inline-block';
    diffTag.className = 'module-difficulty-tag ' + (isHard ? 'difficulty-hard' : 'difficulty-standard');
    diffTag.textContent = isHard ? 'ðŸ”´ Module 2: Advanced (harder questions)' : 'ðŸŸ¢ Module 2: Standard difficulty';
  } else {
    diffTag.style.display = 'none';
  }

  // Stats
  const score = Math.round(pct * 100);
  const scoreColor = pct >= 0.8 ? '#4ade80' : pct >= 0.6 ? '#a78bfa' : '#f87171';
  document.getElementById('mt-sub').innerHTML =
    nextType !== 'break'
      ? `You answered <strong style="color:${scoreColor}">${correct} of ${total}</strong>correctly (${score}%).<br/>${isHard ? 'Strong performance! Module 2 will challenge you more - but your score ceiling is higher.' : 'Module 2 will have more manageable questions. Keep it steady.'}`
      : `You completed the Reading & Writing section.<br/>Take a breath - Math starts when you're ready.`;

  document.getElementById('mt-stats').innerHTML =
    ` Correct: ${correct} &nbsp;-&nbsp; X Wrong: ${total-correct} &nbsp;-&nbsp; Score: ${score}%`;

  show('s-pt-transition'); setNav('nav-sat');
}

// Override the sq-next button to route through the adaptive system
// (replaces window._ptMode check)


// â•â• WHAT TO DO NEXT + MISSED REVIEW â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
let _missedQs = [];

function renderNextAction(answers) {
  _missedQs = answers.filter(a => !a.correct);
  const banner = document.getElementById('sr-missed-banner');
  const missedText = document.getElementById('sr-missed-text');
  const nextDiv = document.getElementById('sr-next-action');
  const nextText = document.getElementById('sr-next-text');
  const nextBtn = document.getElementById('sr-next-btn');

  // Missed questions banner
  if (_missedQs.length > 0 && banner) {
    banner.style.display = 'flex';
    missedText.textContent = `${_missedQs.length} question${_missedQs.length > 1 ? 's' : ''} to review`;
  }

  // Find weakest category
  const catStats = {};
  answers.forEach(a => {
    if (!catStats[a.cat]) catStats[a.cat] = { correct: 0, total: 0 };
    catStats[a.cat].total++;
    if (a.correct) catStats[a.cat].correct++;
  });

  const weakest = Object.entries(catStats)
    .filter(([, v]) =>v.total >= 2)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0];

  if (!weakest || !nextDiv || !nextText || !nextBtn) return;

  const [weakCat, weakData] = weakest;
  const weakPct = Math.round((weakData.correct / weakData.total) * 100);

  // Map category to unit drill
  const catToUnit = {
    'Vocabulary in Context': { subject: 'english', unit: 'Vocabulary in Context' },
    'Grammar & Usage': { subject: 'english', unit: 'Grammar' },
    'Text Structure': { subject: 'english', unit: 'Text Structure' },
    'Command of Evidence': { subject: 'english', unit: 'Evidence-Based' },
    'Transitions & Rhetoric': { subject: 'english', unit: 'Text Structure' },
    'Rhetorical Synthesis': { subject: 'english', unit: 'Rhetorical Synthesis' },
    'Linear Equations': { subject: 'math', unit: 'Linear Equations' },
    'Advanced Math': { subject: 'math', unit: 'Advanced Math' },
    'Data Analysis': { subject: 'math', unit: 'Data Analysis' },
    'Geometry': { subject: 'math', unit: 'Geometry' },
  };

  const drill = catToUnit[weakCat];
  nextDiv.style.display = 'block';

  if (weakPct < 50) {
    nextText.textContent = `You got ${weakPct}% on ${weakCat}. Drill this unit before anything else.`;
  } else if (weakPct < 75) {
    nextText.textContent = `${weakCat} Needs Work' ')[0]}... ->`;
    nextBtn.onclick = () => { startSATUnit(drill.subject, drill.unit); };
  } else {
    nextBtn.textContent = 'Practice Again ->';
    nextBtn.onclick = () =>startSAT(satSubject);
  }
}

function startMissedReview() {
  if (_missedQs.length === 0) return;
  satQuiz = shuffle([..._missedQs]);
  satCur = 0; satScore = 0; satAnswers = []; _qTimes = [];
  renderSATQ();
  show('s-sat-quiz'); setNav('nav-sat');
  showToast('ðŸ”', 'Missed Review', `Drilling ${satQuiz.length} missed questions`);
}


// â•â• FLASHCARD SWIPE GESTURES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
(function() {
  let touchStartX = 0, touchStartY = 0, touchStartT = 0;

  document.addEventListener('touchstart', function(e) {
    if (!e.target.closest('#fc-card')) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartT = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    if (!e.target.closest('.fc-scene') && !e.target.closest('#fc-card')) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dt = Date.now() - touchStartT;
    // Only horizontal swipes > 60px, < 300ms, not primarily vertical
    if (Math.abs(dx) < 60 || Math.abs(dy) >Math.abs(dx) * 0.8 || dt > 400) return;
    if (!fcFlipped) { fcFlip(); return; } // flip first if not flipped
    if (dx > 0) { fcMark(true); }  // swipe right = got it
    else { fcMark(false); }          // swipe left = need practice
  }, { passive: true });
})();


function showPage(id){
  show(id);
  if(id==='s-gpa' && typeof initGPA==='function') initGPA();
}


// â•â• GPA CALCULATOR â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const GPA_POINTS={'A+':4.0,'A':4.0,'A-':3.7,'B+':3.3,'B':3.0,'B-':2.7,'C+':2.3,'C':2.0,'C-':1.7,'D':1.0,'F':0.0};
const GPA_WEIGHT={'Regular':0,'Honors':0.5,'AP/IB':1.0};
let gpaRowCount=0;
function addGPARow(){
  gpaRowCount++;
  const row=document.createElement('div');
  row.id='gpa-row-'+gpaRowCount;
  row.style.cssText='display:grid;grid-template-columns:1fr auto auto auto;gap:8px;align-items:center';
  row.innerHTML=`<input type="text" placeholder="Class name (optional)" style="padding:10px 12px;border-radius:8px;border:1px solid rgba(59,130,246,.2);background:rgba(59,130,246,.04);color:var(--text);font-size:14px;font-family:inherit;outline:none;min-width:0" oninput="calcGPA()"/>
    <select onchange="calcGPA()" style="padding:10px 8px;border-radius:8px;border:1px solid rgba(59,130,246,.2);background:var(--bg);color:var(--text);font-size:14px;font-family:inherit;cursor:pointer"><option>A</option><option>A-</option><option>B+</option><option>B</option><option>B-</option><option>C+</option><option>C</option><option>D</option><option>F</option></select>
    <select onchange="calcGPA()" style="padding:10px 8px;border-radius:8px;border:1px solid rgba(59,130,246,.2);background:var(--bg);color:var(--text);font-size:14px;font-family:inherit;cursor:pointer"><option>Regular</option><option>Honors</option><option>AP/IB</option></select>
    <button onclick="removeGPARow(${gpaRowCount})" style="padding:9px 12px;border-radius:8px;border:1px solid rgba(248,113,113,.2);background:rgba(248,113,113,.06);color:#f87171;font-size:14px;cursor:pointer">X</button>`;
  document.getElementById('gpa-rows').appendChild(row);
  calcGPA();
}
function removeGPARow(id){const el=document.getElementById('gpa-row-'+id);if(el)el.remove();calcGPA();}
function calcGPA(){
  const rows=document.querySelectorAll('#gpa-rows >div');
  if(rows.length===0){document.getElementById('gpa-unweighted').textContent='-';document.getElementById('gpa-weighted').textContent='-';document.getElementById('gpa-context').style.display='none';try{localStorage.removeItem('scGpaSummary');localStorage.removeItem('scGpaRows');}catch(e){} return;}
  let tu=0,tw=0,c=0;
  rows.forEach(row=>{
    const sel=row.querySelectorAll('select');if(sel.length<2)return;
    const g=sel[0].value,t=sel[1].value;
    const pts=GPA_POINTS[g]??0,bonus=GPA_WEIGHT[t]??0;
    tu+=pts;tw+=Math.min(5,pts+bonus);c++;
  });
  if(!c)return;
  const uw=(tu/c).toFixed(2),w=(tw/c).toFixed(2);
  document.getElementById('gpa-unweighted').textContent=uw;
  document.getElementById('gpa-weighted').textContent=w;
  try{
    const gpaRows=[...rows].map(r=>({name:(r.querySelector('input')||{}).value||'',grade:(r.querySelectorAll('select')[0]||{}).value||'A',type:(r.querySelectorAll('select')[1]||{}).value||'Regular'}));
    localStorage.setItem('scGpaSummary',JSON.stringify({unweighted:uw,weighted:w,classes:rows.length,updated:Date.now()}));
    localStorage.setItem('scGpaRows',JSON.stringify(gpaRows));
  }catch(e){}
  const ctx=document.getElementById('gpa-context');ctx.style.display='block';
  const n=parseFloat(uw);
  ctx.textContent=n>=3.9?'Excellent - competitive for highly selective colleges.':n>=3.5?' Strong GPA - competitive for most universities.':n>=3.0?'ðŸ“ˆ Good standing - focus on increasing course rigor.':n>=2.5?' Below average for selective schools - prioritize improvement.':'ðŸ”§ Talk to your counselor about a grade recovery plan.';
}
function initGPA(){
  const rowsEl=document.getElementById('gpa-rows');
  if(!rowsEl||rowsEl.children.length) return;
  let saved=[];
  try{saved=JSON.parse(localStorage.getItem('scGpaRows')||'[]')||[];}catch(e){saved=[];}
  if(saved.length){
    saved.forEach(item=>{
      addGPARow();
      const row=rowsEl.lastElementChild;
      if(row){
        const input=row.querySelector('input');
        const sels=row.querySelectorAll('select');
        if(input) input.value=item.name||'';
        if(sels[0]) sels[0].value=item.grade||'A';
        if(sels[1]) sels[1].value=item.type||'Regular';
      }
    });
    calcGPA();
  }else{addGPARow();addGPARow();addGPARow();}
}


// â•â• ANIMATED COUNTERS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function animateCounter(el, target, duration=1200) {
  const start = performance.now();
  const update = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}
function initCounters() {
  const qs = document.getElementById('stat-qs');
  const ach = document.getElementById('stat-ach');
  const fc = document.getElementById('stat-fc');
  const mod = document.getElementById('stat-mod');
  if(qs) animateCounter(qs, 366);
  if(ach) animateCounter(ach, 90);
  if(fc) animateCounter(fc, 209);
  if(mod) animateCounter(mod, 4);
}

// â•â• SCROLL REVEAL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el =>observer.observe(el));
}

// Run on initial load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initCounters, 600);
  setTimeout(initReveal, 200);
});

function bcToggleFaq(btn){
  var body=btn.nextElementSibling,plus=btn.querySelector('.bc-faq-plus'),isOpen=body.classList.contains('open');
  document.querySelectorAll('.bc-faq-body').forEach(function(b){b.classList.remove('open')});
  document.querySelectorAll('.bc-faq-plus').forEach(function(p){p.classList.remove('open')});
  if(!isOpen){body.classList.add('open');plus.classList.add('open');}
}

// Service worker removed - it was caching old versions and causing flash-of-old-content on reload.
// If offline support is needed in the future, use a network-first strategy with a version-bumped cache key.
if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistrations().then(regs=>{
    regs.forEach(r=>r.unregister());
  });
}
