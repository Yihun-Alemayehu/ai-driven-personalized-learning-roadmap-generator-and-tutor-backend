import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import * as svc from './instructor.service';
import { ApiError } from '../../utils/ApiError';
import { streamAiAsk } from '../../lib/aiClient';

const learnerFiltersSchema = Joi.object({
  domainId: Joi.string().uuid(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

const paginationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

const resolveSchema = Joi.object({
  resolutionNotes: Joi.string().min(1).max(2000).required(),
});

export async function listLearners(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = learnerFiltersSchema.validate(req.query, { convert: true });
    if (error) return next(ApiError.badRequest(error.message));
    const result = await svc.listLearners(value);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getLearnerProgress(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await svc.getLearnerProgress(req.params.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getLearnerQuizHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = paginationSchema.validate(req.query, { convert: true });
    if (error) return next(ApiError.badRequest(error.message));
    const result = await svc.getLearnerQuizHistory(req.params.userId, value.limit, value.offset);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getDomainAnalytics(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await svc.getDomainAnalytics(req.params.domainId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function streamAnalyticsSummary(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const analytics = await svc.getDomainAnalytics(req.params.domainId);

    const { domain, enrollmentCount, overallMasteryRate, nodeAnalytics, problemNodes } = analytics as {
      domain: { name: string };
      enrollmentCount: number;
      overallMasteryRate: number;
      nodeAnalytics: Array<{ title: string; masteryRate: number; avgQuizScore: number | null; avgAttempts: number; learnerCount: number; difficultyLevel?: number | null }>;
      problemNodes: Array<{ title: string; masteryRate: number; avgQuizScore: number | null; avgAttempts: number }>;
    };

    if (!nodeAnalytics) {
      res.json({ error: 'No analytics data available' });
      return;
    }

    const attempted = nodeAnalytics.filter((n) => n.learnerCount > 0);
    const topNodes = [...attempted].sort((a, b) => b.masteryRate - a.masteryRate).slice(0, 5);
    const bottomNodes = [...attempted].sort((a, b) => a.masteryRate - b.masteryRate).slice(0, 5);

    const nodesSummary = attempted.length > 0
      ? [
          `Top performing nodes: ${topNodes.map((n) => `${n.title} (${n.masteryRate.toFixed(0)}%)`).join(', ')}`,
          `Struggling nodes: ${bottomNodes.map((n) => `${n.title} (${n.masteryRate.toFixed(0)}%)`).join(', ')}`,
          `Average quiz score across nodes: ${(attempted.reduce((s, n) => s + (n.avgQuizScore ?? 0), 0) / attempted.length).toFixed(1)}%`,
          `Average attempts per node: ${(attempted.reduce((s, n) => s + n.avgAttempts, 0) / attempted.length).toFixed(2)}`,
        ].join('\n')
      : 'No learner activity recorded yet.';

    const question = [
      `Analyse the following domain performance data for "${domain.name}" and provide a structured report:`,
      '',
      `Domain: ${domain.name}`,
      `Total enrollments: ${enrollmentCount}`,
      `Overall mastery rate: ${(overallMasteryRate ?? 0).toFixed(1)}%`,
      `Total nodes: ${nodeAnalytics.length}`,
      `Nodes with learner activity: ${attempted.length}`,
      '',
      nodesSummary,
      '',
      `Problem nodes (lowest mastery): ${(problemNodes ?? []).map((n) => `${n.title} (${n.masteryRate.toFixed(0)}%, avg score: ${n.avgQuizScore?.toFixed(0) ?? 'N/A'}%, avg attempts: ${n.avgAttempts.toFixed(1)})`).join('; ')}`,
      '',
      'Please provide:',
      '1. A 2-3 sentence situation summary',
      '2. 3-4 key concerns or observations',
      '3. 3-4 specific, actionable recommendations for the domain expert (e.g. revise node content, adjust difficulty, add prerequisites, split complex nodes)',
      '',
      'Be specific, practical, and concise. Focus on what the domain expert can actually change in the curriculum.',
    ].join('\n');

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    await streamAiAsk(
      {
        nodeId: 'analytics-summary',
        nodeTitle: `${domain.name} Analytics`,
        question,
        learningOutcomes: [],
      },
      res,
    );
  } catch (err) {
    next(err);
  }
}

export async function getFlaggedEvents(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = paginationSchema.validate(req.query, { convert: true });
    if (error) return next(ApiError.badRequest(error.message));
    const result = await svc.getFlaggedEvents(value.limit, value.offset);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function resolveFlaggedEvent(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = resolveSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const result = await svc.resolveFlaggedEvent(
      req.params.eventId,
      req.user!.id,
      value.resolutionNotes,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}
