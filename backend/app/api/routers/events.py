from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.schemas.common import EventCreate, EventResponse, EventListResponse
from app.services import event_service
from app.middleware.auth_middleware import get_current_user, require_admin

router = APIRouter(prefix="/events", tags=["Events"])

@router.post("/", response_model=EventResponse, summary="Ingest Event", description="Ingests a new raw event, calculates risk score, and triggers alerts if necessary.")
def ingest_new_event(
    request: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    **POST /events**
    Ingests an event for the currently logged-in user.
    """
    # Convert Pydantic model to dict
    event_data = request.model_dump()
    
    # Ingest event using event service
    event, _ = event_service.ingest_event(db, current_user.id, event_data)
    return event

@router.get("/", response_model=EventListResponse, summary="Get All Events (Admin)")
def get_all_events(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """**GET /events** — Admin only. Returns paginated logs of all events."""
    result = event_service.get_events(db, page=page, limit=limit)
    return EventListResponse(
        data=[EventResponse.model_validate(e) for e in result["data"]],
        total=result["total"],
        page=result["page"],
        pages=result["pages"],
    )


# ─── Live Event Simulator Endpoints (Phase 8/Presentation Mode) ───────────────
from app.services.simulator_service import event_simulator

@router.post("/simulator/start", summary="Start Live Event Simulator")
def start_simulator(_: User = Depends(require_admin)):
    event_simulator.start(interval=3.0)
    return {"status": "running", "message": "Simulator started."}

@router.post("/simulator/stop", summary="Stop Live Event Simulator")
def stop_simulator(_: User = Depends(require_admin)):
    event_simulator.stop()
    return {"status": "stopped", "message": "Simulator stopped."}

@router.get("/simulator/status", summary="Get Simulator Status")
def get_simulator_status(_: User = Depends(require_admin)):
    return {
        "is_running": event_simulator.is_running,
        "fraud_data_loaded": event_simulator.fraud_df is not None,
        "kdd_data_loaded": event_simulator.kdd_df is not None
    }
