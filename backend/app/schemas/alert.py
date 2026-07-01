# ─── SENTINEL Alert Schemas ───────────────────────────────────────────────────
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ShapFactor(BaseModel):
    """A single XAI explanation factor."""
    factor:       str    # e.g. "Unusual login location"
    contribution: float  # 0.0 – 1.0 (how much this factor contributes)
    direction:    str    # "positive" (increases risk) | "negative" (decreases risk)


class AlertResponse(BaseModel):
    """Full alert detail — returned by GET /alerts and GET /alerts/{id}."""
    id:             str
    user_id:        str
    user_name:      str             = ""
    event_id:       Optional[str]   = None
    title:          str
    description:    Optional[str]   = None
    type:           str
    severity:       str
    status:         str
    risk_score:     int
    ip_address:     Optional[str]   = None
    location:       Optional[str]   = None
    device:         Optional[str]   = None
    shap_values:    list[ShapFactor] = []
    recommendation: Optional[str]   = None
    created_at:     datetime
    resolved_at:    Optional[datetime] = None

    model_config = {"from_attributes": True}


class AlertUpdate(BaseModel):
    """PATCH /alerts/{id} — status update payload."""
    status: str  # "resolved" | "dismissed"


class AlertListResponse(BaseModel):
    """Paginated alert list."""
    data:     list[AlertResponse]
    total:    int
    page:     int
    pages:    int
    open:     int
    critical: int
