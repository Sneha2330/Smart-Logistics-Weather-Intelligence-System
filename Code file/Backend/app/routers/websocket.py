from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()
clients = []


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    clients.append(ws)

    try:
        while True:
            data = await ws.receive_text()
            await ws.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        if ws in clients:
            clients.remove(ws)
    except Exception:
        if ws in clients:
            clients.remove(ws)
