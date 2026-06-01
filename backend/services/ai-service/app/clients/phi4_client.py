import httpx
from app.config import settings

PHI4_TIMEOUT = 45.0  # GPU-backed but ngrok adds latency


async def phi4_generate(prompt: str) -> str | None:
    if not settings.phi4_base_url:
        return None
    try:
        async with httpx.AsyncClient(timeout=PHI4_TIMEOUT) as client:
            resp = await client.post(
                f"{settings.phi4_base_url}/generate/text",
                data={"prompt": prompt, "max_new_tokens": "2048", "json_mode": "true"},
            )
            if not resp.is_success:
                return None
            return resp.json().get("response")
    except Exception:
        return None


async def is_phi4_reachable() -> bool:
    if not settings.phi4_base_url:
        return False
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(f"{settings.phi4_base_url}/health")
            return resp.is_success
    except Exception:
        return False
