import logger from '../../utils/logger';
import config from '../../config';
import { phi4Generate } from './phi4.client';
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
  type AskQuestionInput,
  type GeneratedQuiz,
  type GeneratedExplanation,
} from './ai.types';
import { buildQuizPrompt } from './prompts/quizGeneration';
import { buildMicroQuizPrompt } from './prompts/microQuizGeneration';
import { buildExplanationPrompt, buildStreamExplanationPrompt } from './prompts/explanationGeneration';
import { buildAskPrompt } from './prompts/askQuestion';
import { geminiStream } from './gemini.client';

function parseAndValidate<T>(
  raw: string | null,
  schema: { validate: (v: unknown) => { error?: unknown; value: T } },
): T | null {
  if (!raw) return null;

  const parseCandidates: string[] = [raw.trim()];
  const unwrapped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  if (unwrapped !== raw.trim()) parseCandidates.push(unwrapped);

  const firstBrace = unwrapped.indexOf('{');
  const lastBrace = unwrapped.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    parseCandidates.push(unwrapped.slice(firstBrace, lastBrace + 1));
  }

  try {
    for (const candidateText of parseCandidates) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(candidateText) as unknown;
      } catch {
        continue;
      }

      // LLMs sometimes wrap the payload (e.g. { explanation: {...} } or { quiz: {...} }).
      const candidates: unknown[] = [parsed];
      if (parsed && typeof parsed === 'object') {
        const obj = parsed as Record<string, unknown>;
        if (obj.explanation) candidates.push(obj.explanation);
        if (obj.quiz) candidates.push(obj.quiz);
        if (obj.data) candidates.push(obj.data);
      }

      for (const candidate of candidates) {
        const { error, value } = schema.validate(candidate);
        if (!error) return value;
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function generate<T>(
  prompt: string,
  schema: { validate: (v: unknown) => { error?: unknown; value: T } },
  logContext: string,
): Promise<T | null> {

  // ── 1. Phi-4 (primary) ───────────────────────────────────────────────────────
  if (config.phi4.baseUrl) {
    const phi4Open = await isCircuitOpen('phi4');
    if (!phi4Open) {
      const raw = await phi4Generate(prompt);
      const result = parseAndValidate<T>(raw, schema);
      if (result) {
        await recordSuccess('phi4');
        logger.info({ logContext }, 'Phi-4 succeeded');
        return result;
      }
      await recordFailure('phi4');
      logger.warn({ logContext }, 'Phi-4 output invalid — falling back to Ollama');
    } else {
      logger.warn({ logContext }, 'Phi-4 circuit open — skipping to Ollama');
    }
  }

  // ── 2. Ollama (secondary fallback) ───────────────────────────────────────────
  const ollamaOpen = await isCircuitOpen('ollama');
  if (!ollamaOpen) {
    const raw = await ollamaGenerate(prompt);
    const result = parseAndValidate<T>(raw, schema);
    if (result) {
      await recordSuccess('ollama');
      logger.info({ logContext }, 'Ollama fallback succeeded');
      return result;
    }
    await recordFailure('ollama');
    logger.warn({ logContext }, 'Ollama output invalid — falling back to Gemini');
  } else {
    logger.warn({ logContext }, 'Ollama circuit open — skipping to Gemini');
  }

  // ── 3. Gemini (last resort) ──────────────────────────────────────────────────
  const geminiRaw = await geminiGenerate(prompt);
  const geminiResult = parseAndValidate<T>(geminiRaw, schema);
  if (geminiResult) {
    logger.info({ logContext }, 'Gemini fallback succeeded');
    return geminiResult;
  }

  logger.warn({ logContext }, 'All providers (Phi-4, Ollama, Gemini) failed — returning null');
  return null;
}

export async function generateQuiz(input: QuizGenerationInput): Promise<GeneratedQuiz | null> {
  const familiarityLevel = input.learnerContext?.familiarityLevel;
  const isRemedial = input.weakAreas && input.weakAreas.length > 0;

  const cacheKey = isRemedial
    ? cacheKeys.remedialQuiz(input.nodeId, input.weakAreas!)
    : cacheKeys.quiz(input.nodeId, input.adaptedDifficulty, familiarityLevel);
  const cacheTtl = isRemedial ? ttls.REMEDIAL_QUIZ_TTL : ttls.QUIZ_TTL;

  const cached = await getCached<GeneratedQuiz>(cacheKey);
  if (cached) return cached;

  const cachedExplanation = await getCached<GeneratedExplanation>(cacheKeys.explanation(input.nodeId, familiarityLevel));
  const prompt = buildQuizPrompt({ ...input, explanation: input.explanation ?? cachedExplanation ?? undefined });

  const result = await generate(prompt, generatedQuizSchema as never, `quiz:${input.nodeId}`);
  if (!result) return null;

  const quiz: GeneratedQuiz = { ...(result as object), generatedBy: 'ai_tutor' } as GeneratedQuiz;
  await setCache(cacheKey, quiz, cacheTtl);
  return quiz;
}

export async function generateExplanation(
  input: ExplanationInput,
): Promise<GeneratedExplanation | null> {
  const familiarityLevel = input.learnerContext?.familiarityLevel;
  const cacheKey = cacheKeys.explanation(input.nodeId, familiarityLevel);
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

export async function askQuestion(input: AskQuestionInput): Promise<string | null> {
  const prompt = buildAskPrompt(input);

  // Ask-question responses are never cached (each is unique to the conversation)
  const answerSchema = { validate: (v: unknown) => {
    if (v && typeof v === 'object' && 'answer' in v && typeof (v as Record<string,unknown>).answer === 'string') {
      return { value: v as { answer: string } };
    }
    return { error: 'invalid', value: v as { answer: string } };
  }};

  const result = await generate<{ answer: string }>(
    prompt,
    answerSchema as never,
    `ask:${input.nodeId}`,
  );
  return result?.answer ?? null;
}

/** Format a cached JSON explanation as the section-text format used by the stream endpoint. */
function formatExplanationAsText(e: GeneratedExplanation): string {
  const lines: string[] = ['[SUMMARY]', e.summary, '', '[KEY_POINTS]'];
  for (const p of e.keyPoints) lines.push(`- ${p}`);
  if (e.commonMistakes && e.commonMistakes.length > 0) {
    lines.push('', '[COMMON_MISTAKES]');
    for (const m of e.commonMistakes) lines.push(`- ${m}`);
  }
  return lines.join('\n');
}

/** Parse streamed section text back into the JSON shape and cache it for quiz use. */
async function backfillExplanationCache(
  nodeId: string,
  familiarityLevel: string | null | undefined,
  text: string,
): Promise<void> {
  const summaryM = text.match(/\[SUMMARY\]([\s\S]*?)(?=\[KEY_POINTS\]|\[COMMON_MISTAKES\]|$)/);
  const pointsM  = text.match(/\[KEY_POINTS\]([\s\S]*?)(?=\[COMMON_MISTAKES\]|$)/);
  const mistakesM = text.match(/\[COMMON_MISTAKES\]([\s\S]*?)$/);

  const summary = summaryM?.[1]?.trim() ?? '';
  const keyPoints = (pointsM?.[1] ?? '')
    .split('\n').filter(l => l.trim().startsWith('-'))
    .map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean);
  const commonMistakes = (mistakesM?.[1] ?? '')
    .split('\n').filter(l => l.trim().startsWith('-'))
    .map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean);

  if (summary && keyPoints.length > 0) {
    await setCache(
      cacheKeys.explanation(nodeId, familiarityLevel),
      { summary, keyPoints, commonMistakes },
      ttls.EXPLANATION_TTL,
    );
  }
}

/**
 * Stream an explanation as text/SSE chunks.
 * onChunk is called once per token (Gemini) or once for the whole text (cache hit / fallback).
 */
export async function streamExplanation(
  input: ExplanationInput,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const familiarityLevel = input.learnerContext?.familiarityLevel;
  const cacheKey = cacheKeys.explanation(input.nodeId, familiarityLevel);
  const cached = await getCached<GeneratedExplanation>(cacheKey);

  // ── Cache hit: format and emit immediately ───────────────────────────────────
  if (cached) {
    onChunk(formatExplanationAsText(cached));
    return;
  }

  // ── Gemini streaming (primary) ───────────────────────────────────────────────
  const prompt = buildStreamExplanationPrompt(input);
  let streamedText = '';
  try {
    await geminiStream(
      prompt,
      (chunk) => { onChunk(chunk); streamedText += chunk; },
      signal,
    );
    // Backfill the JSON cache so quizzes can use this explanation as context
    backfillExplanationCache(input.nodeId, familiarityLevel, streamedText).catch(() => {});
    return;
  } catch (err) {
    logger.warn({ nodeId: input.nodeId, err }, 'Gemini stream failed — falling back to regular generate');
  }

  // ── Fallback: regular generate → emit as single burst ───────────────────────
  const result = await generate<GeneratedExplanation>(
    buildExplanationPrompt(input),
    generatedExplanationSchema as never,
    `explanation:${input.nodeId}`,
  );
  if (!result) throw new Error('All explanation providers failed');
  await setCache(cacheKey, result, ttls.EXPLANATION_TTL);
  onChunk(formatExplanationAsText(result));
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
