from app.redis_client import get_redis

FAILURE_THRESHOLD = 5
COOLDOWN_TTL_S = 300  # 5 minutes


def _cb_key(provider: str) -> str:
    return f"cb:{provider}:failures"


def _cb_open_key(provider: str) -> str:
    return f"cb:{provider}:open"


async def is_circuit_open(provider: str = "ollama") -> bool:
    r = get_redis()
    return await r.exists(_cb_open_key(provider)) == 1


async def record_success(provider: str = "ollama") -> None:
    r = get_redis()
    await r.delete(_cb_key(provider))


async def record_failure(provider: str = "ollama") -> None:
    r = get_redis()
    failures = await r.incr(_cb_key(provider))
    if failures == 1:
        await r.expire(_cb_key(provider), COOLDOWN_TTL_S * 2)
    if failures >= FAILURE_THRESHOLD:
        await r.setex(_cb_open_key(provider), COOLDOWN_TTL_S, "1")
        await r.delete(_cb_key(provider))


async def get_circuit_state(provider: str = "ollama") -> dict:
    r = get_redis()
    is_open = await r.exists(_cb_open_key(provider)) == 1
    failures_raw = await r.get(_cb_key(provider))
    cooldown_ttl = await r.ttl(_cb_open_key(provider)) if is_open else None
    return {
        "open": is_open,
        "failures": int(failures_raw) if failures_raw else 0,
        "cooldown_ttl": cooldown_ttl,
    }
