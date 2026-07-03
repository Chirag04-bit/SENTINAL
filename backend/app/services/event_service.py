# ─── SENTINEL Event Service ───────────────────────────────────────────────────
# Handles event ingestion: store → risk score → alert if high risk.

import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.user import User
from app.services import risk_service, alert_service

ALERT_THRESHOLD = 40  # Events scoring above this generate alerts

ALERT_TITLES = {
    "fraud":       "Potential Card Fraud Detected",
    "intrusion":   "Network Intrusion Attempt",
    "login":       "Suspicious Login Detected",
    "transaction": "Unusual Transaction Pattern",
}


def ingest_event(db: Session, user_id: str, event_data: dict) -> tuple[Event, bool]:
    """
    Core event ingestion pipeline:
        1. Calculate risk score
        2. Store event in DB
        3. Create alert if risk > threshold
        4. Return (event, alert_created)
    """
    user = db.query(User).filter(User.id == user_id).first()

    # Step 1: Calculate risk score
    risk = risk_service.calculate_risk(
        event_type=event_data.get("type", ""),
        ip_address=event_data.get("ip_address"),
        location=event_data.get("location"),
        device=event_data.get("device"),
        amount=event_data.get("amount"),
        user_avg_amount=5000.0,  # Phase 6: compute from user history
        user_usual_locations=[user.location] if user and user.location else [],
    )

    # Step 2: Store event
    event = Event(
        user_id=user_id,
        type=event_data.get("type", "system"),
        ip_address=event_data.get("ip_address"),
        location=event_data.get("location"),
        device=event_data.get("device"),
        user_agent=event_data.get("user_agent"),
        amount=event_data.get("amount"),
        merchant=event_data.get("merchant"),
        risk_score=risk.score,
        risk_level=risk.level,
        is_anomaly=risk.is_anomaly,
        raw_features=json.dumps(event_data),
    )
    db.add(event)
    db.flush()  # Get event.id without full commit

    # Step 3: Create alert if risk score is high enough
    alert_created = False
    if risk.score >= ALERT_THRESHOLD:
        event_type = event_data.get("type", "system")
        alert_service.create_alert(
            db=db,
            user_id=user_id,
            event_id=event.id,
            title=ALERT_TITLES.get(event_type, "Suspicious Activity Detected"),
            description=f"Risk score {risk.score}/100 detected. {risk.recommendation}",
            type_=event_type,
            severity=risk.level,
            risk_score=risk.score,
            ip_address=event_data.get("ip_address"),
            location=event_data.get("location"),
            device=event_data.get("device"),
            shap_factors=risk.factors,
            recommendation=risk.recommendation,
        )
        alert_created = True

    db.commit()
    db.refresh(event)

    # Broadcast event via WebSocket in real-time
    try:
        from app.services.websocket_manager import ws_manager
        
        event_payload = {
            "id": event.id,
            "user_id": event.user_id,
            "user_name": user.name if user else "System User",
            "type": event.type,
            "ip_address": event.ip_address,
            "location": event.location,
            "device": event.device,
            "amount": float(event.amount) if event.amount is not None else 0.0,
            "risk_score": event.risk_score,
            "risk_level": event.risk_level,
            "is_anomaly": event.is_anomaly,
            "raw_features": event.raw_features,
            "timestamp": event.timestamp.isoformat()
        }
        ws_manager.broadcast({"type": "event", "data": event_payload})
    except Exception as ws_err:
        import logging
        logging.getLogger("SENTINEL").error(f"Failed to broadcast live WebSocket event: {ws_err}")

    return event, alert_created


def get_events(db: Session, page: int = 1, limit: int = 20) -> dict:
    """Paginated event list for admin view."""
    total  = db.query(Event).count()
    events = db.query(Event).order_by(Event.timestamp.desc()).offset((page-1)*limit).limit(limit).all()
    return {"data": events, "total": total, "page": page, "pages": max(1, -(-total // limit))}
