(function(){
  const importedPages = new Set(['s-fc','s-school','s-gpa','s-college']);
  function root(){ return document.getElementById('tool-page-root'); }
  function setActiveNav(id){
    document.querySelectorAll('.nav-btn,.drawer-btn').forEach(btn =>btn.classList.remove('active'));
    const el = document.getElementById(id);
    if(el) el.classList.add('active');
  }
  function hideToolRoot(){
    const r = root();
    if(r){ r.classList.remove('on','gpa-page'); r.style.display='none'; }
  }
  window.openToolPage = function(pageId, navId){
    const source = document.getElementById(pageId);
    const r = root();
    if(!source || !r) return;
    document.querySelectorAll('.sec').forEach(section => {
      section.classList.remove('on');
      section.style.display='none';
    });
    r.innerHTML = source.innerHTML;
    r.classList.add('on');
    r.classList.toggle('gpa-page',pageId === 's-gpa');
    r.style.display = 'block';
    document.body.setAttribute('data-current-page',pageId);
    setActiveNav(navId || ('nav-' + pageId.replace('s-','')));
    if(pageId === 's-fc' && typeof window.fcRestart === 'function') {
      try { window.fcRestart(); } catch(e) { console.warn('Flashcard init failed', e); }
    }
    if(pageId === 's-gpa' && typeof window.initGPA === 'function') {
      try { window.initGPA(); } catch(e) { console.warn('GPA init failed', e); }
    }
    if(pageId === 's-college' && typeof window.initCollege === 'function') {
      try { window.initCollege(); } catch(e) { console.warn('College search init failed', e); }
    }
    if(pageId === 's-profile' && typeof window.renderProfile === 'function') {
      try { window.renderProfile(); } catch(e) { console.warn('Profile init failed', e); }
    }
  };
  const originalShow = window.show;
  window.show = function(id){
    hideToolRoot();
    document.querySelectorAll('.sec').forEach(section => { section.style.display=''; });
    if(typeof originalShow === 'function') originalShow(id);
  };
  window.showPage = function(id){
    if(importedPages.has(id)) {
      window.openToolPage(id, 'nav-' + id.replace('s-',''));
      return;
    }
    window.show(id);
  };
  window.showFlashcards = function(){ window.openToolPage('s-fc','nav-fc'); };
  function clearImportedPageHash(){
    const id = location.hash ? location.hash.slice(1) : '';
    if(importedPages.has(id)) history.replaceState(null, '', location.pathname + location.search);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', clearImportedPageHash);
  else clearImportedPageHash();
})();
