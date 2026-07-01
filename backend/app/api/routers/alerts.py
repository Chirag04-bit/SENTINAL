# ─── SENTINEL Alerts Router ───────────────────────────────────────────────────
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.schemas.alert import AlertResponse, AlertListResponse
from app.schemas.common import SuccessResponse
from app.services import alert_service
from app.middleware.auth_middleware import get_current_user, require_admin

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/", response_model=AlertListResponse, summary="Get All Alerts (Admin)")
def get_all_alerts(
    severity: Optional[str] = Query(None, description="Filter: low|medium|high|critical"),
    status:   Optional[str] = Query(None, description="Filter: open|resolved|dismissed"),
    type:     Optional[str] = Query(None, description="Filter: fraud|intrusion|login|transaction"),
    page:     int           = Query(1, ge=1),
    limit:    int           = Query(20, ge=1, le=100),
    db:       Session       = Depends(get_db),
    _:        User          = Depends(require_admin),
):
    """**GET /alerts** — Admin-only. Returns paginated, filterable alert list."""
    result = alert_service.get_alerts(db, severity, status, type, page=page, limit=limit)
    return AlertListResponse(**result)


@router.get("/my", response_model=AlertListResponse, summary="Get My Alerts")
def get_my_alerts(
    page:  int     = Query(1, ge=1),
    limit: int     = Query(20, ge=1, le=100),
    db:    Session = Depends(get_db),
    user:  User    = Depends(get_current_user),
):
    """**GET /alerts/my** — Returns alerts for the authenticated user only."""
    result = alert_service.get_alerts(db, user_id=user.id, page=page, limit=limit)
    return AlertListResponse(**result)


@router.get("/{alert_id}", response_model=AlertResponse, summary="Get Alert Detail")
def get_alert(
    alert_id: str,
    db:       Session = Depends(get_db),
    _:        User    = Depends(get_current_user),
):
    """**GET /alerts/{id}** — Full alert detail with XAI explanation."""
    from app.models.alert import Alert
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    from app.services.alert_service import _to_response
    return _to_response(alert, db)


@router.patch("/{alert_id}/resolve", response_model=SuccessResponse, summary="Resolve Alert")
def resolve_alert(
    alert_id: str,
    db:       Session = Depends(get_db),
    user:     User    = Depends(require_admin),
):
    """**PATCH /alerts/{id}/resolve** — Admin only. Mark alert as resolved."""
    alert = alert_service.resolve_alert(db, alert_id, user.id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    return SuccessResponse(message=f"Alert {alert_id} resolved successfully.")


@router.patch("/{alert_id}/dismiss", response_model=SuccessResponse, summary="Dismiss Alert")
def dismiss_alert(
    alert_id: str,
    db:       Session = Depends(get_db),
    _:        User    = Depends(get_current_user),
):
    """**PATCH /alerts/{id}/dismiss** — Mark alert as dismissed."""
    alert = alert_service.dismiss_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    return SuccessResponse(message=f"Alert {alert_id} dismissed.")
