import config from '../../config';

const OLLAMA_TIMEOUT_MS = 120_000; // 3B model on CPU can take 30–90 s

interface OllamaGenerateResponse {
  response: string;
  done: boolean;
}

interface OllamaStreamChunk {
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

/**
 * Stream tokens from Ollama one by one, calling onChunk for each response piece.
 * Uses stream:true with plain-text output (no format:'json') so section-marker
 * prompts work naturally.
 */
export async function ollamaStream(
  prompt: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const controller = new AbortController();
  if (signal) signal.addEventListener('abort', () => controller.abort());
  const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const res = await fetch(`${config.ollama.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollama.model,
        prompt,
        stream: true,                                    // token-by-token delivery
        options: { temperature: 0.4, num_predict: 2048 },
        // No format:'json' — we want free-form text with section markers
      }),
      signal: controller.signal,
    });

    if (!res.ok || !res.body) throw new Error(`Ollama HTTP ${res.status}`);

    const reader = (res.body as ReadableStream<Uint8Array>).getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Ollama streams NDJSON — one JSON object per line
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // keep any incomplete trailing line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const chunk = JSON.parse(trimmed) as OllamaStreamChunk;
          if (chunk.response) onChunk(chunk.response);
          if (chunk.done) return;
        } catch {
          // skip malformed line
        }
      }
    }
  } finally {
    clearTimeout(timer);
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
