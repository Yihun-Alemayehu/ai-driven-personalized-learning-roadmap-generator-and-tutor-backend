import json
from collections.abc import AsyncIterator

import httpx

from app.config import settings

OLLAMA_TIMEOUT = 120.0  # 3B model on CPU can take 30–90 s


async def ollama_generate(prompt: str) -> str | None:
    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
            resp = await client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "format": "json",
                    "stream": False,
                    "options": {"temperature": 0.3, "num_predict": 2048},
                },
            )
            if not resp.is_success:
                return None
            return resp.json().get("response")
    except Exception:
        return None


async def ollama_stream(prompt: str) -> AsyncIterator[str]:
    """Yield text tokens from Ollama's NDJSON stream (plain text, no JSON format)."""
    async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
        async with client.stream(
            "POST",
            f"{settings.ollama_base_url}/api/generate",
            json={
                "model": settings.ollama_model,
                "prompt": prompt,
                "stream": True,
                "options": {"temperature": 0.4, "num_predict": 2048},
            },
        ) as resp:
            resp.raise_for_status()
            buffer = ""
            async for raw_chunk in resp.aiter_bytes():
                buffer += raw_chunk.decode("utf-8", errors="replace")
                lines = buffer.split("\n")
                buffer = lines.pop()  # keep incomplete trailing line
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        chunk = json.loads(line)
                        if chunk.get("response"):
                            yield chunk["response"]
                        if chunk.get("done"):
                            return
                    except json.JSONDecodeError:
                        pass


async def is_ollama_reachable() -> bool:
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.ollama_base_url}/api/tags")
            return resp.is_success
    except Exception:
        return False
