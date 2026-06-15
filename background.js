// Service worker background script
// Stores captured captions in chrome.storage and handles download requests.

chrome.runtime.onInstalled.addListener(() => {
  // Start capturing by default so extension can run headlessly; click action downloads the file.
  chrome.storage.local.set({captions: [], enabled: true});
});

// Single action button: download current captions when clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get('captions', res => {
    const arr = res.captions || [];
    const text = arr.map(x => {
      const t = x.ts ? new Date(x.ts).toLocaleString() : '';
      return t ? `${t} - ${x.text}` : x.text;
    }).join('\n');
    const url = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    chrome.downloads.download({url, filename: 'meet-captions.txt'});
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if(msg && msg.type === 'caption'){
    // Append caption only when enabled
    chrome.storage.local.get(['enabled','captions'], res => {
      const enabled = !!res.enabled;
      if(!enabled) return;
      const arr = res.captions || [];
      arr.push({text: msg.text, ts: msg.timestamp || Date.now()});
      // Keep only last 10000 entries to bound storage (arbitrary)
      if(arr.length > 10000) arr.splice(0, arr.length - 10000);
      chrome.storage.local.set({captions: arr});
    });
    return; // no sendResponse
  }

  if(msg && msg.type === 'get_captions'){
    chrome.storage.local.get('captions', res => sendResponse({captions: res.captions || []}));
    return true; // will respond asynchronously
  }

  if(msg && msg.type === 'set_enabled'){
    chrome.storage.local.set({enabled: !!msg.enabled}, () => sendResponse({ok:true}));
    return true;
  }

  if(msg && msg.type === 'clear'){
    chrome.storage.local.set({captions: []}, () => sendResponse({ok:true}));
    return true;
  }

  if(msg && msg.type === 'download'){
    chrome.storage.local.get('captions', res => {
      const arr = res.captions || [];
      const text = arr.map(x => {
        const t = x.ts ? new Date(x.ts).toLocaleString() : '';
        return t ? `${t} - ${x.text}` : x.text;
      }).join('\n');
      const url = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
      chrome.downloads.download({url, filename: msg.filename || 'meet-captions.txt'});
      sendResponse({ok:true});
    });
    return true;
  }

});
