(function(){
  function mark(pageId){
    var r=document.getElementById('tool-page-root');
    if(r) r.classList.toggle('school-guide-open',pageId==='s-school');
  }
  function patch(){
    if(!window.openToolPage || window.openToolPage.__schoolGuideRootPatched) return;
    var prev=window.openToolPage;
    window.openToolPage=function(pageId,navId){
      var result=prev.apply(this,arguments);
      mark(pageId);
      return result;
    };
    window.openToolPage.__schoolGuideRootPatched=true;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',patch); else patch();
})();
