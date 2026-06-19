(function(){
  function stabilize(){
    if(window.__scFramerObserver && window.__scFramerObserver.disconnect){
      try{window.__scFramerObserver.disconnect();}catch(e){}
      window.__scFramerObserver=null;
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',stabilize); else stabilize();
})();
