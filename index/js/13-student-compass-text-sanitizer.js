(function(){
  function seq(){
    return String.fromCharCode.apply(String, arguments);
  }
  var replacements=[
    [seq(0x00c2,0x00a0),' '],
    [seq(0x00c2),''],
    [seq(0x00e2,0x2020,0x2019),'->'],
    [seq(0x00e2,0x2020,0x0090),'<-'],
    [seq(0x00e2,0x2020,0x201c),'v'],
    [seq(0x00e2,0x20ac,0x201d),' - '],
    [seq(0x00e2,0x20ac,0x201c),'-'],
    [seq(0x00e2,0x02c6,0x2019),'-'],
    [seq(0x00e2,0x02c6,0x0161),'sqrt'],
    [seq(0x00e2,0x0089,0x00a5),'>='],
    [seq(0x00e2,0x0089,0x00a4),'<='],
    [seq(0x00e2,0x0089,0x00a0),'!='],
    [seq(0x00e2,0x0088,0x00aa),' union '],
    [seq(0x00e2,0x0088,0x00a9),' intersection '],
    [seq(0x00e2,0x008f,0x00b1),''],
    [seq(0x00e2,0x008f,0x00ad),''],
    [seq(0x00e2,0x008f,0x00b8),''],
    [seq(0x00e2,0x0153,0x201c),''],
    [seq(0x00e2,0x0153,0x2014),'X'],
    [seq(0x00e2,0x0153,0x008d,0x00ef,0x00b8,0x008f),''],
    [seq(0x00c3,0x00a9),'e'],
    [seq(0x00c3,0x00a1),'a'],
    [seq(0x00c3,0x00b3),'o'],
    [seq(0x00c3,0x0097),'x'],
    [seq(0x00c3,0x00b7),'/'],
    [seq(0x00ce,0x00b8),'theta'],
    [seq(0x00cf,0x20ac),'pi']
  ];
  function cleanText(value){
    if(!value || !/[^\x00-\x7F]/.test(value)) return value;
    var next=value;
    replacements.forEach(function(pair){
      next=next.split(pair[0]).join(pair[1]);
    });
    next=next.replace(/\u00f0\u0178[\s\S]{2}/g,'');
    next=next.replace(/\u00e2[\s\S]{2}/g,'');
    next=next.replace(/\s+(-|->|<-|v)\s*$/,'');
    next=next.replace(/\s{2,}/g,' ');
    return next;
  }
  function cleanNode(root){
    if(!root) return;
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
      acceptNode:function(node){
        var parent=node.parentElement;
        if(!parent || /^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION)$/i.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return /[^\x00-\x7F]/.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    var nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      var cleaned=cleanText(node.nodeValue);
      if(cleaned!==node.nodeValue) node.nodeValue=cleaned;
    });
  }
  function run(){
    cleanNode(document.getElementById('app') || document.body);
  }
  function patch(name){
    var fn=window[name];
    if(typeof fn!=='function' || fn.__textSanitized) return;
    window[name]=function(){
      var result=fn.apply(this,arguments);
      setTimeout(run,0);
      return result;
    };
    window[name].__textSanitized=true;
  }
  function init(){
    run();
    ['show','openToolPage','showSATTab','startQuiz','startSAT','satLaunchUnit','drillsLaunch','fcSetDeck','fcFlip','fcMark'].forEach(patch);
    if(!window.__scTextSanitizerObserver){
      var scheduled=false;
      window.__scTextSanitizerObserver=new MutationObserver(function(records){
        if(!records.some(function(r){return r.addedNodes && r.addedNodes.length;})) return;
        if(scheduled) return;
        scheduled=true;
        setTimeout(function(){scheduled=false;run();},80);
      });
      window.__scTextSanitizerObserver.observe(document.getElementById('app') || document.body,{childList:true,subtree:true});
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
  window.addEventListener('load',run);
})();
