import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.config.database import engine, Base, SessionLocal
from app.api.routers import auth, alerts, users, events, reports, analytics
from app.database.seed import seed_database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SENTINEL")

# ─── FastAPI Bootstrap ────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Smart Emergency Network for Threat Intelligence & Live-monitoring (SENTINEL) Backend",
)

# ─── CORS Middleware ──────────────────────────────────────────────────────────
# Allows the React frontend to communicate with this REST API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Table Creation & Seeding ─────────────────────────────────────────────────
@app.on_event("startup")
def startup_event():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Run seeder if database is empty
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        logger.error(f"Error during database seeding: {e}", exc_info=True)
    finally:
        db.close()

app.include_router(auth.router)
app.include_router(alerts.router)
app.include_router(users.router)
app.include_router(events.router)
app.include_router(reports.router)
app.include_router(analytics.router)


# ─── WebSockets Ingestion Stream ──────────────────────────────────────────────
from fastapi import WebSocket, WebSocketDisconnect
from app.services.websocket_manager import ws_manager

@app.websocket("/ws/events")
async def websocket_events_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, listen for ping/pong signals
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket client connection error: {e}")
        ws_manager.disconnect(websocket)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }
