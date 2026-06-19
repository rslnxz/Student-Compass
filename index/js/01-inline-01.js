(function(){
  return; // Disabled for performance: decorative tilt listeners were causing scroll and hover lag.
  function addTilt(sel){document.querySelectorAll(sel).forEach(function(el){
    el.addEventListener('mousemove',function(e){var r=el.getBoundingClientRect(),rx=(((e.clientY-r.top)/r.height)-.5)*-14,ry=(((e.clientX-r.left)/r.width)-.5)*14;el.style.transform='perspective(600px) rotateX('+rx+'deg) rotateY('+ry+'deg) translateY(-4px) scale(1.01)';el.style.boxShadow='0 24px 48px rgba(0,0,0,.45),0 0 24px rgba(139,92,246,.2)';el.style.borderColor='rgba(139,92,246,.4)';});
    el.addEventListener('mouseleave',function(){el.style.transform='';el.style.boxShadow='';el.style.borderColor='';});
  });}
  function initTilt(){}
  new MutationObserver(function(m){m.forEach(function(x){if(x.addedNodes.length)initTilt();});}).observe(document.body, {childList:true,subtree:true});
})();
(function(){
  function apply(){}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',apply);}else{apply();}
})();
(function(){
  return; // Disabled for performance: reveal-on-scroll made content appear late during fast scrolling.
  var s=document.createElement('style');
  s.textContent='.rev-item{opacity:0;transform:translateY(28px);transition:opacity .6s ease,transform .6s ease}.rev-item.vis{opacity:1;transform:none}';
  document.head.appendChild(s);
  function init(){
        var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('vis');});},{threshold:0.1});
    document.querySelectorAll('.rev-item').forEach(function(el){io.observe(el);});
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
// Deep-link support: /app.html?page=s-sat
(function(){
  try{
    var p=new URLSearchParams(location.search).get('page');
    if(!p) return;
    var go=function(){
      try{
        // map known pages to their init functions
        if(p==='s-fc' && typeof showFlashcards==='function'){ showFlashcards(); }
        else if(p==='s-sat' && typeof showSAT==='function'){ showSAT(); }
        else if(p==='s-start' && typeof show==='function'){ show('s-start'); if(typeof setNav==='function') setNav('nav-quiz'); }
        else if(typeof showPage==='function'){
          showPage(p);
          var navId='nav-'+p.replace('s-','');
          if(typeof setNav==='function'){ setNav(navId); }
        }
      }catch(e){ console.error('deep-link error', e); }
    };
    if(document.readyState==='complete'){ go(); } else { window.addEventListener('load', go); }
  }catch(e){}
})();
