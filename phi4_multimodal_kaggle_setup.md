# Phi-4-Multimodal on Kaggle + ngrok — Setup Guide

## Kaggle Notebook Configuration
- **Accelerator**: GPU T4 x2
- **Internet**: ON
- **Notebook type**: Script

---

## Cell 1 — Install Dependencies

```python
!pip install transformers==4.46.3 accelerate backoff fastapi uvicorn pyngrok pillow soundfile -q
```

---

## Cell 2 — Load Model & Processor

```python
import os, torch
from transformers import AutoModelForCausalLM, AutoProcessor

model_id = "microsoft/Phi-4-multimodal-instruct"

processor = AutoProcessor.from_pretrained(
    model_id,
    trust_remote_code=True,
)

model = AutoModelForCausalLM.from_pretrained(
    model_id,
    trust_remote_code=True,
    torch_dtype=torch.float16,
    _attn_implementation="eager",
)

model = model.to("cuda")
model.eval()
print(f"✅ Model loaded on: {next(model.parameters()).device}")
```

---

## Cell 3 — Build FastAPI App

```python
from fastapi import FastAPI, UploadFile, File, Form
from PIL import Image
import soundfile as sf
import torch, io, json, re

app = FastAPI(title="Phi-4 Multimodal API")

def build_messages(text, enforce_json=False):
    """Build chat messages for Phi-4."""
    if enforce_json:
        text = "You must respond with ONLY valid JSON. No markdown, no code blocks, no explanations. Just raw JSON.\n\n" + text
    return [
        {"role": "user", "content": text}
    ]

def extract_json(raw_response: str) -> str:
    """Extract JSON from response, handling markdown code blocks and extra text."""
    # Remove markdown code blocks
    cleaned = re.sub(r'```(?:json)?\s*', '', raw_response)
    cleaned = cleaned.replace('```', '')
    
    # Try to find JSON object
    match = re.search(r'\{.*\}', cleaned, re.DOTALL)
    if match:
        return match.group(0)
    
    # If wrapped in other text, try to extract just the JSON array/object
    start_brace = cleaned.find('{')
    start_bracket = cleaned.find('[')
    
    if start_brace == -1 and start_bracket == -1:
        return cleaned.strip()
    
    start = min(x for x in [start_brace, start_bracket] if x != -1)
    
    # Find matching end
    if cleaned[start] == '{':
        end = cleaned.rfind('}')
    else:
        end = cleaned.rfind(']')
    
    if end != -1 and end > start:
        return cleaned[start:end+1]
    
    return cleaned.strip()

@app.post("/generate/text")
async def generate_text(prompt: str = Form(...), max_new_tokens: int = Form(2048), json_mode: bool = Form(False)):
    messages = build_messages(prompt, enforce_json=json_mode)
    
    # Apply chat template and tokenize
    prompt_text = processor.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = processor(text=prompt_text, return_tensors="pt").to("cuda")
    
    # Generate with proper parameters
    generation_args = {
        "max_new_tokens": max_new_tokens,
        "do_sample": False,
        "temperature": None,
        "top_p": None,
    }
    
    with torch.no_grad():
        outputs = model.generate(**inputs, **generation_args)
    
    # Decode only the new tokens (not the input prompt)
    input_length = inputs['input_ids'].shape[1]
    new_tokens = outputs[0][input_length:]
    response = processor.decode(new_tokens, skip_special_tokens=True).strip()
    
    if json_mode:
        response = extract_json(response)
    
    return {"response": response}

@app.post("/generate/image")
async def generate_image(prompt: str = Form(...), image: UploadFile = File(...), max_new_tokens: int = Form(2048)):
    img = Image.open(io.BytesIO(await image.read())).convert("RGB")
    messages = [{"role": "user", "content": "<|image_1|>\n" + prompt}]
    prompt_text = processor.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = processor(text=prompt_text, images=img, return_tensors="pt").to("cuda")
    generation_args = {
        "max_new_tokens": max_new_tokens,
        "do_sample": False,
        "temperature": None,
        "top_p": None,
    }
    with torch.no_grad():
        outputs = model.generate(**inputs, **generation_args)
    input_length = inputs['input_ids'].shape[1]
    new_tokens = outputs[0][input_length:]
    response = processor.decode(new_tokens, skip_special_tokens=True).strip()
    return {"response": response}

@app.post("/generate/audio")
async def generate_audio(prompt: str = Form(...), audio: UploadFile = File(...), max_new_tokens: int = Form(2048)):
    audio_array, sample_rate = sf.read(io.BytesIO(await audio.read()))
    if audio_array.ndim > 1:
        audio_array = audio_array.mean(axis=1)
    messages = [{"role": "user", "content": "<|audio_1|>\n" + prompt}]
    prompt_text = processor.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = processor(text=prompt_text, audios=[(audio_array, sample_rate)], return_tensors="pt").to("cuda")
    generation_args = {
        "max_new_tokens": max_new_tokens,
        "do_sample": False,
        "temperature": None,
        "top_p": None,
    }
    with torch.no_grad():
        outputs = model.generate(**inputs, **generation_args)
    input_length = inputs['input_ids'].shape[1]
    new_tokens = outputs[0][input_length:]
    response = processor.decode(new_tokens, skip_special_tokens=True).strip()
    return {"response": response}

@app.get("/health")
def health():
    return {"status": "ok", "model": "Phi-4-multimodal-instruct"}


# ── Streaming endpoint ────────────────────────────────────────────────────────
from transformers import TextIteratorStreamer
from threading import Thread
from fastapi.responses import StreamingResponse as FastAPIStreamingResponse

@app.post("/generate/text/stream")
async def generate_text_stream(prompt: str = Form(...), max_new_tokens: int = Form(2048)):
    """Stream tokens word-by-word as Phi-4 generates them (SSE-compatible plain text)."""
    messages = build_messages(prompt)
    text_input = processor.apply_chat_template(
        messages, add_generation_prompt=True, tokenize=False
    )
    inputs = processor(text=text_input, return_tensors="pt").to("cuda")

    streamer = TextIteratorStreamer(
        processor.tokenizer, skip_special_tokens=True, skip_prompt=True
    )
    gen_kwargs = {
        **inputs,
        "max_new_tokens": max_new_tokens,
        "streamer": streamer,
        "do_sample": False,
        "temperature": 1.0,
    }

    thread = Thread(target=model.generate, kwargs=gen_kwargs)
    thread.start()

    def token_generator():
        for token in streamer:
            yield token
        thread.join()

    return FastAPIStreamingResponse(token_generator(), media_type="text/plain")


print("✅ FastAPI app ready (incl. /generate/text/stream)")
```

---

## Cell 4 — Start Server & Expose via ngrok

```python
import uvicorn, threading
from pyngrok import ngrok, conf

conf.get_default().auth_token = "YOUR_NGROK_TOKEN"  # from dashboard.ngrok.com

thread = threading.Thread(
    target=lambda: uvicorn.run(app, host="0.0.0.0", port=8000),
    daemon=True
)
thread.start()

public_url = ngrok.connect(8000)
print(f"🚀 Public URL: {public_url}")
print(f"📖 Swagger docs: {public_url}/docs")
```

---

## Endpoints

| Endpoint | Input | Use case |
|---|---|---|
| `POST /generate/text` | `prompt` (form field) | JSON generation (quizzes, explanations) |
| `POST /generate/text/stream` | `prompt` (form field) | **Token-by-token streaming** (AI Instructor, explanations) |
| `POST /generate/image` | `prompt` + `image` (file) | Image understanding |
| `POST /generate/audio` | `prompt` + `audio` (file) | Audio understanding |
| `GET /health` | — | Server health check |

---

## Quick Test

```python
import requests

BASE = str(public_url)

r = requests.post(f"{BASE}/generate/text", data={
    "prompt": "Explain how transformers work in deep learning, step by step.",
    "max_new_tokens": 400
})
print(r.json()["response"])
```

Open `{public_url}/docs` in your browser for the interactive Swagger UI.

---

## Notes

- Session limit: **12 hours** on Kaggle free tier — ngrok URL dies when session ends
- CUDA warnings at startup (`cuFFT`, `cuDNN`, `cuBLAS`) are harmless — ignore them
- `FutureWarning: CheckpointImpl.NO_REENTRANT` is harmless — ignore it
- Model size: ~11GB in fp16, fits comfortably on single T4 (16GB VRAM)
- `transformers==4.46.3` is required — newer versions (4.47+) break model init with a meta tensor error
