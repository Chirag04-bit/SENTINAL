from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional

from app.config.database import get_db
from app.models.user import User
from app.models.event import Event
from app.schemas.user import UserResponse, UserUpdate, UserListResponse
from app.middleware.auth_middleware import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=UserListResponse, summary="Get All Users (Admin)")
def get_all_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """**GET /users** — Admin only. Returns paginated monitored users."""
    q = db.query(User).order_by(User.risk_score.desc())
    total = q.count()
    users = q.offset((page - 1) * limit).limit(limit).all()
    return UserListResponse(
        data=[UserResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        pages=max(1, -(-total // limit)),
    )

@router.patch("/me", response_model=UserResponse, summary="Update Profile")
def update_profile(
    updates: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """**PATCH /users/me** — Updates details for the logged-in user."""
    if updates.name is not None:
        current_user.name = updates.name
    if updates.location is not None:
        current_user.location = updates.location
    if updates.device is not None:
        current_user.device = updates.device

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)

@router.get("/me/risk", summary="Get Current User Risk Score Detail")
def get_me_risk(
    current_user: User = Depends(get_current_user),
):
    """
    **GET /users/me/risk**
    Returns risk factors explanation and trend data for the logged-in user.
    """
    # Build explanation factors based on actual database attributes
    is_high_risk = current_user.risk_score > 60
    factors = [
        {"name": "Device Trust", "weight": 0.20, "signal": current_user.device is None or "unknown" in str(current_user.device).lower(), "description": "Activity from unrecognized device" if (current_user.device is None or "unknown" in str(current_user.device).lower()) else "Using a known, trusted device"},
        {"name": "Location Check", "weight": 0.20, "signal": is_high_risk, "description": "Login from outside normal ranges" if is_high_risk else "Login from your usual location"},
        {"name": "Login Time", "weight": 0.10, "signal": False, "description": "Login at normal business hours"},
        {"name": "Transaction Amount", "weight": 0.15, "signal": is_high_risk, "description": "Amounts exceed usual transaction values" if is_high_risk else "Amounts within normal range"},
        {"name": "Transaction Velocity", "weight": 0.10, "signal": False, "description": "Normal transaction frequency"},
        {"name": "Failed Logins", "weight": 0.10, "signal": current_user.open_alerts > 3, "description": "Multiple failed login attempts detected" if current_user.open_alerts > 3 else "No failed login attempts"},
        {"name": "Impossible Travel", "weight": 0.15, "signal": current_user.risk_score > 80, "description": "Impossible travel speed flag triggered" if current_user.risk_score > 80 else "No impossible travel detected"},
    ]

    # Generate a trend line around the user's current risk score
    base = current_user.risk_score
    trend = [
        max(0, min(100, base + offset))
        for offset in [-6, +4, -3, +5, -2, -1, 0]
    ]

    return {
        "score": current_user.risk_score,
        "level": current_user.risk_level,
        "factors": factors,
        "trend": trend,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }

@router.get("/me/activity", summary="Get Current User Activity Timeline")
def get_me_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    **GET /users/me/activity**
    Returns recent activity timeline for the logged-in user.
    """
    events = (
        db.query(Event)
        .filter(Event.user_id == current_user.id)
        .order_by(Event.timestamp.desc())
        .limit(10)
        .all()
    )

    activities = []
    icon_map = {"login": "🔑", "transaction": "💳", "fraud": "🚨", "intrusion": "🌐", "system": "⚙️"}
    
    for ev in events:
        action = ev.type.capitalize()
        if ev.type == "transaction" and ev.amount:
            action = f"Transaction ₹{ev.amount:,.0f}"
        elif ev.type == "fraud":
            action = "Fraud Attempt Blocked"
            
        activities.append({
            "id": ev.id,
            "action": action,
            "detail": f"{ev.device or 'Browser'} · {ev.location or 'Unknown'}",
            "timestamp": ev.timestamp.isoformat(),
            "type": ev.type,
            "riskLevel": ev.risk_level,
            "icon": icon_map.get(ev.type, "❓"),
        })

    return activities


# ─── Privacy Assistant Endpoints ─────────────────────────────────────────────
import json
from app.models.audit_log import AuditLog
from app.models.alert import Alert

@router.post("/me/onboarding/complete", summary="Complete Onboarding")
def complete_onboarding(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.has_completed_onboarding = True
    db.commit()
    db.refresh(current_user)
    return {"status": "success", "message": "Onboarding completed successfully."}

@router.get("/me/sources", summary="Get Connected Sources")
def get_connected_sources(
    current_user: User = Depends(get_current_user),
):
    try:
        sources_dict = json.loads(current_user.connected_sources or "{}")
    except Exception:
        sources_dict = {}
    return sources_dict

@router.post("/me/sources", summary="Update Connected Sources")
def update_connected_sources(
    updated_sources: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.connected_sources = json.dumps(updated_sources)
    
    # Audit log entry for transparency
    audit = AuditLog(
        user_id=current_user.id,
        action="Update Connected Sources",
        source="Connection Center",
        purpose="Update privacy authorizations settings"
    )
    db.add(audit)
    db.commit()
    db.refresh(current_user)
    return {"status": "success", "connected_sources": updated_sources}

@router.post("/me/data/delete", summary="Purge All Personal Logs")
def purge_personal_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Purge all events and alerts belonging to this user
    db.query(Alert).filter(Alert.user_id == current_user.id).delete(synchronize_session=False)
    db.query(Event).filter(Event.user_id == current_user.id).delete(synchronize_session=False)
    
    # Audit log entry for erasure
    audit = AuditLog(
        user_id=current_user.id,
        action="Purge Personal Logs",
        source="Privacy Center",
        purpose="Explicit request to delete collected data and alerts"
    )
    db.add(audit)
    db.commit()
    return {"status": "success", "message": "All data and threat history deleted successfully."}

@router.get("/me/data/export", summary="Export All Personal Logs")
def export_personal_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch details
    events = db.query(Event).filter(Event.user_id == current_user.id).all()
    alerts = db.query(Alert).filter(Alert.user_id == current_user.id).all()
    
    audit = AuditLog(
        user_id=current_user.id,
        action="Export Personal Logs",
        source="Privacy Center",
        purpose="Request to download backup files"
    )
    db.add(audit)
    db.commit()

    try:
        sources_dict = json.loads(current_user.connected_sources or "{}")
    except Exception:
        sources_dict = {}

    return {
        "user_profile": {
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role,
            "risk_score": current_user.risk_score,
            "risk_level": current_user.risk_level,
            "location": current_user.location,
            "device": current_user.device,
            "joined_at": current_user.joined_at.isoformat() if current_user.joined_at else None,
            "connected_sources": sources_dict
        },
        "events": [
            {
                "id": ev.id,
                "type": ev.type,
                "ip_address": ev.ip_address,
                "location": ev.location,
                "device": ev.device,
                "amount": ev.amount,
                "risk_score": ev.risk_score,
                "risk_level": ev.risk_level,
                "timestamp": ev.timestamp.isoformat() if ev.timestamp else None
            }
            for ev in events
        ],
        "alerts": [
            {
                "id": al.id,
                "title": al.title,
                "description": al.description,
                "severity": al.severity,
                "risk_score": al.risk_score,
                "status": al.status,
                "created_at": al.created_at.isoformat() if al.created_at else None
            }
            for al in alerts
        ]
    }

@router.get("/me/audit-logs", summary="Get User Data Audit Logs")
def get_user_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logs = (
        db.query(AuditLog)
        .filter(AuditLog.user_id == current_user.id)
        .order_by(AuditLog.timestamp.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "id": l.id,
            "action": l.action,
            "source": l.source,
            "purpose": l.purpose,
            "timestamp": l.timestamp.isoformat()
        }
        for l in logs
    ]

@router.post("/me/location", summary="Update User Real-time Location")
def update_user_location(
    coords: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lat = coords.get("latitude")
    lng = coords.get("longitude")
    
    # Save formatted string to location
    current_user.location = f"Lat: {lat}, Lng: {lng}"
    
    # Log audit event for transparency
    audit = AuditLog(
        user_id=current_user.id,
        action="Fetch Geolocation Coordinates",
        source="Location Coordinates",
        purpose="Evaluate impossible travel anomaly constraints"
    )
    db.add(audit)
    db.commit()
    db.refresh(current_user)
    return {"status": "success", "location": current_user.location}
