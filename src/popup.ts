const toggle = document.getElementById('toggle') as HTMLInputElement;

chrome.storage.local.get('enabled', data => {
  toggle.checked = data.enabled !== false;
});

toggle.addEventListener('change', () => {
  chrome.storage.local.set({ enabled: toggle.checked });
});