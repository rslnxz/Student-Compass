// Centralized state helper for future app modules.
(function(){
  const KEY='studentCompassState';
  const VERSION=1;
  function read(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}
  }
  function write(next){
    const value=Object.assign({version:VERSION,updatedAt:new Date().toISOString()}, read(), next||{});
    localStorage.setItem(KEY, JSON.stringify(value));
    return value;
  }
  function update(fn){
    const current=read();
    return write(typeof fn==='function' ? fn(current) : fn);
  }
  window.StudentCompassState={read,write,update,KEY,VERSION};
})();
