import config from '../../config';

const PHI4_TIMEOUT_MS = 45_000; // GPU-backed but ngrok adds latency

interface Phi4TextResponse {
  response: string;
}

export async function phi4Generate(prompt: string): Promise<string | null> {
  if (!config.phi4.baseUrl) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PHI4_TIMEOUT_MS);

  try {
    const body = new URLSearchParams();
    body.set('prompt', prompt);
    body.set('max_new_tokens', '2048');

    const res = await fetch(`${config.phi4.baseUrl}/generate/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as Phi4TextResponse;
    return data.response ?? null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export async function isPhi4Reachable(): Promise<boolean> {
  if (!config.phi4.baseUrl) return false;
  try {
    const res = await fetch(`${config.phi4.baseUrl}/health`, {
      signal: AbortSignal.timeout(4_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
