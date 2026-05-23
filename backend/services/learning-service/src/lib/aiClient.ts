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
