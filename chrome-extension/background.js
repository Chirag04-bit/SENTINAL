// background.js
let sentinelToken = null;

// Listen for sync actions from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SYNC_TOKEN") {
    sentinelToken = message.token;
    chrome.storage.local.set({ sentinelToken: message.token });
    console.log("SENTINEL extension authenticated successfully.");
  }
});

// Restore token from local storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["sentinelToken"], (result) => {
    if (result.sentinelToken) {
      sentinelToken = result.sentinelToken;
    }
  });
});

// Listen to tab transitions
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    auditUrl(tab.url);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      auditUrl(tab.url);
    }
  });
});

async function auditUrl(url) {
  if (!url.startsWith('http')) return;
  if (url.includes('localhost:8000') || url.includes('chrome://')) return;

  // Restore token if missing
  if (!sentinelToken) {
    const result = await chrome.storage.local.get(["sentinelToken"]);
    sentinelToken = result.sentinelToken;
  }

  if (!sentinelToken) {
    console.warn("SENTINEL Extension: User is not logged in on http://localhost:5173");
    return;
  }

  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;

    const res = await fetch('http://localhost:8000/users/me/sources/chrome/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sentinelToken}`
      },
      body: JSON.stringify({ url: url, domain: domain })
    });

    const data = await res.json();
    console.log("SENTINEL Audit result:", data);
    
    // Save last audit result to extension storage for display in popup
    chrome.storage.local.set({ 
      lastAuditedUrl: url, 
      lastAuditedDomain: domain,
      lastThreatStatus: data.threat_status,
      lastThreatIsThreat: data.is_threat
    });
  } catch (err) {
    console.error("SENTINEL Extension URL audit request failed:", err);
  }
}
