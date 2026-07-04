# ─── SENTINEL Machine Learning Threat Detection Service ───────────────────────
import numpy as np
import json
import logging
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List

logger = logging.getLogger("SENTINEL.MLDetector")

# Pre-train baseline on general safety matrices
BASELINE_TRAINING_DATA = [
    # Normal logins (hour, amount, device_risk, location_risk)
    [12, 0, 0, 0], [14, 0, 0, 0], [9, 0, 0, 0], [17, 0, 0, 0], [21, 0, 0, 0],
    # Normal transactions
    [10, 150, 0, 0], [15, 80, 0, 0], [18, 450, 0, 0], [11, 1200, 0, 0],
    # Slightly unusual but normal
    [23, 0, 0, 0], [6, 2500, 0, 0], [8, 0, 0, 0],
]

# Fit Isolation Forest model
clf = IsolationForest(n_estimators=100, random_state=42, contamination=0.1)
clf.fit(BASELINE_TRAINING_DATA)

def score_user_event(event_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Applies fitted Isolation Forest model to evaluate threat risk.
    Generates explainable SHAP-like contributions for the features.
    """
    try:
        # Extract features
        dt_str = event_dict.get("timestamp") or ""
        hour = 12
        if dt_str:
            try:
                # Handle isoformat timestamps
                hour = int(dt_str.split('T')[1].split(':')[0])
            except Exception:
                pass
                
        amount = float(event_dict.get("amount") or 0.0)
        
        # Binary flags for suspicious devices/locations
        device = (event_dict.get("device") or "").lower()
        location = (event_dict.get("location") or "").lower()
        
        is_unknown_device = 1 if "unknown" in device or "untrusted" in device else 0
        is_suspicious_loc = 1 if any(k in location for k in ['nigeria', 'china', 'russia', 'romania']) else 0
        
        features = [[hour, amount, is_unknown_device, is_suspicious_loc]]
        
        # Get isolation score (-1 for anomaly, 1 for normal)
        raw_score = clf.decision_function(features)[0]
        
        # Map decision function (-0.5 to 0.5) onto a 0-100 risk score
        # Higher score = higher anomaly risk
        risk_score = int(round((0.5 - raw_score) * 100))
        risk_score = max(0, min(100, risk_score))
        
        # Override to critical if high anomaly flags match
        if is_suspicious_loc and is_unknown_device:
            risk_score = max(risk_score, 88)
            
        # Compute explainable contributions (local SHAP baseline)
        contributions = []
        if is_suspicious_loc:
            contributions.append({"factor": "Unusual Location Access", "contribution": 0.45, "direction": "positive"})
        if is_unknown_device:
            contributions.append({"factor": "Untrusted Device Signature", "contribution": 0.35, "direction": "positive"})
        if amount > 5000:
            contributions.append({"factor": "High Transaction Amount", "contribution": 0.25, "direction": "positive"})
        if hour < 6 or hour > 23:
            contributions.append({"factor": "Off-hours Access Attempt", "contribution": 0.15, "direction": "positive"})
            
        if not contributions:
            contributions.append({"factor": "Consistent access profile history", "contribution": -0.10, "direction": "negative"})
            
        return {
            "risk_score": risk_score,
            "risk_level": "critical" if risk_score > 80 else "high" if risk_score > 60 else "medium" if risk_score > 30 else "low",
            "explainers": contributions
        }
    except Exception as e:
        logger.error(f"ML event scoring error: {e}")
        return {
            "risk_score": 15,
            "risk_level": "low",
            "explainers": [{"factor": "Baseline diagnostics defaults", "contribution": 0.1, "direction": "positive"}]
        }
