from collections.abc import AsyncIterator

import httpx

from app.config import settings

PHI4_TIMEOUT = 90.0  # GPU-backed; streaming endpoint keeps connection alive longer


async def phi4_generate(prompt: str) -> str | None:
    if not settings.phi4_base_url:
        return None
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(
                f"{settings.phi4_base_url}/generate/text",
                data={"prompt": prompt, "max_new_tokens": "2048", "json_mode": "true"},
            )
            if not resp.is_success:
                return None
            return resp.json().get("response")
    except Exception:
        return None


async def phi4_stream(prompt: str) -> AsyncIterator[str]:
    """Stream tokens from the Phi-4 Kaggle endpoint (/generate/text/stream).

    The Kaggle endpoint emits either:
    - Plain text chunks (media_type=text/plain), or
    - SSE-formatted lines (data: "token"\\n\\n)

    Both formats are handled — only the raw token text is yielded.
    """
    import json

    async with httpx.AsyncClient(timeout=PHI4_TIMEOUT) as client:
        async with client.stream(
            "POST",
            f"{settings.phi4_base_url}/generate/text/stream",
            data={"prompt": prompt, "max_new_tokens": "2048"},
        ) as resp:
            resp.raise_for_status()
            buffer = ""
            async for raw_chunk in resp.aiter_text():
                buffer += raw_chunk
                lines = buffer.split("\n")
                buffer = lines.pop()  # keep incomplete trailing line
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    if line == "data: [DONE]":
                        return
                    if line.startswith("data: "):
                        payload = line[6:]
                        # Try to JSON-decode the token (server may quote strings)
                        try:
                            token = json.loads(payload)
                            if isinstance(token, str) and token:
                                yield token
                        except json.JSONDecodeError:
                            # Plain text payload — yield as-is
                            if payload:
                                yield payload
                    else:
                        # Plain text chunk (not SSE formatted)
                        if line:
                            yield line


async def is_phi4_reachable() -> bool:
    if not settings.phi4_base_url:
        return False
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(f"{settings.phi4_base_url}/health")
            return resp.is_success
    except Exception:
        return False
