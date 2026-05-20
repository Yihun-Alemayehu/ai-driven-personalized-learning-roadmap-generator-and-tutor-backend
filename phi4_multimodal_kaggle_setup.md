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
import torch, io

app = FastAPI(title="Phi-4 Multimodal API")

def build_prompt(text, has_image=False, has_audio=False):
    content = ""
    if has_image:
        content += "<|image_1|>\n"
    if has_audio:
        content += "<|audio_1|>\n"
    content += text
    return f"<|user|>\n{content}<|end|>\n<|assistant|>\n"

@app.post("/generate/text")
async def generate_text(prompt: str = Form(...), max_new_tokens: int = Form(512)):
    full_prompt = build_prompt(prompt)
    inputs = processor(text=full_prompt, return_tensors="pt").to("cuda")
    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=max_new_tokens, do_sample=False)
    response = processor.decode(outputs[0], skip_special_tokens=True).split("<|assistant|>")[-1].strip()
    return {"response": response}

@app.post("/generate/image")
async def generate_image(prompt: str = Form(...), image: UploadFile = File(...), max_new_tokens: int = Form(512)):
    img = Image.open(io.BytesIO(await image.read())).convert("RGB")
    full_prompt = build_prompt(prompt, has_image=True)
    inputs = processor(text=full_prompt, images=img, return_tensors="pt").to("cuda")
    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=max_new_tokens, do_sample=False)
    response = processor.decode(outputs[0], skip_special_tokens=True).split("<|assistant|>")[-1].strip()
    return {"response": response}

@app.post("/generate/audio")
async def generate_audio(prompt: str = Form(...), audio: UploadFile = File(...), max_new_tokens: int = Form(512)):
    audio_array, sample_rate = sf.read(io.BytesIO(await audio.read()))
    if audio_array.ndim > 1:
        audio_array = audio_array.mean(axis=1)
    full_prompt = build_prompt(prompt, has_audio=True)
    inputs = processor(text=full_prompt, audios=[(audio_array, sample_rate)], return_tensors="pt").to("cuda")
    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=max_new_tokens, do_sample=False)
    response = processor.decode(outputs[0], skip_special_tokens=True).split("<|assistant|>")[-1].strip()
    return {"response": response}

@app.get("/health")
def health():
    return {"status": "ok", "model": "Phi-4-multimodal-instruct"}

print("✅ FastAPI app ready")
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
| `POST /generate/text` | `prompt` (form field) | Text-only generation |
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
