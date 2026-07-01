# ─── SENTINEL Alert Service ───────────────────────────────────────────────────
# All alert CRUD operations. Routers call these — never query DB directly.

import json
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.alert import Alert
from app.models.user import User
from app.schemas.alert import AlertResponse, ShapFactor
from app.services.risk_service import factors_from_json


def _to_response(alert: Alert, db: Session) -> AlertResponse:
    """Convert an ORM Alert to an AlertResponse schema."""
    user = db.query(User).filter(User.id == alert.user_id).first()
    shap_raw = factors_from_json(alert.shap_values)
    shap = [ShapFactor(**f) for f in shap_raw]
    return AlertResponse(
        id=alert.id,
        user_id=alert.user_id,
        user_name=user.name if user else "Unknown",
        event_id=alert.event_id,
        title=alert.title,
        description=alert.description,
        type=alert.type,
        severity=alert.severity,
        status=alert.status,
        risk_score=alert.risk_score,
        ip_address=alert.ip_address,
        location=alert.location,
        device=alert.device,
        shap_values=shap,
        recommendation=alert.recommendation,
        created_at=alert.created_at,
        resolved_at=alert.resolved_at,
    )


def get_alerts(
    db: Session,
    severity: Optional[str] = None,
    status:   Optional[str] = None,
    type_:    Optional[str] = None,
    user_id:  Optional[str] = None,
    page:     int = 1,
    limit:    int = 20,
) -> dict:
    """Paginated, filtered alert list."""
    q = db.query(Alert)
    if severity: q = q.filter(Alert.severity == severity)
    if status:   q = q.filter(Alert.status == status)
    if type_:    q = q.filter(Alert.type == type_)
    if user_id:  q = q.filter(Alert.user_id == user_id)

    total     = q.count()
    open_c    = db.query(func.count(Alert.id)).filter(Alert.status == "open").scalar()
    critical  = db.query(func.count(Alert.id)).filter(Alert.severity == "critical").scalar()
    alerts    = q.order_by(Alert.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return {
        "data":     [_to_response(a, db) for a in alerts],
        "total":    total,
        "page":     page,
        "pages":    max(1, -(-total // limit)),
        "open":     open_c or 0,
        "critical": critical or 0,
    }


def create_alert(
    db:         Session,
    user_id:    str,
    event_id:   Optional[str],
    title:      str,
    description: str,
    type_:      str,
    severity:   str,
    risk_score: int,
    ip_address: Optional[str],
    location:   Optional[str],
    device:     Optional[str],
    shap_factors: list[dict],
    recommendation: str,
) -> Alert:
    """Create and persist a new alert. Updates user alert counters."""
    alert = Alert(
        user_id=user_id, event_id=event_id, title=title,
        description=description, type=type_, severity=severity,
        status="open", risk_score=risk_score,
        ip_address=ip_address, location=location, device=device,
        shap_values=json.dumps(shap_factors),
        recommendation=recommendation,
    )
    db.add(alert)
    # Update user alert counters
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.total_alerts += 1
        user.open_alerts  += 1
        user.risk_score    = risk_score
        user.risk_level    = severity
    db.commit()
    db.refresh(alert)
    return alert


def resolve_alert(db: Session, alert_id: str, resolver_id: str) -> Optional[Alert]:
    """Mark an alert as resolved."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert: return None
    alert.status      = "resolved"
    alert.resolved_at = datetime.now(timezone.utc)
    alert.resolved_by = resolver_id
    user = db.query(User).filter(User.id == alert.user_id).first()
    if user and user.open_alerts > 0:
        user.open_alerts -= 1
    db.commit()
    db.refresh(alert)
    return alert


def dismiss_alert(db: Session, alert_id: str) -> Optional[Alert]:
    """Mark an alert as dismissed."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert: return None
    alert.status = "dismissed"
    user = db.query(User).filter(User.id == alert.user_id).first()
    if user and user.open_alerts > 0:
        user.open_alerts -= 1
    db.commit()
    db.refresh(alert)
    return alert
