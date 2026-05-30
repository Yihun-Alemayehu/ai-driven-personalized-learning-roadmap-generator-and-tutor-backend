import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import * as svc from './ai.service';
import { getCircuitState } from './ai.circuit-breaker';
import { isOllamaReachable } from './ollama.client';
import { isGeminiConfigured } from './gemini.client';
import { invalidateRemedialCache } from './ai.cache';
import { ApiError } from '../../utils/ApiError';

const learnerContextSchema = Joi.object({
  familiarityLevel: Joi.string().allow(null).optional(),
  learningGoal: Joi.string().allow(null).optional(),
  weeklyHours: Joi.number().allow(null).optional(),
  aboutSelf: Joi.string().allow(null, '').optional(),
  preferredLearningStyle: Joi.string().allow(null).optional(),
  priorSkills: Joi.string().allow(null, '').optional(),
  currentNodeAttempts: Joi.number().integer().min(0).optional(),
  currentNodeBestScore: Joi.number().allow(null).optional(),
  currentNodeMasteryState: Joi.string().optional(),
  overallAvgScore: Joi.number().allow(null).optional(),
  nodesCompleted: Joi.number().integer().min(0).optional(),
  totalNodes: Joi.number().integer().min(0).optional(),
}).optional();

/** Grounding context produced by generate-explanation (learning-service passes this into generate-quiz). */
const explanationSchema = Joi.object({
  summary: Joi.string().required(),
  keyPoints: Joi.array().items(Joi.string()).required(),
  commonMistakes: Joi.array().items(Joi.string()).optional(),
}).optional();

const nodeContextSchema = Joi.object({
  nodeId: Joi.string().required(),
  nodeTitle: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  learningOutcomes: Joi.array().items(Joi.string()).min(0).required(),
  difficultyLevel: Joi.number().integer().min(1).max(5).optional(),
  adaptedDifficulty: Joi.number().integer().min(1).max(5).optional(),
  questionCount: Joi.number().integer().min(2).max(8).optional(),
  explanation: Joi.object({
    summary: Joi.string().required(),
    keyPoints: Joi.array().items(Joi.string()).required(),
    commonMistakes: Joi.array().items(Joi.string()).optional(),
  }).allow(null).optional(),
  weakAreas: Joi.array().items(Joi.string()).max(10).optional(),
  explanation: explanationSchema,
  learnerContext: learnerContextSchema,
});

export async function generateQuiz(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = nodeContextSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const quiz = await svc.generateQuiz(value);
    res.json({ quiz, cached: false });
  } catch (err) {
    next(err);
  }
}

export async function generateExplanation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = nodeContextSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const explanation = await svc.generateExplanation(value);
    res.json({ explanation });
  } catch (err) {
    next(err);
  }
}

export async function generateMicroQuiz(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = nodeContextSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const quiz = await svc.generateMicroQuiz(value);
    res.json({ quiz });
  } catch (err) {
    next(err);
  }
}

const askQuestionSchema = Joi.object({
  nodeId: Joi.string().required(),
  nodeTitle: Joi.string().required(),
  question: Joi.string().min(3).max(1000).required(),
  description: Joi.string().allow('').optional(),
  learningOutcomes: Joi.array().items(Joi.string()).optional(),
  explanation: explanationSchema.allow(null),
  learnerContext: learnerContextSchema,
});

export async function askQuestion(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = askQuestionSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const answer = await svc.askQuestion(value);
    res.json({ answer });
  } catch (err) {
    next(err);
  }
}

export async function invalidateCache(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { nodeId } = req.params;
    if (!nodeId) return next(ApiError.badRequest('nodeId is required'));
    const deleted = await invalidateRemedialCache(nodeId);
    res.json({ deleted });
  } catch (err) {
    next(err);
  }
}

export async function streamExplanation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { error, value } = nodeContextSchema.validate(req.body);
  if (error) return next(ApiError.badRequest(error.message));

  // SSE headers — X-Accel-Buffering: no tells nginx not to buffer this response
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendChunk = (text: string) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify({ t: text })}\n\n`);
  };

  const abortController = new AbortController();
  req.on('close', () => abortController.abort());

  try {
    await svc.streamExplanation(value, sendChunk, abortController.signal);
    if (!res.writableEnded) res.write('data: [DONE]\n\n');
  } catch (err) {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify({ error: 'Generation failed' })}\n\n`);
  } finally {
    if (!res.writableEnded) res.end();
  }
}

export async function streamAskQuestion(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { error, value } = askQuestionSchema.validate(req.body);
  if (error) return next(ApiError.badRequest(error.message));

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendChunk = (text: string) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify({ t: text })}\n\n`);
  };

  const abortController = new AbortController();
  req.on('close', () => abortController.abort());

  try {
    await svc.streamAskQuestion(value, sendChunk, abortController.signal);
    if (!res.writableEnded) res.write('data: [DONE]\n\n');
  } catch {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify({ error: 'Generation failed' })}\n\n`);
  } finally {
    if (!res.writableEnded) res.end();
  }
}

export async function healthDetail(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [ollamaUp, cbState] = await Promise.all([
      isOllamaReachable(),
      getCircuitState(),
    ]);
    res.json({
      status: 'ok',
      ollama: { reachable: ollamaUp, circuitBreaker: cbState },
      gemini: { configured: isGeminiConfigured() },
    });
  } catch (err) {
    next(err);
  }
}
