import hashlib
import json
from typing import TypeVar, Any

from app.redis_client import get_redis

T = TypeVar("T")

QUIZ_TTL = 7 * 86_400         # 7 days
EXPLANATION_TTL = 86_400       # 24 hours
MICRO_QUIZ_TTL = 86_400        # 24 hours
REMEDIAL_QUIZ_TTL = 2 * 3_600  # 2 hours


def quiz_key(node_id: str, adapted_difficulty: int | None = None, familiarity: str | None = None) -> str:
    if adapted_difficulty is not None:
        return f"quiz:ai:{node_id}:d{adapted_difficulty}:{familiarity or 'default'}"
    return f"quiz:ai:{node_id}"


def remedial_quiz_key(node_id: str, weak_areas: list[str]) -> str:
    digest = hashlib.md5(",".join(sorted(weak_areas)).encode()).hexdigest()[:8]
    return f"quiz:remedial:{node_id}:{digest}"


def explanation_key(node_id: str, familiarity: str | None = None) -> str:
    return f"explanation:{node_id}:{familiarity or 'default'}"


def micro_quiz_key(node_id: str) -> str:
    return f"micro-quiz:ai:{node_id}"


async def get_cached(key: str) -> Any | None:
    r = get_redis()
    raw = await r.get(key)
    if not raw:
        return None
    try:
        return json.loads(raw)
    except Exception:
        return None


async def set_cache(key: str, value: Any, ttl: int) -> None:
    r = get_redis()
    await r.setex(key, ttl, json.dumps(value))


async def invalidate_remedial_cache(node_id: str) -> int:
    r = get_redis()
    pattern = f"quiz:remedial:{node_id}:*"
    keys = await r.keys(pattern)
    if not keys:
        return 0
    await r.delete(*keys)
    return len(keys)
