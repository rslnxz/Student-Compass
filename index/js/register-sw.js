// Registers the offline cache when hosted over http(s), such as GitHub Pages.
(function(){
  if(!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('./service-worker.js').catch(function(err){
      console.warn('Service worker registration failed', err);
    });
  });
})();
