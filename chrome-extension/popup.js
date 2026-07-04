// popup.js
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["sentinelToken", "lastAuditedUrl", "lastAuditedDomain", "lastThreatStatus", "lastThreatIsThreat"], (result) => {
    const statusBadge = document.getElementById("connection-status");
    const activeDomain = document.getElementById("active-domain");
    const scanResult = document.getElementById("scan-result");

    if (result.sentinelToken) {
      statusBadge.textContent = "CONNECTED";
      statusBadge.className = "status-badge connected";
    } else {
      statusBadge.textContent = "UNLINKED";
      statusBadge.className = "status-badge disconnected";
    }

    if (result.lastAuditedDomain) {
      activeDomain.textContent = result.lastAuditedDomain;
      
      if (result.lastThreatIsThreat) {
        scanResult.textContent = "⚠️ PHISHING RISK DETECTED";
        scanResult.className = "result threat";
      } else if (result.lastThreatStatus === "safe") {
        scanResult.textContent = "✓ VERIFIED SAFE";
        scanResult.className = "result safe";
      } else {
        scanResult.textContent = "NEUTRAL / NOT EVALUATED";
        scanResult.className = "result suspicious";
      }
    } else {
      activeDomain.textContent = "No active tabs audited yet.";
      scanResult.textContent = "Waiting for tab navigation...";
    }
  });
});
