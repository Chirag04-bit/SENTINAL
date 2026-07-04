// content.js
// Extract token from SENTINEL web storage and sync with extension storage
function syncToken() {
  const token = localStorage.getItem('sentinel_token');
  if (token) {
    chrome.runtime.sendMessage({ action: "SYNC_TOKEN", token: token });
  }
}

// Run on load
syncToken();

// Listen to storage changes on the page
window.addEventListener('storage', (e) => {
  if (e.key === 'sentinel_token') {
    syncToken();
  }
});
