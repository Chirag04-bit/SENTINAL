# ─── SENTINEL Risk Score Engine v1 (Rule-Based) ───────────────────────────────
# Calculates a risk score (0–100) for an incoming event using explicit rules.
#
# WHY rule-based first?
#   The ML model (Phase 6) needs training data to work.
#   This engine provides real risk scores immediately, before ML is ready.
#   Phase 6 will replace this engine with XGBoost + SHAP predictions.
#
# The rules are based on known cybersecurity indicators of compromise (IOCs):
#   - Location anomalies
#   - Time-of-day patterns
#   - Transaction amount outliers
#   - Device recognition
#   - Failed login velocity
#
# Phase 6 replacement: 
#   from app.services.ml_service import predict_risk
#   score, shap_values = predict_risk(event_features)

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from app.config.settings import settings
from app.services.ml_service import ml_service


@dataclass
class RiskResult:
    """Output of the risk engine for a single event."""
    score:       int                        # 0–100
    level:       str                        # low | medium | high | critical
    is_anomaly:  bool                       # True if score > 60
    factors:     list[dict]                 # XAI explanation factors
    recommendation: str                    # Actionable advice


def calculate_risk(
    event_type:    str,
    ip_address:    str  | None = None,
    location:      str  | None = None,
    device:        str  | None = None,
    amount:        float| None = None,
    user_avg_amount: float = 0.0,
    user_usual_locations: list[str] | None = None,
    hour_of_day:   int  | None = None,
    failed_logins_last_hour: int = 0,
    raw_features:           dict | None = None,
) -> RiskResult:
    """
    Rule-based risk scoring engine.

    Each rule adds points to a base score of 0.
    The final score is capped at 100.
    Every contributing rule is logged as a SHAP factor for XAI display.

    Args:
        event_type:             Type of event (fraud/intrusion/login/transaction)
        ip_address:             Source IP address
        location:               Geographic location of the event
        device:                 Device identifier
        amount:                 Transaction amount (for financial events)
        user_avg_amount:        User's historical average transaction amount
        user_usual_locations:   List of locations the user normally accesses from
        hour_of_day:            Hour of the event (0–23)
        failed_logins_last_hour: Number of failed logins in the past hour
        raw_features:           Raw payload features from the ingestion stream

    Returns:
        RiskResult with score, level, anomaly flag, XAI factors, and recommendation
    """
    # ── ML Model Integration (Phase 7) ────────────────────────────────────────
    if settings.USE_ML_MODEL and ml_service.models_loaded:
        try:
            if event_type in ("fraud", "transaction"):
                combined_feats = {
                    "ip_address": ip_address, 
                    "location": location, 
                    "device": device,
                    **(raw_features or {})
                }
                ml_score, ml_level, ml_factors, ml_rec = ml_service.predict_fraud(
                    amount=amount or 0.0,
                    raw_features=combined_feats
                )
                return RiskResult(
                    score=ml_score,
                    level=ml_level,
                    is_anomaly=ml_score > 60,
                    factors=ml_factors,
                    recommendation=ml_rec
                )
            elif event_type == "intrusion":
                combined_feats = {
                    "ip_address": ip_address,
                    "location": location,
                    "device": device,
                    "protocol_type": "tcp",
                    "flag": "SF",
                    "service": "http",
                    "src_bytes": 1200,
                    "dst_bytes": 3400,
                    "count": 1,
                    **(raw_features or {})
                }
                ml_score, ml_level, ml_factors, ml_rec = ml_service.predict_intrusion(combined_feats)
                return RiskResult(
                    score=ml_score,
                    level=ml_level,
                    is_anomaly=ml_score > 60,
                    factors=ml_factors,
                    recommendation=ml_rec
                )
        except Exception as e:
            # Fallback to rule-based engine if anything fails
            import logging
            logging.getLogger("SENTINEL").warning(f"ML evaluation failed, falling back to rules: {e}")
            pass

    score   = 0
    factors = []
    usual_locations = user_usual_locations or []

    # ── Rule 1: Unusual location (+30) ───────────────────────────────────────
    if location and usual_locations and location not in usual_locations:
        score += 30
        factors.append({
            "factor":       "Unusual login location",
            "contribution": 0.30,
            "direction":    "positive",
            "detail":       f"Login from {location}, which is not in your usual locations."
        })

    # ── Rule 2: Off-hours access (+25) ────────────────────────────────────────
    # Attacks commonly happen between 1 AM – 5 AM
    h = hour_of_day if hour_of_day is not None else datetime.now(timezone.utc).hour
    if 1 <= h <= 5:
        score += 25
        factors.append({
            "factor":       "Off-hours account access",
            "contribution": 0.25,
            "direction":    "positive",
            "detail":       f"Activity detected at {h:02d}:00 UTC, which is an unusual hour."
        })

    # ── Rule 3: Large transaction amount (+20) ────────────────────────────────
    if amount and user_avg_amount > 0 and amount > user_avg_amount * 3:
        score += 20
        factors.append({
            "factor":       "Abnormally large transaction",
            "contribution": 0.20,
            "direction":    "positive",
            "detail":       f"Amount ₹{amount:,.0f} is {amount/user_avg_amount:.1f}× your average."
        })

    # ── Rule 4: Multiple failed logins (+15) ──────────────────────────────────
    if failed_logins_last_hour >= 3:
        score += 15
        factors.append({
            "factor":       "Multiple failed login attempts",
            "contribution": 0.15,
            "direction":    "positive",
            "detail":       f"{failed_logins_last_hour} failed login attempts in the last hour."
        })

    # ── Rule 5: Unrecognized device (+20) ─────────────────────────────────────
    if device and "unknown" in device.lower():
        score += 20
        factors.append({
            "factor":       "Unrecognized device",
            "contribution": 0.20,
            "direction":    "positive",
            "detail":       "Activity from a device that has never accessed this account before."
        })

    # ── Rule 6: Known malicious IP patterns (+10) ────────────────────────────
    if ip_address and (ip_address.startswith("10.") or ip_address.startswith("192.168.99")):
        # Simplified: In production, check against threat intelligence feeds
        score += 10
        factors.append({
            "factor":       "Suspicious IP address range",
            "contribution": 0.10,
            "direction":    "positive",
            "detail":       f"IP {ip_address} matches known suspicious patterns."
        })

    # ── Rule 7: Intrusion event type base score (+10) ─────────────────────────
    if event_type == "intrusion":
        score += 10
        factors.append({
            "factor":       "Network intrusion attempt",
            "contribution": 0.10,
            "direction":    "positive",
            "detail":       "Event classified as a network intrusion attempt."
        })

    # ── Score normalization ───────────────────────────────────────────────────
    score = min(score, 100)

    # ── Level classification ──────────────────────────────────────────────────
    if score <= 30:
        level = "low"
    elif score <= 60:
        level = "medium"
    elif score <= 80:
        level = "high"
    else:
        level = "critical"

    # ── Recommendation ────────────────────────────────────────────────────────
    recommendations = {
        "low":      "No immediate action required. Monitor for changes.",
        "medium":   "Review this activity. Consider enabling 2FA if not already active.",
        "high":     "Verify this activity immediately. Temporarily restrict account if unrecognized.",
        "critical": "Block this activity immediately. Contact the account holder and initiate incident response.",
    }

    return RiskResult(
        score=score,
        level=level,
        is_anomaly=score > 60,
        factors=factors,
        recommendation=recommendations[level],
    )


def get_risk_level(score: int) -> str:
    """Convert a numeric score to a risk level string."""
    if score <= 30:   return "low"
    if score <= 60:   return "medium"
    if score <= 80:   return "high"
    return "critical"


def factors_to_json(factors: list[dict]) -> str:
    """Serialize SHAP factors to JSON string for DB storage."""
    return json.dumps(factors)


def factors_from_json(json_str: str | None) -> list[dict]:
    """Deserialize SHAP factors from DB JSON string."""
    if not json_str:
        return []
    try:
        return json.loads(json_str)
    except (json.JSONDecodeError, TypeError):
        return []
