(function(){
  function initDrillBoxes(){
    var note=document.getElementById('drills-interaction-note');
    var boxes=Array.prototype.slice.call(document.querySelectorAll('#sat-tab-drills [data-drill-detail]'));
    if(!note || !boxes.length) return;
    boxes.forEach(function(box){
      if(box.__drillBoxReady) return;
      box.__drillBoxReady=true;
      box.setAttribute('role','button');
      box.setAttribute('tabindex','0');
      if(!box.getAttribute('aria-label')){
        var titleEl=box.querySelector('h3') || box.querySelector('strong') || box.querySelector('.drills-signal span') || box.querySelector('span');
        var title=titleEl ? titleEl.textContent.trim() : 'Drill detail';
        box.setAttribute('aria-label','Explain '+title);
      }
      function activate(){
        boxes.forEach(function(other){other.classList.remove('drills-active'); other.setAttribute('aria-pressed','false');});
        box.classList.add('drills-active');
        box.setAttribute('aria-pressed','true');
        note.textContent=box.getAttribute('data-drill-detail');
      }
      box.addEventListener('click',activate);
      box.addEventListener('keydown',function(e){
        if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}
      });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initDrillBoxes); else initDrillBoxes();
  window.addEventListener('load',initDrillBoxes);
})();
