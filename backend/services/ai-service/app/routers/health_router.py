from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.circuit_breaker import get_circuit_state
from app.clients.gemini_client import is_gemini_configured
from app.clients.ollama_client import is_ollama_reachable
from app.clients.phi4_client import is_phi4_reachable
from app.config import settings
from app.redis_client import get_redis

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health():
    r = get_redis()
    try:
        redis_ok = (await r.ping()) == "PONG"
    except Exception:
        redis_ok = False

    phi4_ok, ollama_ok, phi4_cb, ollama_cb = (
        await is_phi4_reachable(),
        await is_ollama_reachable(),
        await get_circuit_state("phi4"),
        await get_circuit_state("ollama"),
    )

    status = "ok" if redis_ok else "degraded"
    return JSONResponse(
        status_code=200 if redis_ok else 503,
        content={
            "status": status,
            "redis": "connected" if redis_ok else "disconnected",
            "providers": {
                "phi4": {
                    "configured": bool(settings.phi4_base_url),
                    "reachable": phi4_ok,
                    "circuit": phi4_cb,
                },
                "ollama": {
                    "configured": True,
                    "reachable": ollama_ok,
                    "circuit": ollama_cb,
                },
                "gemini": {
                    "configured": is_gemini_configured(),
                },
            },
        },
    )
