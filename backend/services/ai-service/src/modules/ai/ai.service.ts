import logger from '../../utils/logger';
import { ollamaGenerate } from './ollama.client';
import { geminiGenerate } from './gemini.client';
import { isCircuitOpen, recordSuccess, recordFailure } from './ai.circuit-breaker';
import { getCached, setCache, cacheKeys, ttls } from './ai.cache';
import {
  generatedQuizSchema,
  generatedExplanationSchema,
  type QuizGenerationInput,
  type ExplanationInput,
  type MicroQuizInput,
  type GeneratedQuiz,
  type GeneratedExplanation,
} from './ai.types';
import { buildQuizPrompt } from './prompts/quizGeneration';
import { buildMicroQuizPrompt } from './prompts/microQuizGeneration';
import { buildExplanationPrompt } from './prompts/explanationGeneration';

function parseAndValidate<T>(
  raw: string | null,
  schema: { validate: (v: unknown) => { error?: unknown; value: T } },
): T | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    const { error, value } = schema.validate(parsed);
    if (error) return null;
    return value;
  } catch {
    return null;
  }
}

async function generate<T>(
  prompt: string,
  schema: { validate: (v: unknown) => { error?: unknown; value: T } },
  logContext: string,
): Promise<T | null> {
  const circuitOpen = await isCircuitOpen();

  if (!circuitOpen) {
    // Try Ollama first
    const raw = await ollamaGenerate(prompt);
    const result = parseAndValidate<T>(raw, schema);

    if (result) {
      await recordSuccess();
      return result;
    }

    // Ollama produced invalid/no output
    await recordFailure();
    logger.warn({ logContext }, 'Ollama output invalid — trying Gemini fallback');
  } else {
    logger.warn({ logContext }, 'Circuit breaker open — skipping Ollama, trying Gemini');
  }

  // Gemini fallback
  const geminiRaw = await geminiGenerate(prompt);
  const geminiResult = parseAndValidate<T>(geminiRaw, schema);
  if (geminiResult) {
    logger.info({ logContext }, 'Gemini fallback succeeded');
    return geminiResult;
  }

  logger.warn({ logContext }, 'Both Ollama and Gemini failed — caller will use static content');
  return null;
}

export async function generateQuiz(input: QuizGenerationInput): Promise<GeneratedQuiz | null> {
  const cacheKey = cacheKeys.quiz(input.nodeId);
  const cached = await getCached<GeneratedQuiz>(cacheKey);
  if (cached) return cached;

  const prompt = buildQuizPrompt(input);
  const result = await generate(prompt, generatedQuizSchema as never, `quiz:${input.nodeId}`);
  if (!result) return null;

  const quiz: GeneratedQuiz = { ...(result as object), generatedBy: 'ai_tutor' } as GeneratedQuiz;
  await setCache(cacheKey, quiz, ttls.QUIZ_TTL);
  return quiz;
}

export async function generateExplanation(
  input: ExplanationInput,
): Promise<GeneratedExplanation | null> {
  const cacheKey = cacheKeys.explanation(input.nodeId);
  const cached = await getCached<GeneratedExplanation>(cacheKey);
  if (cached) return cached;

  const prompt = buildExplanationPrompt(input);
  const result = await generate(
    prompt,
    generatedExplanationSchema as never,
    `explanation:${input.nodeId}`,
  );
  if (!result) return null;

  await setCache(cacheKey, result, ttls.EXPLANATION_TTL);
  return result as GeneratedExplanation;
}

export async function generateMicroQuiz(input: MicroQuizInput): Promise<GeneratedQuiz | null> {
  const cacheKey = cacheKeys.microQuiz(input.nodeId);
  const cached = await getCached<GeneratedQuiz>(cacheKey);
  if (cached) return cached;

  const prompt = buildMicroQuizPrompt(input);
  const result = await generate(prompt, generatedQuizSchema as never, `micro-quiz:${input.nodeId}`);
  if (!result) return null;

  const quiz: GeneratedQuiz = { ...(result as object), generatedBy: 'ai_tutor' } as GeneratedQuiz;
  await setCache(cacheKey, quiz, ttls.MICRO_QUIZ_TTL);
  return quiz;
}
