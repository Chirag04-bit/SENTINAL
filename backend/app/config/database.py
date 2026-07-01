# ─── SENTINEL Database Configuration ─────────────────────────────────────────
# SQLAlchemy engine, session factory, and base model.
#
# Why SQLAlchemy ORM?
#   - No raw SQL in business logic (Part 5 requirement)
#   - Type-safe queries
#   - Easy swap from SQLite → PostgreSQL by changing DATABASE_URL
#   - Automatic migration support via Alembic
#
# Session Pattern:
#   Each HTTP request gets its own database session.
#   The session is closed after the request completes.
#   This prevents connection leaks and ensures data consistency.

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .settings import settings


# ─── Engine ───────────────────────────────────────────────────────────────────
# check_same_thread=False is required for SQLite with FastAPI's async nature.
# For PostgreSQL, remove connect_args entirely.
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite only
    echo=settings.DEBUG,      # Log all SQL statements in development
)

# Enable WAL mode for SQLite — better concurrent read performance
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, _):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")   # Enforce FK constraints
    cursor.close()


# ─── Session Factory ──────────────────────────────────────────────────────────
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,   # We control transactions explicitly
    autoflush=False,    # Prevent auto-flush before queries
)


# ─── Base Model ───────────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """
    All SQLAlchemy ORM models inherit from this base.
    Enables table auto-creation via Base.metadata.create_all(engine).
    """
    pass


# ─── Dependency ───────────────────────────────────────────────────────────────
def get_db():
    """
    FastAPI dependency that provides a database session per request.

    Usage in a router:
        @router.get("/items")
        def get_items(db: Session = Depends(get_db)):
            ...

    The 'finally' block ensures the session is always closed,
    even if an exception occurs during the request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
