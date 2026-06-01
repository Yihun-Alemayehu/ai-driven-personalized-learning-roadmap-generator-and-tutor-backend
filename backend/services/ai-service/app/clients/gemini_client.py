from collections.abc import AsyncIterator

import google.generativeai as genai

from app.config import settings

_model = None


def _get_model():
    global _model
    if not settings.gemini_api_key:
        return None
    if _model is None:
        genai.configure(api_key=settings.gemini_api_key)
        _model = genai.GenerativeModel(settings.gemini_model)
    return _model


async def gemini_generate(prompt: str) -> str | None:
    model = _get_model()
    if model is None:
        return None
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.3,
                max_output_tokens=2048,
            ),
        )
        return response.text
    except Exception:
        return None


async def gemini_stream(prompt: str) -> AsyncIterator[str]:
    """Yield tokens from Gemini streaming (plain text, not JSON)."""
    model = _get_model()
    if model is None:
        raise RuntimeError("Gemini not configured")

    response = model.generate_content(
        prompt,
        stream=True,
        generation_config=genai.types.GenerationConfig(
            temperature=0.4,
            max_output_tokens=2048,
        ),
    )
    for chunk in response:
        text = chunk.text
        if text:
            yield text


def is_gemini_configured() -> bool:
    return bool(settings.gemini_api_key)
