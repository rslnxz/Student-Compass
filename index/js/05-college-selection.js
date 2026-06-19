function collegeReadList(){try{return JSON.parse(localStorage.getItem('scCollegeList')||'{}')||{};}catch(e){return {};}}
function collegeSaveList(list){try{localStorage.setItem('scCollegeList',JSON.stringify(list));}catch(e){}}
function collegeEscape(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function collegeMatches(c,q,region,selectivity,major){const core=[c.name,c.city,c.state,c.region,c.type,c.selectivity].concat(c.strengths).join(' ').toLowerCase();const full=[core,c.aid,c.deadline,c.fit,c.tuition].join(' ').toLowerCase();const hay=q.length<=3?core:full;return(!q||hay.includes(q))&&(region==='all'||c.region===region)&&(selectivity==='all'||c.selectivity===selectivity)&&(major==='all'||c.strengths.includes(major));}
function renderCollegeSearch(){
  const root=document.getElementById('college-results'); if(!root)return;
  const q=((document.getElementById('college-search-input')||{}).value||'').trim().toLowerCase();
  const region=(document.getElementById('college-region-filter')||{}).value||'all';
  const selectivity=(document.getElementById('college-selectivity-filter')||{}).value||'all';
  const major=(document.getElementById('college-major-filter')||{}).value||'all';
  const filtered=COLLEGE_DATA.filter(c=>collegeMatches(c,q,region,selectivity,major));
  const count=document.getElementById('college-result-count'); if(count)count.textContent=filtered.length+' school'+(filtered.length===1?'':'s');
  root.innerHTML=filtered.map(c=>`
    <article class="college-card">
      <div class="college-card-top"><div><div class="college-name">${collegeEscape(c.name)}</div><div class="college-meta">${collegeEscape(c.city)}, ${collegeEscape(c.state)} · ${collegeEscape(c.type)}</div></div><span class="college-tag">${collegeEscape(c.selectivity)}</span></div>
      <div class="college-stats"><div class="college-stat"><b>${collegeEscape(c.admit)}</b><span>Admit</span></div><div class="college-stat"><b>${collegeEscape(c.sat)}</b><span>SAT</span></div><div class="college-stat"><b>${collegeEscape(c.tuition)}</b><span>Tuition</span></div><div class="college-stat"><b>${collegeEscape(c.deadline)}</b><span>Deadline</span></div></div>
      <div class="college-major-row">${c.strengths.map(s=>`<span class="college-major">${collegeEscape(s)}</span>`).join('')}</div>
      <div class="college-note"><strong style="color:var(--text)">Aid:</strong> ${collegeEscape(c.aid)}<br/><strong style="color:var(--text)">Strategy:</strong> ${collegeEscape(c.fit)}</div>
      <div class="college-actions"><button class="college-mini-btn" onclick="collegeAdd('${c.id}','reach')">Add Reach</button><button class="college-mini-btn blue" onclick="collegeAdd('${c.id}','target')">Add Target</button><button class="college-mini-btn blue" onclick="collegeAdd('${c.id}','likely')">Add Likely</button><a class="college-mini-btn blue" href="${collegeEscape(c.url)}" target="_blank" rel="noopener" style="text-decoration:none">Admissions</a></div>
    </article>`).join('')||'<div class="college-empty">No schools match those filters. Try a broader region, selectivity, or keyword.</div>';
}
function collegeAdd(id,bucket){const c=COLLEGE_DATA.find(x=>x.id===id);if(!c)return;const list=collegeReadList();['reach','target','likely'].forEach(k=>{list[k]=(list[k]||[]).filter(item=>item!==id);});list[bucket]=Array.isArray(list[bucket])?list[bucket]:[];list[bucket].push(id);collegeSaveList(list);renderCollegeList();}
function collegeRemove(id,bucket){const list=collegeReadList();list[bucket]=(list[bucket]||[]).filter(item=>item!==id);collegeSaveList(list);renderCollegeList();}
function renderCollegeList(){
  const board=document.getElementById('college-list-board'); if(!board)return;
  const list=collegeReadList(),labels={reach:'Reach',target:'Target',likely:'Likely'},help={reach:'Aim for 3-4.',target:'Aim for 4-6.',likely:'Aim for 2-3 you would attend.'};
  board.innerHTML=['reach','target','likely'].map(bucket=>{const rows=(list[bucket]||[]).map(id=>{const c=COLLEGE_DATA.find(x=>x.id===id);return c?`<div class="college-list-item"><span>${collegeEscape(c.name)} <small style="color:var(--muted)">· ${collegeEscape(c.state)}</small></span><button class="college-remove" onclick="collegeRemove('${id}','${bucket}')" aria-label="Remove ${collegeEscape(c.name)}">x</button></div>`:'';}).join('');return`<section class="college-list-col"><h3>${labels[bucket]}</h3><div class="college-empty">${help[bucket]}</div>${rows||'<div class="college-empty" style="margin-top:10px">No schools yet.</div>'}</section>`;}).join('');
}
window.COLLEGE_DATA=COLLEGE_DATA;
const UNIVERSITY_SCORECARD_API='https://api.data.gov/ed/collegescorecard/v1/schools';
let universityResults=[],universityPage=0,universityTotal=0,universityBusy=false,universityRequestId=0,universityTimer=null;
function universityRegionFromState(state){
  const northeast=['CT','ME','MA','NH','RI','VT','NJ','NY','PA'];
  const midwest=['IL','IN','MI','OH','WI','IA','KS','MN','MO','NE','ND','SD'];
  const south=['DE','DC','FL','GA','MD','NC','SC','VA','WV','AL','KY','MS','TN','AR','LA','OK','TX'];
  const west=['AZ','CO','ID','MT','NV','NM','UT','WY','AK','CA','HI','OR','WA'];
  return northeast.includes(state)?'Northeast':midwest.includes(state)?'Midwest':south.includes(state)?'South':west.includes(state)?'West':'Other';
}
function universitySelectivity(rate){
  if(rate==null || isNaN(rate)) return 'Open/Unknown';
  const pct=Number(rate);
  return pct<=0.10?'Ultra Reach':pct<=0.30?'Reach':pct<=0.65?'Target':'Likely';
}
function universityMoney(v,prefix){
  if(v==null || isNaN(v)) return 'Not listed';
  return (prefix||'~$')+Math.round(Number(v)/1000)+'k';
}
function universityScorecardUrl(c){
  const raw=(c['school.school_url']||'').trim();
  if(!raw) return 'https://collegescorecard.ed.gov/';
  return /^https?:\/\//i.test(raw)?raw:'https://'+raw;
}
function universityFromScorecard(row){
  const rate=row['latest.admissions.admission_rate.overall'];
  const inState=row['latest.cost.tuition.in_state'];
  const outState=row['latest.cost.tuition.out_of_state'];
  const sat=row['latest.admissions.sat_scores.average.overall'];
  const size=row['latest.student.size'];
  const state=row['school.state']||'';
  const selectivity=universitySelectivity(rate);
  return {
    id:'scorecard-'+row.id,
    source:'scorecard',
    name:row['school.name']||'Unknown university',
    city:row['school.city']||'',
    state:state,
    region:universityRegionFromState(state),
    type:row['school.ownership']==='1'?'Public university':row['school.ownership']==='2'?'Private nonprofit university':row['school.ownership']==='3'?'Private for-profit university':'University',
    selectivity:selectivity,
    admit:rate==null?'Not listed':Math.round(Number(rate)*100)+'%',
    sat:sat==null?'Not listed':String(Math.round(Number(sat))),
    tuition:outState!=null?universityMoney(outState):universityMoney(inState),
    aid:'Check the official net price calculator and financial aid page.',
    deadline:'Verify on admissions site',
    strengths:['Official Data','Enrollment '+(size?Number(size).toLocaleString():'N/A')],
    fit:'Live College Scorecard record. Use this as a broad search result, then verify program fit, deadlines, cost, and admissions details on the university website.',
    url:universityScorecardUrl(row)
  };
}
function universityApiParams(page){
  const q=((document.getElementById('college-search-input')||{}).value||'').trim();
  const region=(document.getElementById('college-region-filter')||{}).value||'all';
  const p=new URLSearchParams();
  p.set('api_key',localStorage.getItem('college_scorecard_api_key')||'DEMO_KEY');
  p.set('per_page','100');
  p.set('page',String(page||0));
  p.set('school.operating','1');
  p.set('school.degrees_awarded.predominant','3');
  p.set('fields','id,school.name,school.city,school.state,school.ownership,school.school_url,latest.student.size,latest.admissions.admission_rate.overall,latest.admissions.sat_scores.average.overall,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state');
  p.set('sort','school.name:asc');
  if(q) p.set('school.name',q);
  if(region==='Northeast') p.set('school.region_id','1,2');
  if(region==='Midwest') p.set('school.region_id','3,4');
  if(region==='South') p.set('school.region_id','5,6');
  if(region==='West') p.set('school.region_id','7,8');
  return p;
}
function universityPassesFilters(c){
  const selectivity=(document.getElementById('college-selectivity-filter')||{}).value||'all';
  const major=(document.getElementById('college-major-filter')||{}).value||'all';
  return (selectivity==='all'||c.selectivity===selectivity) && (major==='all'||c.strengths.includes(major)||c.source==='scorecard');
}
function universityCard(c){
  return `
    <article class="college-card">
      <div class="college-card-top"><div><div class="college-name">${collegeEscape(c.name)}</div><div class="college-meta">${collegeEscape(c.city)}, ${collegeEscape(c.state)} · ${collegeEscape(c.type)}</div></div><span class="college-tag">${collegeEscape(c.selectivity)}</span></div>
      <div class="college-stats"><div class="college-stat"><b>${collegeEscape(c.admit)}</b><span>Admit</span></div><div class="college-stat"><b>${collegeEscape(c.sat)}</b><span>SAT Avg</span></div><div class="college-stat"><b>${collegeEscape(c.tuition)}</b><span>Tuition</span></div><div class="college-stat"><b>${collegeEscape(c.deadline)}</b><span>Deadline</span></div></div>
      <div class="college-major-row">${c.strengths.map(s=>`<span class="college-major">${collegeEscape(s)}</span>`).join('')}</div>
      <div class="college-note"><strong style="color:var(--text)">Aid:</strong> ${collegeEscape(c.aid)}<br/><strong style="color:var(--text)">Strategy:</strong> ${collegeEscape(c.fit)}</div>
      <div class="college-actions"><button class="college-mini-btn" onclick="collegeAdd('${c.id}','reach')">Add Reach</button><button class="college-mini-btn blue" onclick="collegeAdd('${c.id}','target')">Add Target</button><button class="college-mini-btn blue" onclick="collegeAdd('${c.id}','likely')">Add Likely</button><a class="college-mini-btn blue" href="${collegeEscape(c.url)}" target="_blank" rel="noopener" style="text-decoration:none">Website</a></div>
    </article>`;
}
function renderUniversityCards(status){
  const root=document.getElementById('college-results'); if(!root)return;
  const shown=universityResults.filter(universityPassesFilters);
  const count=document.getElementById('college-result-count');
  if(count) count.textContent=status || (universityTotal?shown.length+' of '+universityTotal.toLocaleString()+' universities':shown.length+' universities');
  root.innerHTML=shown.map(universityCard).join('') || '<div class="college-empty">No universities match those filters. Try a broader region, selectivity, or keyword.</div>';
  if(universityTotal>universityResults.length){
    root.innerHTML+='<button class="btn-outline" onclick="collegeLoadMore()" style="width:100%;margin-top:4px">Load more universities</button>';
  }
}
async function collegeFetchUniversities(reset){
  if(universityBusy) return;
  const requestId=++universityRequestId;
  if(reset){universityPage=0;universityResults=[];universityTotal=0;}
  universityBusy=true;
  renderUniversityCards('Loading universities...');
  try{
    const res=await fetch(UNIVERSITY_SCORECARD_API+'?'+universityApiParams(universityPage).toString());
    if(!res.ok) throw new Error('scorecard '+res.status);
    const data=await res.json();
    if(requestId!==universityRequestId) return;
    universityTotal=(data.metadata&&data.metadata.total)||0;
    const next=(data.results||[]).map(universityFromScorecard);
    universityResults=reset?next:universityResults.concat(next);
    universityPage+=1;
    window.COLLEGE_DATA=COLLEGE_DATA.concat(universityResults);
    renderUniversityCards();
  }catch(e){
    universityResults=COLLEGE_DATA.filter(c=>collegeMatches(c,((document.getElementById('college-search-input')||{}).value||'').trim().toLowerCase(),(document.getElementById('college-region-filter')||{}).value||'all',(document.getElementById('college-selectivity-filter')||{}).value||'all',(document.getElementById('college-major-filter')||{}).value||'all'));
    universityTotal=universityResults.length;
    window.COLLEGE_DATA=COLLEGE_DATA;
    renderUniversityCards('Offline fallback: '+universityResults.length+' starter universities');
  }finally{
    universityBusy=false;
  }
}
function renderCollegeSearch(){
  clearTimeout(universityTimer);
  universityTimer=setTimeout(function(){collegeFetchUniversities(true);},220);
}
function collegeLoadMore(){collegeFetchUniversities(false);}
function collegeAdd(id,bucket){const c=COLLEGE_DATA.concat(universityResults).find(x=>x.id===id);if(!c)return;const list=collegeReadList();['reach','target','likely'].forEach(k=>{list[k]=(list[k]||[]).filter(item=>item!==id);});list[bucket]=Array.isArray(list[bucket])?list[bucket]:[];list[bucket].push(id);collegeSaveList(list);renderCollegeList();}
function renderCollegeList(){
  const board=document.getElementById('college-list-board'); if(!board)return;
  const all=COLLEGE_DATA.concat(universityResults),list=collegeReadList(),labels={reach:'Reach',target:'Target',likely:'Likely'},help={reach:'Aim for 3-4.',target:'Aim for 4-6.',likely:'Aim for 2-3 you would attend.'};
  board.innerHTML=['reach','target','likely'].map(bucket=>{const rows=(list[bucket]||[]).map(id=>{const c=all.find(x=>x.id===id)||{name:id,state:''};return c?`<div class="college-list-item"><span>${collegeEscape(c.name)} <small style="color:var(--muted)">· ${collegeEscape(c.state)}</small></span><button class="college-remove" onclick="collegeRemove('${id}','${bucket}')" aria-label="Remove ${collegeEscape(c.name)}">x</button></div>`:'';}).join('');return`<section class="college-list-col"><h3>${labels[bucket]}</h3><div class="college-empty">${help[bucket]}</div>${rows||'<div class="college-empty" style="margin-top:10px">No universities yet.</div>'}</section>`;}).join('');
}
function initCollege(){collegeFetchUniversities(true);renderCollegeList();}
universityFromScorecard=function(row){
  const rate=row['latest.admissions.admission_rate.overall'];
  const inState=row['latest.cost.tuition.in_state'];
  const outState=row['latest.cost.tuition.out_of_state'];
  const sat=row['latest.admissions.sat_scores.average.overall'];
  const size=row['latest.student.size'];
  const state=row['school.state']||'';
  const owner=Number(row['school.ownership']);
  return {
    id:'scorecard-'+row.id,
    source:'scorecard',
    name:row['school.name']||'Unknown university',
    city:row['school.city']||'',
    state:state,
    region:universityRegionFromState(state),
    type:owner===1?'Public university':owner===2?'Private nonprofit university':owner===3?'Private for-profit university':'University',
    selectivity:universitySelectivity(rate),
    admit:rate==null?'Not listed':Math.round(Number(rate)*100)+'%',
    sat:sat==null?'Not listed':String(Math.round(Number(sat))),
    tuition:outState!=null?universityMoney(outState):universityMoney(inState),
    aid:'Check the official net price calculator and financial aid page.',
    deadline:'Verify on admissions site',
    strengths:['Official Data','Enrollment '+(size?Number(size).toLocaleString():'N/A')],
    fit:'Live College Scorecard record. Use this as a broad search result, then verify program fit, deadlines, cost, and admissions details on the university website.',
    url:universityScorecardUrl(row)
  };
};
universityCard=function(c){
  return `
    <article class="college-card">
      <div class="college-card-top"><div><div class="college-name">${collegeEscape(c.name)}</div><div class="college-meta">${collegeEscape(c.city)}, ${collegeEscape(c.state)} - ${collegeEscape(c.type)}</div></div><span class="college-tag">${collegeEscape(c.selectivity)}</span></div>
      <div class="college-stats"><div class="college-stat"><b>${collegeEscape(c.admit)}</b><span>Admit</span></div><div class="college-stat"><b>${collegeEscape(c.sat)}</b><span>SAT Avg</span></div><div class="college-stat"><b>${collegeEscape(c.tuition)}</b><span>Tuition</span></div><div class="college-stat"><b>${collegeEscape(c.deadline)}</b><span>Deadline</span></div></div>
      <div class="college-major-row">${c.strengths.map(s=>`<span class="college-major">${collegeEscape(s)}</span>`).join('')}</div>
      <div class="college-note"><strong style="color:var(--text)">Aid:</strong> ${collegeEscape(c.aid)}<br/><strong style="color:var(--text)">Strategy:</strong> ${collegeEscape(c.fit)}</div>
      <div class="college-actions"><button class="college-mini-btn" onclick="collegeAdd('${c.id}','reach')">Add Reach</button><button class="college-mini-btn blue" onclick="collegeAdd('${c.id}','target')">Add Target</button><button class="college-mini-btn blue" onclick="collegeAdd('${c.id}','likely')">Add Likely</button><a class="college-mini-btn blue" href="${collegeEscape(c.url)}" target="_blank" rel="noopener" style="text-decoration:none">Website</a></div>
    </article>`;
};
renderCollegeList=function(){
  const all=COLLEGE_DATA.concat(universityResults),list=collegeReadList(),labels={reach:'Reach',target:'Target',likely:'Likely'},help={reach:'Aim for 3-4.',target:'Aim for 4-6.',likely:'Aim for 2-3 you would attend.'};
  const makeRows=function(bucket){
    const rows=(list[bucket]||[]).map(id=>{const c=all.find(x=>x.id===id)||{name:id,state:''};return c?`<div class="college-list-item"><span>${collegeEscape(c.name)} <small style="color:var(--muted)">- ${collegeEscape(c.state)}</small></span><button class="college-remove" onclick="collegeRemove('${id}','${bucket}')" aria-label="Remove ${collegeEscape(c.name)}">x</button></div>`:'';}).join('');
    return rows||'<div class="college-empty" style="margin-top:10px">No universities yet.</div>';
  };
  ['reach','target','likely'].forEach(bucket=>{
    const slot=document.getElementById('college-list-'+bucket);
    if(slot) slot.innerHTML=makeRows(bucket);
  });
  const board=document.getElementById('college-list-board');
  if(board) board.innerHTML=['reach','target','likely'].map(bucket=>`<section class="college-list-col"><h3>${labels[bucket]}</h3><div class="college-empty">${help[bucket]}</div>${makeRows(bucket)}</section>`).join('');
};
