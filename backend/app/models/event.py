# ─── SENTINEL Event Model ─────────────────────────────────────────────────────
# Stores every raw activity captured (login, transaction, network event).
# This is the raw input — the ML model reads from this table.

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Integer, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.config.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Event(Base):
    """
    Raw activity events ingested by SENTINEL.
    
    Each event is scored by the Risk Engine (Phase 5) or ML model (Phase 6).
    High-scoring events generate Alert records.
    
    Relationships:
        - Belongs to one User
        - May generate one Alert
    """
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )

    # ── Ownership ─────────────────────────────────────────────────────────────
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # ── Event Classification ───────────────────────────────────────────────────
    type:         Mapped[str] = mapped_column(String(50), nullable=False)
    # Values: "fraud" | "intrusion" | "login" | "transaction" | "system"

    # ── Network Details ───────────────────────────────────────────────────────
    ip_address:   Mapped[str | None] = mapped_column(String(50))
    location:     Mapped[str | None] = mapped_column(String(100))
    device:       Mapped[str | None] = mapped_column(String(150))
    user_agent:   Mapped[str | None] = mapped_column(String(255))

    # ── Financial Details (for transaction events) ─────────────────────────────
    amount:       Mapped[float | None] = mapped_column(Float)
    merchant:     Mapped[str | None]   = mapped_column(String(100))

    # ── Risk Assessment ───────────────────────────────────────────────────────
    risk_score:   Mapped[int]  = mapped_column(Integer, default=0)
    risk_level:   Mapped[str]  = mapped_column(String(20), default="low")
    is_anomaly:   Mapped[bool] = mapped_column(Boolean, default=False)

    # ── Raw Features (for ML model in Phase 6) ───────────────────────────────
    # Stored as JSON string — the ML model reads this to make predictions
    raw_features: Mapped[str | None] = mapped_column(Text)  # JSON

    # ── Timestamp ─────────────────────────────────────────────────────────────
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, index=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    user:  Mapped["User"]          = relationship("User",  back_populates="events")   # type: ignore[name-defined]
    alert: Mapped["Alert | None"]  = relationship("Alert", back_populates="event", uselist=False)  # type: ignore[name-defined]

    def __repr__(self) -> str:
        return f"<Event id={self.id!r} type={self.type!r} risk={self.risk_score}>"
