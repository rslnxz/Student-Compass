(function(){
  function enhanceSchoolGuide(){
    var school=document.getElementById('s-school');
    if(!school || school.querySelector('.school-guide-jump')) return;
    var cards=Array.prototype.slice.call(school.querySelectorAll(':scope > .card'));
    var names=['Big picture','High school years','Class levels','School year','Classroom culture','Testing timeline','New to the US'];
    var jump=document.createElement('div');
    jump.className='school-guide-jump';
    var intro=document.createElement('div');
    intro.innerHTML='<h2>School guide map</h2><p>Jump straight to the part you need. The guide is now spaced out so it reads more like a reference page than one long block.</p>';
    var links=document.createElement('div');
    links.className='school-guide-links';
    cards.slice(0,names.length).forEach(function(card,index){
      var id='school-guide-section-'+(index+1);
      card.id=id;
      var a=document.createElement('a');
      a.href='#'+id;
      a.textContent=String(index+1).padStart(2,'0')+' / '+names[index];
      links.appendChild(a);
    });
    var map=document.createElement('div');
    map.className='school-guide-map';
    map.innerHTML='<div class="school-guide-route" aria-hidden="true">'+
      '<div class="school-guide-stop"><div class="school-guide-dot">01</div><span>Start here</span></div>'+
      '<div class="school-guide-stop"><div class="school-guide-dot">02</div><span>Pick grade path</span></div>'+
      '<div class="school-guide-stop"><div class="school-guide-dot">03</div><span>Plan tests</span></div>'+
      '<div class="school-guide-stop"><div class="school-guide-dot">04</div><span>Ask better questions</span></div>'+
    '</div>';
    map.appendChild(links);
    jump.appendChild(intro);
    jump.appendChild(map);
    var head=school.querySelector('.bc-page-head');
    if(head && head.nextSibling){school.insertBefore(jump,head.nextSibling);}else{school.insertBefore(jump,school.firstChild);}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',enhanceSchoolGuide); else enhanceSchoolGuide();
})();
