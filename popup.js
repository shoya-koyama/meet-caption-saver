const toggleBtn = document.getElementById('toggle');
const downloadBtn = document.getElementById('download');
const clearBtn = document.getElementById('clear');
const preview = document.getElementById('preview');

function setToggle(enabled){
  toggleBtn.textContent = enabled ? 'Stop capturing' : 'Start capturing';
}

// Read enabled and captions on load
chrome.storage.local.get(['enabled','captions'], res => {
  setToggle(!!res.enabled);
  preview.value = (res.captions || []).map(c => (c.ts ? new Date(c.ts).toLocaleString() + ' - ' : '') + c.text).join('\n');
});

toggleBtn.addEventListener('click', () => {
  chrome.storage.local.get('enabled', res => {
    const next = !res.enabled;
    chrome.runtime.sendMessage({type:'set_enabled', enabled: next}, () => {
      chrome.storage.local.set({enabled: next}, () => setToggle(next));
    });
  });
});

downloadBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({type:'download', filename: 'meet-captions.txt'}, () => {});
});

clearBtn.addEventListener('click', () => {
  if(!confirm('Clear saved captions?')) return;
  chrome.runtime.sendMessage({type:'clear'}, () => {
    preview.value = '';
  });
});

// Refresh preview periodically
setInterval(() => {
  chrome.runtime.sendMessage({type:'get_captions'}, res => {
    const arr = (res && res.captions) || [];
    preview.value = arr.map(c => (c.ts ? new Date(c.ts).toLocaleString() + ' - ' : '') + c.text).join('\n');
  });
}, 1500);
