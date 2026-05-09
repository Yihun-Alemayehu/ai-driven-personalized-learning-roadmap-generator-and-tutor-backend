import config from '../config';

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
  questionCount?: number;
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
