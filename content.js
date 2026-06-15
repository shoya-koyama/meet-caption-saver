(function(){
  // Watch for caption-like elements and send text to background
  const lastTexts = new WeakMap();

  function isCaptionNode(node){
    if(!(node instanceof Element)) return false;
    const ariaLive = node.getAttribute && (node.getAttribute('aria-live'));
    if(ariaLive === 'polite' || ariaLive === 'assertive') return true;
    const role = node.getAttribute && node.getAttribute('role');
    if(role === 'region' && node.textContent && node.textContent.trim()) return true;
    const cls = (node.className || '');
    if(typeof cls === 'string' && /caption|subtitle|closed-caption|cc/i.test(cls)) return true;
    return false;
  }

  function extractAndSend(node){
    try{
      const text = node.innerText?.trim();
      if(!text) return;
      const last = lastTexts.get(node);
      if(last === text) return; // avoid duplicates
      lastTexts.set(node, text);
      chrome.runtime.sendMessage({type:'caption', text, timestamp: Date.now()});
    }catch(e){console.error('caption extract error', e)}
  }

  const observer = new MutationObserver(muts => {
    for(const m of muts){
      if(m.type === 'childList'){
        m.addedNodes.forEach(n => {
          if(isCaptionNode(n)) extractAndSend(n);
          if(n.querySelector){
            n.querySelectorAll('[aria-live], [role="region"]').forEach(extractAndSend);
            n.querySelectorAll('*').forEach(el => { if(isCaptionNode(el)) extractAndSend(el); });
          }
        });
      } else if(m.type === 'characterData'){
        const parent = m.target.parentElement;
        if(parent && isCaptionNode(parent)) extractAndSend(parent);
      }
    }
  });

  // Start observing the document body
  function start(){
    if(document.body) observer.observe(document.body, {childList:true, subtree:true, characterData:true});
    // initial scan
    document.querySelectorAll('[aria-live], [role="region"], .caption, [class*="caption"]').forEach(el => { if(isCaptionNode(el)) extractAndSend(el); });
  }

  // Delay start until body exists
  if(document.readyState === 'loading'){
    window.addEventListener('DOMContentLoaded', start);
  } else start();
})();
