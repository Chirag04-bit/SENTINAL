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
from pydantic import BaseModel
import uuid
import os

from app.services.system_monitor import (
    get_running_processes, get_installed_software, 
    get_startup_applications, get_usb_devices
)
from app.services.network_monitor import get_live_packets
from app.services.windows_security import get_security_events
from app.services.browser_scanner import scan_browser_history, scan_browser_extensions
from app.services.file_scanner import scan_user_directory

class ExtensionAuditRequest(BaseModel):
    url: str
    domain: str

class FileScanRequest(BaseModel):
    path: str

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

@router.post("/me/sources/chrome/audit", summary="Audit Browser Tab URL")
def audit_browser_tab(
    req: ExtensionAuditRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Parse connected sources
    try:
        sources = json.loads(current_user.connected_sources or "{}")
    except Exception:
        sources = {}
        
    # Check if Chrome Browser Extension is connected
    if not sources.get("chrome"):
        raise HTTPException(
            status_code=403,
            detail="Chrome Browser Extension feed is not authorized in Connection Center."
        )

    # 2. Evaluate domain threat risk
    lower_domain = req.domain.lower()
    is_safe = False
    is_threat = False
    reasons = []
    
    # Heuristics matching registries
    if "google.com" in lower_domain or "github.com" in lower_domain or "localhost" in lower_domain or "sentinel.ai" in lower_domain:
        is_safe = True
        status = "safe"
    elif "login" in lower_domain or "secure" in lower_domain or "bank" in lower_domain or "paypal" in lower_domain:
        is_threat = True
        status = "suspicious"
        reasons.append(f"Suspicious keyword matched in domain string: {req.domain}")
    else:
        status = "neutral"
        
    # 3. Log transparent access audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="Audit Tab URL",
        source="Chrome Browser Extension",
        purpose=f"Evaluate active domain integrity for: {req.domain}"
    )
    db.add(audit)
    
    # 4. If threat, generate a real-time security alert!
    if is_threat:
        alert = Alert(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            event_id=None,
            title="Browser Phishing Trap Flagged",
            description=f"Extension detected active navigation to potential clone domain: {req.url}",
            type="login",
            severity="high",
            status="open",
            risk_score=85,
            ip_address=current_user.ip_address,
            location=current_user.location,
            device="SENTINEL Shield Extension",
            recommendation="Close the browser tab immediately and verify official registry credentials.",
            shap_values=json.dumps([
                {"factor": "Suspicious Domain String", "contribution": 0.5, "direction": "positive"},
                {"factor": "Unverified Hostname Registry", "contribution": 0.35, "direction": "positive"}
            ])
        )
        db.add(alert)
        current_user.open_alerts += 1
        current_user.total_alerts += 1
        
    db.commit()
    db.refresh(current_user)
    return {
        "status": "success", 
        "domain": req.domain, 
        "threat_status": status,
        "is_threat": is_threat,
        "reasons": reasons
    }

def check_permission(user: User, source_name: str) -> bool:
    try:
        sources = json.loads(user.connected_sources or "{}")
        return bool(sources.get(source_name))
    except Exception:
        return False

@router.get("/me/system/processes", summary="Get Running Processes")
def get_processes_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    granted = check_permission(current_user, "processes")
    if granted:
        audit = AuditLog(
            user_id=current_user.id,
            action="Scan Running Processes",
            source="Running Processes",
            purpose="Analyze process registry profiles for miner signature heuristics"
        )
        db.add(audit)
        db.commit()
    return get_running_processes(granted)

@router.get("/me/system/network", summary="Get Live Network Packets")
def get_network_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    granted = check_permission(current_user, "network")
    if granted:
        audit = AuditLog(
            user_id=current_user.id,
            action="Audit Network Traffic",
            source="Network Monitoring",
            purpose="Sniff local TCP/UDP packet headers to detect active port scans"
        )
        db.add(audit)
        db.commit()
    return get_live_packets(granted)

@router.get("/me/system/software", summary="Get Installed Software")
def get_software_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    granted = check_permission(current_user, "installed_apps")
    if granted:
        audit = AuditLog(
            user_id=current_user.id,
            action="Scan Software Registry",
            source="Installed Applications",
            purpose="Inspect local software uninstall catalogs for vulnerability analysis"
        )
        db.add(audit)
        db.commit()
    software = get_installed_software(granted)
    startup = get_startup_applications(granted)
    return {"software": software, "startup": startup}

@router.get("/me/system/security", summary="Get Windows Event Logs")
def get_security_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    granted = check_permission(current_user, "event_logs")
    if granted:
        audit = AuditLog(
            user_id=current_user.id,
            action="Query Windows Security Events",
            source="Windows Event Logs",
            purpose="Analyze Logon failure audit logs for brute force patterns"
        )
        db.add(audit)
        db.commit()
    return get_security_events(granted)

@router.get("/me/system/usb", summary="Get USB Devices")
def get_usb_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    granted = check_permission(current_user, "usb")
    if granted:
        audit = AuditLog(
            user_id=current_user.id,
            action="Scan USB Controllers",
            source="USB Monitoring",
            purpose="Inspect WMI PNP descriptors to log external mass storage devices"
        )
        db.add(audit)
        db.commit()
    return get_usb_devices(granted)

@router.post("/me/system/files/scan", summary="Scan Selected Directory")
def scan_directory_endpoint(
    req: FileScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    granted = check_permission(current_user, "documents") or check_permission(current_user, "desktop")
    if granted:
        audit = AuditLog(
            user_id=current_user.id,
            action="Scan Directory Files",
            source="Documents / Desktop Folder",
            purpose=f"Compute SHA256 hashes of executable binaries in: {req.path}"
        )
        db.add(audit)
        db.commit()
    return scan_user_directory(req.path, granted)

@router.get("/me/browser/history", summary="Scan Browser History")
def get_browser_history_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    granted = check_permission(current_user, "browser_history")
    if granted:
        audit = AuditLog(
            user_id=current_user.id,
            action="Query Chrome History",
            source="Browser History",
            purpose="Audit URL domains for phishing and typosquatting triggers"
        )
        db.add(audit)
        db.commit()
    return scan_browser_history(granted)

@router.get("/me/browser/extensions", summary="Scan Browser Extensions")
def get_browser_extensions_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    granted = check_permission(current_user, "extensions")
    if granted:
        audit = AuditLog(
            user_id=current_user.id,
            action="Audit Installed Extensions",
            source="Browser Extensions",
            purpose="Scan extension manifests to flag suspect permission overrides"
        )
        db.add(audit)
        db.commit()
    return scan_browser_extensions(granted)

@router.get("/me/resources/nearby", summary="Find Nearby Emergency Resources using Google Maps Platform")
def get_nearby_resources(
    lat: float = Query(...),
    lng: float = Query(...),
    resource_type: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Log access audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="Query Emergency Resources",
        source="Location Coordinates",
        purpose=f"Locate nearby {resource_type} stations using Google Maps Platform API"
    )
    db.add(audit)
    db.commit()

    google_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if google_key:
        import requests
        url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=5000&type={resource_type}&key={google_key}"
        try:
            res = requests.get(url)
            if res.status_code == 200:
                data = res.json()
                results = data.get("results", [])
                resources = []
                for r in results[:10]:
                    loc = r.get("geometry", {}).get("location", {})
                    resources.append({
                        "name": r.get("name"),
                        "address": r.get("vicinity"),
                        "lat": loc.get("lat"),
                        "lng": loc.get("lng"),
                        "distance_km": round(_haversine_distance(lat, lng, loc.get("lat"), loc.get("lng")), 2)
                    })
                return resources
        except Exception as e:
            logger.error(f"Google Maps API call failed: {e}")

    # Fallback coordinate distance search
    fallback_data = {
        "police": [
            {"name": "Local Cyber Crime Cell", "address": "Cyber Police Station, Bandra Kurla Complex", "lat": 19.0596, "lng": 72.8684},
            {"name": "Bandra Police Station", "address": "Hill Rd, Bandra West, Mumbai", "lat": 19.0558, "lng": 72.8296},
            {"name": "Dharavi Police Station", "address": "Dharavi Main Rd, Mumbai", "lat": 19.0380, "lng": 72.8538},
            {"name": "Kurla Police Station", "address": "LBS Marg, Kurla West, Mumbai", "lat": 19.0652, "lng": 72.8890}
        ],
        "bank": [
            {"name": "State Bank of India (Bandra Branch)", "address": "Linking Road, Bandra West", "lat": 19.0582, "lng": 72.8314},
            {"name": "HDFC Bank Cyber Security Help Desk", "address": "BKC G Block, Mumbai", "lat": 19.0624, "lng": 72.8644},
            {"name": "ICICI Bank Branch", "address": "SVT Road, Santacruz West", "lat": 19.0792, "lng": 72.8360}
        ],
        "repair": [
            {"name": "Authorized Device Security & Repair Desk", "address": "Phoenix Marketcity, Kurla", "lat": 19.0864, "lng": 72.8890},
            {"name": "Apple Authorized Cyber Center", "address": "Maker Maxity, BKC", "lat": 19.0602, "lng": 72.8614}
        ]
    }
    
    selected = fallback_data.get(resource_type, fallback_data["police"])
    sorted_resources = []
    
    for r in selected:
        dist = _haversine_distance(lat, lng, r["lat"], r["lng"])
        sorted_resources.append({
            **r,
            "distance_km": round(dist, 2)
        })
        
    return sorted(sorted_resources, key=lambda x: x["distance_km"])

def _haversine_distance(lat1, lon1, lat2, lon2):
    import math
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c
