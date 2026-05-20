import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import * as svc from './ai.service';
import { getCircuitState } from './ai.circuit-breaker';
import { isOllamaReachable } from './ollama.client';
import { isGeminiConfigured } from './gemini.client';
import { ApiError } from '../../utils/ApiError';

const nodeContextSchema = Joi.object({
  nodeId: Joi.string().required(),
  nodeTitle: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  learningOutcomes: Joi.array().items(Joi.string()).min(0).required(),
  difficultyLevel: Joi.number().integer().min(1).max(5).optional(),
  questionCount: Joi.number().integer().min(2).max(8).optional(),
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
  explanation: Joi.object({
    summary: Joi.string().required(),
    keyPoints: Joi.array().items(Joi.string()).required(),
    commonMistakes: Joi.array().items(Joi.string()).optional(),
  }).allow(null).optional(),
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
