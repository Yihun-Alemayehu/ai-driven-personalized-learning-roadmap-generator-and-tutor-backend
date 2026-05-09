import config from '../../config';

const OLLAMA_TIMEOUT_MS = 120_000; // 3B model on CPU can take 30–90 s

interface OllamaGenerateResponse {
  response: string;
  done: boolean;
}

export async function ollamaGenerate(prompt: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const res = await fetch(`${config.ollama.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollama.model,
        prompt,
        format: 'json',
        stream: false,
        options: { temperature: 0.3, num_predict: 2048 },
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as OllamaGenerateResponse;
    return data.response ?? null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export async function isOllamaReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${config.ollama.baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
