import asyncio
import logging
from fastapi import WebSocket
from typing import List

logger = logging.getLogger("SENTINEL")

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.loop = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.loop = asyncio.get_running_loop()
        logger.info(f"WebSocket client connected. Active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active: {len(self.active_connections)}")

    def broadcast(self, message: dict):
        """Broadcasts a JSON payload to all connected clients thread-safely."""
        if not self.active_connections:
            return
            
        async def send_to_client(ws: WebSocket, msg: dict):
            try:
                await ws.send_json(msg)
            except Exception:
                # Connection might be closed, we will clean it up on next disconnect
                pass

        if self.loop and self.loop.is_running():
            for connection in list(self.active_connections):
                asyncio.run_coroutine_threadsafe(send_to_client(connection, message), self.loop)
        else:
            try:
                loop = asyncio.get_event_loop()
                for connection in list(self.active_connections):
                    loop.create_task(send_to_client(connection, message))
            except Exception as e:
                logger.warning(f"Could not broadcast message via event loop: {e}")

ws_manager = WebSocketManager()
