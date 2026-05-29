import config from '../config';
import type { LearnerContext } from '../modules/progress/learner-context.service';

const BASE = config.services.aiServiceUrl;

async function post<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(130_000), // slightly over Ollama's 120 s
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface AiQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface AiQuizResponse {
  quiz: { questions: AiQuestion[]; generatedBy: string } | null;
}

export interface AiExplanationResponse {
  explanation: {
    summary: string;
    keyPoints: string[];
    commonMistakes?: string[];
  } | null;
}

interface NodeContext {
  nodeId: string;
  nodeTitle: string;
  description?: string;
  learningOutcomes: string[];
  difficultyLevel?: number;
  adaptedDifficulty?: number;
  questionCount?: number;
  weakAreas?: string[];
  explanation?: { summary: string; keyPoints: string[]; commonMistakes?: string[] };
  learnerContext?: LearnerContext;
}

export async function requestAiQuiz(ctx: NodeContext): Promise<AiQuizResponse | null> {
  return post<AiQuizResponse>('/api/v1/ai/generate-quiz', ctx);
}

export async function requestAiExplanation(ctx: NodeContext): Promise<AiExplanationResponse | null> {
  return post<AiExplanationResponse>('/api/v1/ai/generate-explanation', ctx);
}

export async function requestAiMicroQuiz(ctx: NodeContext): Promise<AiQuizResponse | null> {
  return post<AiQuizResponse>('/api/v1/ai/generate-micro-quiz', ctx);
}

export interface AiAskPayload {
  nodeId: string;
  nodeTitle: string;
  question: string;
  description?: string;
  learningOutcomes?: string[];
  explanation?: { summary: string; keyPoints: string[]; commonMistakes?: string[] } | null;
  learnerContext?: LearnerContext;
}

export interface AiAskResponse {
  answer: string | null;
}

export async function requestAiAsk(payload: AiAskPayload): Promise<AiAskResponse | null> {
  return post<AiAskResponse>('/api/v1/ai/ask-question', payload);
}

/**
 * Call the ai-service streaming explanation endpoint and pipe the SSE response
 * directly into the Express response.  Handles client disconnect gracefully.
 */
export async function streamAiExplanation(
  ctx: NodeContext,
  res: import('express').Response,
): Promise<void> {
  const controller = new AbortController();
  res.on('close',  () => controller.abort());
  res.on('finish', () => controller.abort());

  let upstream: Response;
  try {
    upstream = await fetch(`${BASE}/api/v1/ai/generate-explanation/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ctx),
      signal: controller.signal,
    });
  } catch {
    if (!res.writableEnded) {
      res.write('data: {"error":"ai-service unreachable"}\n\n');
      res.end();
    }
    return;
  }

  if (!upstream.ok || !upstream.body) {
    if (!res.writableEnded) {
      res.write('data: {"error":"upstream failed"}\n\n');
      res.end();
    }
    return;
  }

  const reader = (upstream.body as ReadableStream<Uint8Array>).getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!res.writableEnded) res.write(decoder.decode(value, { stream: true }));
    }
  } catch {
    // client disconnected — abort is already signalled above
  } finally {
    if (!res.writableEnded) res.end();
  }
}

/**
 * Call the ai-service streaming ask-question endpoint and pipe the SSE response
 * directly into the Express response. Handles client disconnect gracefully.
 */
export async function streamAiAsk(
  payload: AiAskPayload,
  res: import('express').Response,
): Promise<void> {
  const controller = new AbortController();
  res.on('close',  () => controller.abort());
  res.on('finish', () => controller.abort());

  let upstream: Response;
  try {
    upstream = await fetch(`${BASE}/api/v1/ai/ask-question/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch {
    if (!res.writableEnded) {
      res.write('data: {"error":"ai-service unreachable"}\n\n');
      res.end();
    }
    return;
  }

  if (!upstream.ok || !upstream.body) {
    if (!res.writableEnded) {
      res.write('data: {"error":"upstream failed"}\n\n');
      res.end();
    }
    return;
  }

  const reader = (upstream.body as ReadableStream<Uint8Array>).getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!res.writableEnded) res.write(decoder.decode(value, { stream: true }));
    }
  } catch {
    // client disconnected
  } finally {
    if (!res.writableEnded) res.end();
  }
}

export async function invalidateRemedialQuizCache(nodeId: string): Promise<void> {
  try {
    await fetch(`${BASE}/api/v1/ai/cache/remedial/${nodeId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // Cache invalidation is best-effort
  }
}
