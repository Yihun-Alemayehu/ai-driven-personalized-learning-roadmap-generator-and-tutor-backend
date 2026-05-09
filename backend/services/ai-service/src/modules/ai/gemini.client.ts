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

export function isGeminiConfigured(): boolean {
  return Boolean(config.gemini.apiKey);
}
