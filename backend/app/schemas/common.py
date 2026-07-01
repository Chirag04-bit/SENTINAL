# ─── SENTINEL Event & Report & Common Schemas ─────────────────────────────────
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any


# ─── Event Schemas ────────────────────────────────────────────────────────────

class EventCreate(BaseModel):
    """POST /events — ingest a new event."""
    type:       str
    ip_address: Optional[str]   = None
    location:   Optional[str]   = None
    device:     Optional[str]   = None
    amount:     Optional[float] = None
    merchant:   Optional[str]   = None
    user_agent: Optional[str]   = None


class EventResponse(BaseModel):
    """Single event returned from the API."""
    id:          str
    user_id:     str
    type:        str
    ip_address:  Optional[str]   = None
    location:    Optional[str]   = None
    device:      Optional[str]   = None
    amount:      Optional[float] = None
    risk_score:  int
    risk_level:  str
    is_anomaly:  bool
    timestamp:   datetime

    model_config = {"from_attributes": True}


class EventListResponse(BaseModel):
    """Paginated event list."""
    data:  list[EventResponse]
    total: int
    page:  int
    pages: int


# ─── Report Schemas ───────────────────────────────────────────────────────────

class GenerateReportRequest(BaseModel):
    """POST /reports/generate."""
    type:      str   # "daily" | "weekly" | "monthly" | "custom"
    date_from: str
    date_to:   str
    format:    str = "csv"  # "csv" | "pdf"


class ReportResponse(BaseModel):
    """Single report metadata."""
    id:              str
    title:           str
    type:            str
    date_from:       str
    date_to:         str
    generated_at:    datetime
    generated_by:    str
    format:          str
    total_alerts:    int
    critical_alerts: int
    summary:         Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Common Schemas ───────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    """Standard error response shape."""
    detail:  str
    status:  int
    path:    Optional[str] = None


class SuccessResponse(BaseModel):
    """Simple success acknowledgement."""
    message: str
    data:    Optional[Any] = None


class AnalyticsSummary(BaseModel):
    """GET /analytics/summary — dashboard KPI cards."""
    total_users:     int
    total_alerts:    int
    open_alerts:     int
    critical_alerts: int
    events_today:    int
    avg_risk_score:  float
    events_per_min:  int
    model_accuracy:  float
