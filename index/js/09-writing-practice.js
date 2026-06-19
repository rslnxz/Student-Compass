// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  ESSAY PRACTICE DATA & GRADING ENGINE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ DBQ DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


// â”€â”€ SAQ DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


// â”€â”€ LEQ DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


// â”€â”€ STATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let currentDBQ = 0, currentSAQ = 0, currentLEQ = 0;

// â”€â”€ INIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initEssayPages(){
  renderDBQ(0);
  renderSAQSelector();
  renderSAQ(0);
  renderLEQ(0);
}
document.addEventListener('DOMContentLoaded', initEssayPages);

// word count helpers
function wcOf(id){ const t=document.getElementById(id); if(!t) return 0; return t.value.trim().split(/\s+/).filter(Boolean).length; }
function setupWC(taId, wcId){ const ta=document.getElementById(taId); const wc=document.getElementById(wcId); if(!ta||!wc) return; ta.addEventListener('input',()=>{ wc.textContent=wcOf(taId)+' words'; }); }
document.addEventListener('DOMContentLoaded',()=>{ setupWC('dbq-textarea','dbq-wc'); setupWC('leq-textarea','leq-wc'); });

// â”€â”€ DBQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderDBQ(idx){
  const q = DBQ_PROMPTS[idx];
  document.getElementById('dbq-prompt-title').textContent = q.title;
  document.getElementById('dbq-prompt-text').textContent = q.prompt;
  const docsEl = document.getElementById('dbq-docs');
  docsEl.innerHTML = q.docs.map(d=>`
    <div class="doc-block">
      <div class="doc-block-label">${d.label} - ${d.meta}</div>
      <div class="doc-block-text">${d.text}</div>
    </div>`).join('');
  document.getElementById('dbq-textarea').value = '';
  document.getElementById('dbq-wc').textContent = '0 words';
  document.getElementById('dbq-results').style.display = 'none';
}
function selectDBQ(btn, idx){
  document.querySelectorAll('#s-dbq .essay-q-btn').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel');
  currentDBQ = idx;
  renderDBQ(idx);
}
function resetDBQ(){
  document.getElementById('dbq-results').style.display='none';
  document.getElementById('dbq-textarea').value='';
  document.getElementById('dbq-wc').textContent='0 words';
}

// â”€â”€ SAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderSAQSelector(){
  const sel = document.getElementById('saq-selector');
  sel.innerHTML = SAQ_PROMPTS.map((q,i)=>`
    <button class="essay-q-btn${i===0?' sel':''}" onclick="selectSAQ(this,${i})">SAQ ${i+1}<br/><span style="font-size:10px;color:var(--muted)">${q.period.split('·')[0].trim()}</span></button>`
  ).join('');
}
function renderSAQ(idx){
  const q = SAQ_PROMPTS[idx];
  document.getElementById('saq-q-title').textContent = q.title;
  document.getElementById('saq-period-label').textContent = q.period;
  const stimEl = document.getElementById('saq-stimulus');
  if(q.stimulus){
    stimEl.style.display='block';
    stimEl.innerHTML=`<div class="doc-block"><div class="doc-block-label">Stimulus</div><div class="doc-block-text" style="white-space:pre-line">${q.stimulus}</div></div>`;
  } else { stimEl.style.display='none'; }
  const partsEl = document.getElementById('saq-parts');
  partsEl.innerHTML = q.parts.map((p,i)=>`
    <div style="margin-bottom:16px">
      <div class="saq-part-label">Part ${p.label}</div>
      <div class="saq-part-q">${p.q}</div>
      <textarea class="essay-textarea" id="saq-ta-${i}" style="min-height:100px" placeholder="Write 3-6 sentences. State a specific claim and support it with at least one piece of historical evidence..."></textarea>
    </div>`).join('');
  document.getElementById('saq-results').style.display='none';
}
function selectSAQ(btn, idx){
  document.querySelectorAll('#saq-selector .essay-q-btn').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel');
  currentSAQ = idx;
  renderSAQ(idx);
}
function resetSAQ(){
  document.getElementById('saq-results').style.display='none';
  renderSAQ(currentSAQ);
}

// â”€â”€ LEQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderLEQ(idx){
  const q = LEQ_PROMPTS[idx];
  document.getElementById('leq-prompt-title').textContent = q.title;
  document.getElementById('leq-prompt-text').innerHTML=`<strong style="color:var(--text)">${q.prompt}</strong><br/><br/><span style="font-size:13px;color:var(--muted)">${q.hint}</span>`;
  document.getElementById('leq-textarea').value='';
  document.getElementById('leq-wc').textContent='0 words';
  document.getElementById('leq-results').style.display='none';
}
function selectLEQ(btn, idx){
  document.querySelectorAll('#s-leq .essay-q-btn').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel');
  currentLEQ = idx;
  renderLEQ(idx);
}
function resetLEQ(){
  document.getElementById('leq-results').style.display='none';
  document.getElementById('leq-textarea').value='';
  document.getElementById('leq-wc').textContent='0 words';
}

// â”€â”€ SCORE RING ANIMATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€ RUBRIC ROWS RENDERER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderRubricRows(containerId, rows){
  const el = document.getElementById(containerId);
  el.innerHTML = rows.map(r=>`
    <div class="rubric-row">
      <div class="rubric-badge ${r.score===r.max?'earned':r.score>0?'partial':'missed'}">${r.score===r.max?'':r.score>0?r.score:'X'}</div>
      <div>
        <div class="rubric-criterion">${r.criterion} <span style="color:var(--muted);font-weight:400;font-size:12px">(${r.score}/${r.max} pt${r.max>1?'s':''})</span></div>
        <div class="rubric-feedback">${r.feedback}</div>
      </div>
    </div>`).join('');
}

function renderChips(strengthsId, weaknessesId, strengths, weaknesses){
  document.getElementById(strengthsId).innerHTML = (strengths||[]).map(s=>`<span class="strength-chip"> ${s}</span>`).join('') || '<span style="color:var(--muted);font-size:13px">None identified</span>';
  document.getElementById(weaknessesId).innerHTML = (weaknesses||[]).map(w=>`<span class="weakness-chip">âš  ${w}</span>`).join('') || '<span style="color:var(--muted);font-size:13px">None identified</span>';
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  RULE-BASED AP GRADER  (no API key required)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ Shared helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function words(t){ return t.trim().split(/\s+/).filter(Boolean); }
function wc(t){ return words(t).length; }
function sentences(t){ return t.split(/[.!?]+/).map(s=>s.trim()).filter(s=>s.length>10); }
function paragraphs(t){ return t.split(/\n\s*\n+/).map(s=>s.trim()).filter(Boolean); }
function lc(t){ return t.toLowerCase(); }

// Thesis detection - looks for an arguable claim with a line of reasoning
function detectThesis(text){
  const paras = paragraphs(text);
  // Thesis usually appears in first or last paragraph
  const candidates = [paras[0], paras[paras.length-1]].filter(Boolean).join(' ');
  const t = lc(candidates);
  const thesisMarkers = [
    /\balthough\b/,/\bwhile\b/,/\bhowever\b/,/\bdespite\b/,/\beven though\b/,
    /\bto (a significant|a great|a large|a limited|a lesser) extent\b/,
    /\bprimarily because\b/,/\bmainly because\b/,/\blargely because\b/,
    /\bas a result of\b/,/\bcontributed to\b/,/\bplayed a (key|central|major|significant) role\b/,
    /\bmore (significant|important|influential) than\b/,
    /\bfundamentally (changed|transformed|altered)\b/,
    /\bto a greater extent\b/,/\bmore than\b.*\bless than\b/,
    /\brepresented (a|an) (significant|major|substantial|fundamental|radical|dramatic)/,
    /\bmarked (a|an) (turning point|significant|major|fundamental)/,
    /\bboth.*and.*however\b/,/\bwhile.*also\b/
  ];
  const hasMarker = thesisMarkers.some(r=>r.test(t));
  // Must also have a reasonable length claim (not just restating the prompt)
  const firstParaWC = wc(paras[0]||'');
  const hasSubstance = firstParaWC >= 40;
  const score = (hasMarker && hasSubstance) ? 1 : 0;
  let feedback;
  if(score===1){
    feedback = 'Your thesis presents a defensible claim with a line of reasoning. Good use of qualifying/comparative language.';
  } else if(hasSubstance && !hasMarker){
    feedback = 'Your introduction is well-developed but reads more as a summary than an argument. Add comparative or causal language (e.g., "Althoughâ€¦", "To a significant extentâ€¦", "primarily becauseâ€¦") to make a defensible claim with a clear line of reasoning.';
  } else {
    feedback = 'No clear thesis detected. Your first or last paragraph must make a historically defensible claim that responds to the prompt with a line of reasoning - not just a restatement of the question.';
  }
  return {score, feedback};
}

// Contextualization - looks for broader historical context outside the prompt timeframe
function detectContext(text, promptPeriod){
  const t = lc(text);
  const paras = paragraphs(text);
  // Context usually appears in the intro and must be 3+ sentences of broader background
  const introPara = paras[0]||'';
  const introSents = sentences(introPara);
  // Look for references to events/periods before/after the prompt timeframe
  const contextClues = [
    /\b(before|prior to|leading up to|in the years before|preceding|earlier)\b/,
    /\b(following|after|in the aftermath|subsequent|later)\b/,
    /\b(long-term|deep-rooted|historically|over (the|many) (centuries|decades|years))\b/,
    /\b(roots|origins|background|foundation|legacy|tradition)\b/,
    /\b(mercantil|salutary neglect|navigation acts|glorious revolution|enlightenment|renaissance|reformation)\b/,
    /\b(great awakening|scientific revolution|seven years|french and indian|stamp act|townshend|intolerable)\b/,
    /\b(market revolution|industrial revolution|second great awakening|manifest destiny)\b/,
    /\b(gilded age|progressive era|new deal|cold war|reconstruction|civil war|world war)\b/,
    /\b(colonization|settlement|exploration|conquest|fur trade|plantation)\b/,
    /\b(colonial period|antebellum|postbellum|antebellum period)\b/
  ];
  const contextSentenceCount = sentences(text).filter(s=> contextClues.some(r=>r.test(lc(s)))).length;
  // Must have at least 3 context sentences AND they should form a sustained description (not just mentions)
  const hasMultipleContextSents = contextSentenceCount >= 3;
  const introHasContext = contextClues.some(r=>r.test(lc(introPara)));
  const introIsSubstantial = introSents.length >= 3;
  const score = (hasMultipleContextSents && introHasContext && introIsSubstantial) ? 1 : 0;
  let feedback;
  if(score===1){
    feedback = 'Strong contextualization - you describe broader historical circumstances before/after the time period with multiple sentences of sustained context.';
  } else if(introHasContext && !hasMultipleContextSents){
    feedback = 'You mention some historical context, but contextualization requires at least 3 sentences of sustained description of the broader historical situation - not just a passing reference. Expand your opening paragraph.';
  } else {
    feedback = 'Missing contextualization. Your intro should describe the broader historical circumstances that set up the events in the prompt (e.g., colonial relationship with Britain, mercantile system, Enlightenment ideas). This must be more than one sentence.';
  }
  return {score, feedback};
}

// DBQ: Document citation counter
function countDocCitations(text, docs){
  const t = lc(text);
  const cited = new Set();
  docs.forEach((d,i)=>{
    const n = i+1;
    const patterns = [
      new RegExp(`\\bdoc(ument)?\\s*${n}\\b`,'i'),
      new RegExp(`\\b(${d.label.toLowerCase()})\\b`,'i'),
      new RegExp(`\\b(${d.meta.split(',')[0].substring(0,20).toLowerCase().replace(/[()]/g,'').trim()})\\b`,'i')
    ];
    if(patterns.some(p=>p.test(t))) cited.add(i);
  });
  return cited.size;
}

// DBQ: HAPP sourcing detection
function detectHAPP(text, docs){
  const t = lc(text);
  const happPatterns = [
    // Historical situation
    /\b(written (during|at a time|in the context of|in response to|amid)|published (during|when|as)|given (during|at|when)|delivered (during|at|when))\b/,
    /\b(historical (situation|context|circumstance|moment)|at the time of|the context in which)\b/,
    // Audience
    /\b(audience|intended for|written (to|for)|addressed to|reading|readers|listeners)\b/,
    /\b(congress|parliament|colonists|planters|workers|the public|american people|fellow|colleagues)\b.*\b(audience|would|intended|read|hear)\b/,
    // Purpose
    /\b(purpose|intended to|in order to|aim(ed|s)|goal|objective|designed to|meant to|sought to)\b.*\b(persuade|convince|justify|defend|advocate|argue|promote|encourage|warn)\b/,
    /\b(persuade|convince|justify|defend|advocate|argue|promote|encourage)\b.*\b(audience|reader|listener|congress|public)\b/,
    // Point of view
    /\b(point of view|perspective|bias|as (a|an) .{3,30}, (he|she|they)|because (he|she|they) (was|were|had|owned)|since (he|she|they))\b/,
    /\b(as (a|an) (wealthy|planter|merchant|colonist|woman|enslaved|british|loyalist|patriot|farmer|worker))\b/,
    /\b(his|her|their) (perspective|background|position|status|role|experience) (as|shaped|influenced|led)\b/
  ];
  const happCount = happPatterns.filter(p=>p.test(t)).length;
  // Must apply sourcing to a specific document (not just generic statements)
  const docRef = /doc(ument)?\s*[1-7]/i.test(t);
  const score = (happCount >= 2 && docRef) ? 1 : 0;
  let feedback;
  if(score===1){
    feedback = 'Good sourcing - you analyzed at least one document using HAPP (Historical situation, Audience, Purpose, or Point of view) to explain how it supports your argument.';
  } else if(happCount>=1){
    feedback = 'You gesture toward sourcing but need to explicitly analyze a specific document\'s Historical situation, Audience, Purpose, or Point of view - and explain how that sourcing supports your argument.';
  } else {
    feedback = 'Missing HAPP sourcing. Pick at least one document and explicitly state why its source (author\'s role, audience, purpose, or historical situation) affects how we interpret it. E.g., "Because Franklin was writing to persuade the British Parliament, heâ€¦"';
  }
  return {score, feedback};
}

// Evidence beyond the documents
function detectEvidenceBeyond(text, docs){
  const t = lc(text);
  // Look for specific historical facts/names not appearing in the documents
  const docText = lc(docs.map(d=>d.text+' '+d.meta).join(' '));
  // Broad list of APUSH-relevant proper nouns, events, legislation that signal outside knowledge
  const evidenceTerms = [
    'stamp act','townshend acts','intolerable acts','boston massacre','boston tea party',
    'continental congress','articles of confederation','constitutional convention','federalist papers',
    'bill of rights','jay treaty','louisiana purchase','war of 1812','missouri compromise',
    'nullification crisis','nat turner','frederick douglass','harriet tubman','underground railroad',
    'kansas-nebraska act','dred scott','john brown','harper\'s ferry','emancipation proclamation',
    'thirteenth amendment','fourteenth amendment','fifteenth amendment','sharecropping','black codes',
    'homestead act','transcontinental railroad','robber barons','sherman antitrust','populist party',
    'initiative','referendum','recall','muckrakers','upton sinclair','ida tarbell','jane addams',
    'triangle shirtwaist','pure food and drug','federal reserve','income tax','suffrage','nineteenth amendment',
    'espionage act','sedition act','schenck','great migration','harlem renaissance','langston hughes',
    'prohibition','volstead act','teapot dome','smoot-hawley','new deal','social security',
    'wagner act','court-packing','lend-lease','executive order 9066','g.i. bill',
    'truman doctrine','marshall plan','nato','korean war','mccarthyism','brown v. board',
    'montgomery bus boycott','civil rights act','voting rights act','great society','vietnam',
    'tet offensive','kent state','watergate','stagflation','reagan revolution','iran-contra',
    'gulf war','nafta','9/11','patriot act','great recession',
    // People
    'john adams','alexander hamilton','thomas jefferson','james madison','george washington',
    'andrew jackson','henry clay','john c. calhoun','daniel webster','abraham lincoln',
    'ulysses grant','william mckinley','theodore roosevelt','woodrow wilson','franklin roosevelt',
    'harry truman','dwight eisenhower','john kennedy','lyndon johnson','richard nixon',
    'martin luther king','malcolm x','cesar chavez','betty friedan','gloria steinem',
    'w.e.b. du bois','booker t. washington','ida b. wells','elizabeth cady stanton','sojourner truth'
  ];
  const docTerms = new Set(evidenceTerms.filter(e=>docText.includes(e)));
  const usedBeyond = evidenceTerms.filter(e=> !docTerms.has(e) && t.includes(e));
  const score = usedBeyond.length >= 2 ? 1 : 0;
  let feedback;
  if(score===1){
    feedback = `Good outside evidence - you referenced specific historical knowledge beyond the documents (e.g., ${usedBeyond.slice(0,3).join(', ')}).`;
  } else if(usedBeyond.length===1){
    feedback = `You mention one outside fact (${usedBeyond[0]}), but earning this point requires at least two specific pieces of evidence not found in the documents. Add another concrete historical example with explanation.`;
  } else {
    feedback = 'Missing evidence beyond the documents. Bring in at least two specific historical facts, events, people, or legislation not mentioned in the documents to support your argument.';
  }
  return {score, feedback};
}

// Complexity detection
function detectComplexity(text){
  const t = lc(text);
  const complexityPatterns = [
    // Corroboration (multiple docs point to same thing)
    /\b(together|collectively|both doc|multiple documents|taken together|corroborat)\b/,
    // Qualification / counter-argument
    /\b(however|nevertheless|nonetheless|on the other hand|conversely|yet|despite|counter|qualify|while it is true|it is important to note)\b.*\b(this|the|also|still|however)\b/,
    // Comparing to another time period
    /\b(similar(ly)?|in contrast to|unlike|compared to|just as|parallels?)\b.*\b(period|era|century|decade|war|revolution|movement)\b/,
    /\b(nineteenth century|eighteenth century|twentieth century|colonial period|antebellum|postwar|cold war)\b.*\b(similar|parallel|contrast|unlike)\b/,
    // Cause AND effect or multiple causation
    /\b(not only.*but also|both.*and|multiple (causes?|factors?|reasons?)|contributing factors?)\b/,
    // Turning point argument
    /\b(turning point|watershed|pivotal|marked (a|an) (significant|major|fundamental) (shift|change|transformation))\b/,
    // Tension / nuance
    /\b(tension between|contradiction|paradox|irony|simultaneously|at the same time)\b/
  ];
  const complexCount = complexityPatterns.filter(p=>p.test(t)).length;
  const totalWC = wc(text);
  // Also reward essays that are long enough to have developed analysis
  const score = (complexCount >= 2 || (complexCount >= 1 && totalWC >= 500)) ? 1 : 0;
  let feedback;
  if(score===1){
    feedback = 'Complexity demonstrated - your essay shows nuanced thinking through corroboration, qualification, comparison to another period, or acknowledgment of multiple causation.';
  } else if(complexCount===1){
    feedback = 'You make one complexity move, but this point requires a more sustained demonstration. Consider: comparing to another historical period, qualifying your argument with a counter-example, or explaining a tension within the evidence.';
  } else {
    feedback = 'Missing complexity. To earn this point, demonstrate nuanced analysis: corroborate documents to support a broader argument, qualify your thesis with a counter-example, compare the period to another era, or explain a historical tension/contradiction.';
  }
  return {score, feedback};
}

// SAQ: Grade a single part
function gradeSAQPart(response, questionText){
  const r = response.trim();
  const t = lc(r);
  if(r.length < 15) return {score:0, feedback:'No response provided. Each SAQ part requires a specific claim supported by evidence.'};
  const wcCount = wc(r);
  // Must have a specific claim (not vague)
  const vagueOnly = /^(yes|no|it (was|is|did|helped)|this (shows?|means?|caused?))[.,\s]/i.test(r);
  // Must have at least one specific historical reference
  const hasEvidence = [
    /\b(act|treaty|amendment|law|proclamation|declaration|constitution|executive order)\b/,
    /\b(war|revolution|movement|reform|protest|rebellion|migration|compromise|convention)\b/,
    /\b(congress|parliament|president|court|legislature|senator|representative)\b/,
    /\b(colonial|antebellum|reconstruction|progressive|gilded|postwar|cold war|civil rights)\b/,
    /\b\d{4}\b/ // any year
  ].some(p=>p.test(t));
  const hasClaim = wcCount >= 20 && !vagueOnly;
  const hasExplanation = wcCount >= 30; // needs explanation not just a name-drop
  const score = (hasClaim && hasEvidence && hasExplanation) ? 1 : 0;
  let feedback;
  if(score===1){
    feedback = 'Earns the point - includes a specific historical claim supported by evidence.';
  } else if(hasClaim && !hasEvidence){
    feedback = 'Your response makes a claim but lacks specific historical evidence. Name a specific event, law, person, or date to support your point.';
  } else if(!hasClaim){
    feedback = 'Response is too vague or too brief. State a specific, defensible historical claim and then support it with at least one concrete piece of evidence.';
  } else {
    feedback = 'Response needs more development. Make a clear claim and explain how your evidence supports it.';
  }
  return {score, feedback};
}

// LEQ: Evidence - specific examples
function detectLEQEvidence(text){
  const t = lc(text);
  const evidenceTerms = [
    'stamp act','townshend acts','boston','continental congress','articles of confederation',
    'constitutional convention','federalist','bill of rights','louisiana purchase','war of 1812',
    'missouri compromise','nullification','nat turner','frederick douglass','underground railroad',
    'kansas-nebraska','dred scott','john brown','emancipation','thirteenth','fourteenth','fifteenth',
    'sharecropping','black codes','homestead act','transcontinental railroad','sherman antitrust',
    'muckrakers','upton sinclair','jane addams','pure food','federal reserve','nineteenth amendment',
    'espionage act','great migration','harlem renaissance','prohibition','new deal','social security',
    'wagner act','lend-lease','marshall plan','nato','mccarthyism','brown v. board',
    'montgomery','civil rights act','voting rights','great society','vietnam','watergate',
    'reagan','9/11','nafta',
    'john adams','hamilton','jefferson','madison','washington','jackson','henry clay',
    'calhoun','webster','lincoln','grant','roosevelt','wilson','f. roosevelt','truman',
    'eisenhower','kennedy','johnson','nixon','king','malcolm x','du bois','washington',
    'ida b. wells','stanton','sojourner truth'
  ];
  const found = evidenceTerms.filter(e=>t.includes(e));
  const score = found.length >= 2 ? 1 : 0;
  const feedback = score===1
    ? `Good use of specific evidence - you cite multiple concrete examples (e.g., ${found.slice(0,3).join(', ')}).`
    : found.length===1
      ? `You cite ${found[0]}, but this point requires at least two specific pieces of historical evidence. Add another concrete example with explanation.`
      : 'Missing specific evidence. Name at least two specific historical events, people, laws, or dates and explain how they support your argument.';
  return {score, feedback};
}

// LEQ: Evidence supports argument
function detectLEQEvidenceArgument(text){
  const t = lc(text);
  const paras = paragraphs(text);
  // Evidence must be explicitly tied to the argument with explanatory language
  const explanatoryPatterns = [
    /\b(this (demonstrates?|shows?|illustrates?|reveals?|suggests?|indicates?|proves?|supports?))\b/,
    /\b(which (demonstrates?|shows?|illustrates?|reveals?|suggests?|indicates?|proves?|led to|caused|resulted in))\b/,
    /\b(because of|as a result of|this caused|this led to|this resulted in|therefore|thus|consequently)\b/,
    /\b(for example,|for instance,|such as|specifically,|in particular,)\b.*\b(because|since|which|that|demonstrat|shows?)\b/,
    /\bdemonstrates?\b.*\bargument\b|\bargument\b.*\bdemonstrates?\b/,
    /\bsupports? (the|my|this|the central|the overall) (argument|claim|thesis|point|contention)\b/
  ];
  const explanatoryCount = explanatoryPatterns.filter(p=>p.test(t)).length;
  // Also check that body paragraphs (not intro/conclusion) have evidence + explanation
  const bodyParas = paras.slice(1, -1);
  const bodyHasExplanation = bodyParas.filter(p=> explanatoryPatterns.some(r=>r.test(lc(p)))).length;
  const score = (explanatoryCount >= 2 && bodyHasExplanation >= 1) ? 1 : 0;
  const feedback = score===1
    ? 'Strong analytical writing - you consistently explain how your evidence supports the central argument.'
    : explanatoryCount===1
      ? 'You explain some evidence but need to do this more consistently across body paragraphs. Every piece of evidence should be explicitly tied back to your thesis.'
      : 'Your essay lists evidence but doesn\'t always explain how it supports your argument. After each piece of evidence, add a sentence that says "This demonstratesâ€¦" or "This shows thatâ€¦" to connect it to your thesis.';
  return {score, feedback};
}

// LEQ: Historical reasoning skill
function detectHistoricalReasoning(text){
  const t = lc(text);
  // Causation
  const causation = [
    /\b(caused?|cause of|result(ed)? (in|from)|led to|brought about|precipitated|triggered|contributed to|stemmed from|because of|due to|as a result of)\b/
  ];
  // Comparison
  const comparison = [
    /\b(similar(ly)?|in contrast|unlike unlike|compared to|whereas|while .{5,50} (was|were|had)|just as|by contrast|on the other hand)\b/
  ];
  // CCOT (continuity and change over time)
  const ccot = [
    /\b(changed?|transformed?|shift(ed)?|evolved?|transition(ed)?|declined?|grew|increased?|decreased?|remained?|continued?|persisted?|maintained?)\b.*\b(over time|throughout|by the (end|beginning|late|early)|from .{3,30} to)\b/,
    /\b(from .{3,30} to .{3,30}(,| the| there| this))\b/
  ];
  const hasCausation = causation.some(p=>p.test(t));
  const hasComparison = comparison.some(p=>p.test(t));
  const hasCCOT = ccot.some(p=>p.test(t));
  const reasoningCount = [hasCausation, hasComparison, hasCCOT].filter(Boolean).length;
  // Must use reasoning skill throughout, not just once
  const allMatches = [...causation,...comparison,...ccot].filter(p=>p.test(t)).length;
  const score = (reasoningCount >= 1 && allMatches >= 3) ? 1 : 0;
  let type = hasCausation ? 'causation' : hasComparison ? 'comparison' : hasCCOT ? 'CCOT' : null;
  const feedback = score===1
    ? `Good use of ${type||'historical reasoning'} - you apply this skill consistently to explain historical developments.`
    : reasoningCount>=1
      ? `You use ${type} language occasionally but need to apply it more consistently throughout the essay to demonstrate a sustained historical reasoning skill.`
      : 'Missing historical reasoning skill. Explicitly use causation (explain causes/effects), comparison (compare groups/periods/regions), or CCOT (explain what changed and what stayed the same over time).';
  return {score, feedback};
}

// Annotator - highlights sentences by rubric markers
function annotateSentences(text, patterns){
  const sents = text.split(/(?<=[.!?])\s+/);
  return sents.map(s=>{
    const sl = lc(s);
    const isStrong = patterns.strong.some(p=>p.test(sl));
    const isWeak = patterns.weak.some(p=>p.test(sl));
    if(isStrong) return `<mark class="strong">${s}</mark>`;
    if(isWeak) return `<mark class="weak">${s}</mark>`;
    return s;
  }).join(' ');
}



// â”€â”€ DBQ GRADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function gradeDBQ(){
  const ta = document.getElementById('dbq-textarea');
  const essay = ta.value.trim();
  if(essay.length < 80){ alert('Please write at least a few sentences before grading.'); return; }
  const q = DBQ_PROMPTS[currentDBQ];
  const btn = document.getElementById('dbq-grade-btn');
  btn.disabled=true; btn.innerHTML='<span class="grading-spinner"></span>Gradingâ€¦';

  // Small delay for UX so spinner shows
  setTimeout(()=>{
    try {
      const thesis = detectThesis(essay);
      const context = detectContext(essay, q.period);
      const docsCited = countDocCitations(essay, q.docs);
      const evidence3 = {
        score: docsCited >= 3 ? 1 : 0,
        feedback: docsCited >= 3
          ? `You cite ${docsCited} documents - meets the 3-document minimum for this point.`
          : `You cite approximately ${docsCited} document(s). You need to reference at least 3 documents by their label (Doc 1, Doc 2, etc.) and use their content as evidence.`
      };
      const evidence6 = {
        score: docsCited >= 6 ? 1 : 0,
        feedback: docsCited >= 6
          ? `Excellent - you cite ${docsCited}/7 documents, meeting the 6-document threshold.`
          : `You cite ${docsCited} document(s). Earning this point requires referencing at least 6 of the 7 documents. Reference ${Math.max(0,6-docsCited)} more document(s).`
      };
      const beyond = detectEvidenceBeyond(essay, q.docs);
      const happ = detectHAPP(essay, q.docs);
      const complexity = detectComplexity(essay);

      const rubricScores = [
        {criterion:'Thesis/Claim', score:thesis.score, max:1, feedback:thesis.feedback},{criterion:'Contextualization', score:context.score, max:1, feedback:context.feedback},{criterion:'Evidence - Document Content (3+ docs)', score:evidence3.score, max:1, feedback:evidence3.feedback},{criterion:'Evidence - Document Content (6+ docs)', score:evidence6.score, max:1, feedback:evidence6.feedback},{criterion:'Evidence Beyond the Documents', score:beyond.score, max:1, feedback:beyond.feedback},{criterion:'Analysis & Reasoning - Sourcing (HAPP)', score:happ.score, max:1, feedback:happ.feedback},{criterion:'Analysis & Reasoning - Complexity', score:complexity.score, max:1, feedback:complexity.feedback}
      ];
      const totalScore = rubricScores.reduce((a,r)=>a+r.score,0);
      const strengths = rubricScores.filter(r=>r.score===r.max).map(r=>r.criterion);
      const weaknesses = rubricScores.filter(r=>r.score<r.max).map(r=>r.criterion);
      const annotatedHtml = annotateSentences(essay, DBQ_ANNOTATE_PATTERNS);
      renderDBQResults({totalScore, rubricScores, strengths, weaknesses, annotatedHtml});
    } catch(e){
      btn.disabled=false; btn.innerHTML='Grade with AP Rubric ->';
      console.error(e);
    }
  }, 600);
}

function renderDBQResults(r){
  const btn = document.getElementById('dbq-grade-btn');
  btn.disabled=false; btn.innerHTML='Grade with AP Rubric ->';
  document.getElementById('dbq-results').style.display='block';
  const arc = document.getElementById('dbq-arc');
  const circ = 2*Math.PI*38;
  arc.style.strokeDasharray=circ; arc.style.strokeDashoffset=circ*(1-r.totalScore/7);
  document.getElementById('dbq-score-num').textContent=r.totalScore+'/7';
  const verdicts=['Needs Significant Work','Needs Work','Approaching','Developing','Solid','Strong','Excellent','Near Perfect'];
  document.getElementById('dbq-verdict').textContent = verdicts[Math.min(r.totalScore,7)]||'';
  renderRubricRows('dbq-rubric-rows', r.rubricScores);
  renderChips('dbq-strengths','dbq-weaknesses', r.strengths, r.weaknesses);
  document.getElementById('dbq-annotated').innerHTML = r.annotatedHtml || document.getElementById('dbq-textarea').value;
}

// â”€â”€ SAQ GRADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function gradeSAQ(){
  const q = SAQ_PROMPTS[currentSAQ];
  const responses = q.parts.map((_,i)=> (document.getElementById('saq-ta-'+i)||{}).value||'');
  if(responses.every(r=>r.trim().length<10)){ alert('Please write responses before grading.'); return; }
  const btn = document.getElementById('saq-grade-btn');
  btn.disabled=true; btn.innerHTML='<span class="grading-spinner"></span>Gradingâ€¦';

  setTimeout(()=>{
    try {
      const rubricScores = q.parts.map((p,i)=>{
        const result = gradeSAQPart(responses[i]||'', p.q);
        return {criterion:`Part ${p.label}`, score:result.score, max:1, feedback:result.feedback};
      });
      const totalScore = rubricScores.reduce((a,r)=>a+r.score,0);
      const strengths = rubricScores.filter(r=>r.score===1).map(r=>r.criterion+' - specific claim with evidence');
      const weaknesses = rubricScores.filter(r=>r.score===0).map(r=>r.criterion+' - needs specific historical claim and evidence');
      renderSAQResults({totalScore, rubricScores, strengths, weaknesses});
    } catch(e){
      btn.disabled=false; btn.innerHTML='Grade with AP Rubric ->';
      console.error(e);
    }
  }, 500);
}

function renderSAQResults(r){
  const btn = document.getElementById('saq-grade-btn');
  btn.disabled=false; btn.innerHTML='Grade with AP Rubric ->';
  document.getElementById('saq-results').style.display='block';
  const arc = document.getElementById('saq-arc');
  const circ = 2*Math.PI*38;
  arc.style.strokeDasharray=circ; arc.style.strokeDashoffset=circ*(1-r.totalScore/3);
  document.getElementById('saq-score-num').textContent=r.totalScore+'/3';
  const verdicts=['Needs Work','Approaching','Developing','Full Credit'];
  document.getElementById('saq-verdict').textContent = verdicts[r.totalScore]||'';
  renderRubricRows('saq-rubric-rows', r.rubricScores);
  renderChips('saq-strengths','saq-weaknesses', r.strengths, r.weaknesses);
}

// â”€â”€ LEQ GRADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function gradeLEQ(){
  const ta = document.getElementById('leq-textarea');
  const essay = ta.value.trim();
  if(essay.length < 80){ alert('Please write at least a few sentences before grading.'); return; }
  const q = LEQ_PROMPTS[currentLEQ];
  const btn = document.getElementById('leq-grade-btn');
  btn.disabled=true; btn.innerHTML='<span class="grading-spinner"></span>Gradingâ€¦';

  setTimeout(()=>{
    try {
      const thesis = detectThesis(essay);
      const context = detectContext(essay, q.period);
      const evExamples = detectLEQEvidence(essay);
      const evArgument = detectLEQEvidenceArgument(essay);
      const reasoning = detectHistoricalReasoning(essay);
      const complexity = detectComplexity(essay);

      const rubricScores = [
        {criterion:'Thesis/Claim', score:thesis.score, max:1, feedback:thesis.feedback},{criterion:'Contextualization', score:context.score, max:1, feedback:context.feedback},{criterion:'Evidence - Specific Examples', score:evExamples.score, max:1, feedback:evExamples.feedback},{criterion:'Evidence - Supports Argument', score:evArgument.score, max:1, feedback:evArgument.feedback},{criterion:'Analysis & Reasoning - Historical Reasoning Skill', score:reasoning.score, max:1, feedback:reasoning.feedback},{criterion:'Analysis & Reasoning - Complexity', score:complexity.score, max:1, feedback:complexity.feedback}
      ];
      const totalScore = rubricScores.reduce((a,r)=>a+r.score,0);
      const strengths = rubricScores.filter(r=>r.score===r.max).map(r=>r.criterion);
      const weaknesses = rubricScores.filter(r=>r.score<r.max).map(r=>r.criterion);
      const annotatedHtml = annotateSentences(essay, DBQ_ANNOTATE_PATTERNS);
      renderLEQResults({totalScore, rubricScores, strengths, weaknesses, annotatedHtml});
    } catch(e){
      btn.disabled=false; btn.innerHTML='Grade with AP Rubric ->';
      console.error(e);
    }
  }, 600);
}

function renderLEQResults(r){
  const btn = document.getElementById('leq-grade-btn');
  btn.disabled=false; btn.innerHTML='Grade with AP Rubric ->';
  document.getElementById('leq-results').style.display='block';
  const arc = document.getElementById('leq-arc');
  const circ = 2*Math.PI*38;
  arc.style.strokeDasharray=circ; arc.style.strokeDashoffset=circ*(1-r.totalScore/6);
  document.getElementById('leq-score-num').textContent=r.totalScore+'/6';
  const verdicts=['Needs Significant Work','Needs Work','Approaching','Developing','Solid','Strong','Excellent'];
  document.getElementById('leq-verdict').textContent = verdicts[Math.min(r.totalScore,6)]||'';
  renderRubricRows('leq-rubric-rows', r.rubricScores);
  renderChips('leq-strengths','leq-weaknesses', r.strengths, r.weaknesses);
  document.getElementById('leq-annotated').innerHTML = r.annotatedHtml || document.getElementById('leq-textarea').value;
}
