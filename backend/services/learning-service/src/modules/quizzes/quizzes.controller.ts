import { Request, Response, NextFunction } from 'express';
import * as svc from './quizzes.service';
import { streamAiExplanation } from '../../lib/aiClient';
import { submitAttemptSchema, listAttemptsSchema } from './quizzes.validation';
import { ApiError } from '../../utils/ApiError';

export async function getQuizForNode(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const quiz = await svc.getQuizForNode(req.params.nodeId, req.user!.id);
    res.json({ quiz });
  } catch (err) {
    next(err);
  }
}

export async function submitAttempt(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = submitAttemptSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const result = await svc.submitAttempt(req.user!.id, req.params.quizId, value);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listAttempts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = listAttemptsSchema.validate(req.query);
    if (error) return next(ApiError.badRequest(error.message));
    const attempts = await svc.listAttempts(req.user!.id, value);
    res.json({ attempts });
  } catch (err) {
    next(err);
  }
}

export async function getAttempt(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const attempt = await svc.getAttempt(req.params.id, req.user!.id);
    res.json({ attempt });
  } catch (err) {
    next(err);
  }
}

export async function getChallengeProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const project = await svc.getChallengeProject(req.params.nodeId, req.user!.id);
    res.json({ project });
  } catch (err) {
    next(err);
  }
}
export async function getNodeExplanation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await svc.getNodeExplanation(req.params.nodeId, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function streamNodeExplanation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Build context (auth + DB queries) before opening the stream
    const ctx = await svc.buildExplanationStreamContext(req.params.nodeId, req.user!.id);

    // SSE headers — X-Accel-Buffering: no disables nginx buffering for this response
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    await streamAiExplanation(ctx, res);
  } catch (err) {
    if (!res.headersSent) {
      next(err);
    } else {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: 'Generation failed' })}\n\n`);
        res.end();
      }
    }
  }
}

export async function askNodeQuestion(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { question, explanation, enrollmentId } = req.body as {
      question: string;
      explanation?: { summary: string; keyPoints: string[]; commonMistakes?: string[] } | null;
      enrollmentId?: string;
    };
    if (!question || typeof question !== 'string' || question.trim().length < 2) {
      res.status(400).json({ error: { message: 'question is required' } });
      return;
    }
    const result = await svc.askNodeQuestion(
      req.params.nodeId,
      req.user!.id,
      question.trim(),
      explanation ?? null,
      enrollmentId,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}
