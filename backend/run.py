# ─── SENTINEL Uvicorn Launcher ────────────────────────────────────────────────
# Run: python run.py
#
# Launches the Uvicorn ASGI server with standard settings.
# Automatically loads the .env file if present.

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

if __name__ == "__main__":
    # Get port from environment or default to 8000
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    # Reload server on file changes if in development mode
    is_dev = os.getenv("ENVIRONMENT", "development").lower() == "development"
    
    print(f"🚀 Starting SENTINEL Backend on http://{host}:{port}")
    print(f"Swagger API Docs: http://{host}:{port}/docs")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=is_dev,
        workers=1
    )
