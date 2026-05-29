import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../config';

let _client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  if (!config.gemini.apiKey) return null;
  if (!_client) _client = new GoogleGenerativeAI(config.gemini.apiKey);
  return _client;
}

export async function geminiGenerate(prompt: string): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const model = client.getGenerativeModel({ model: config.gemini.model });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });
    clearTimeout(timer);
    return result.response.text() ?? null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Stream tokens from Gemini, calling onChunk for each text piece.
 * Uses plain text output (not JSON) — suitable for SSE streaming.
 */
export async function geminiStream(
  prompt: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const client = getClient();
  if (!client) throw new Error('Gemini not configured');

  const abortController = new AbortController();
  if (signal) signal.addEventListener('abort', () => abortController.abort());
  const timer = setTimeout(() => abortController.abort(), 90_000);

  try {
    const model = client.getGenerativeModel({ model: config.gemini.model });
    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
    });

    for await (const chunk of result.stream) {
      if (abortController.signal.aborted) break;
      const text = chunk.text();
      if (text) onChunk(text);
    }
  } finally {
    clearTimeout(timer);
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(config.gemini.apiKey);
}
