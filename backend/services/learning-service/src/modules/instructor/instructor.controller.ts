import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import * as svc from './instructor.service';
import { ApiError } from '../../utils/ApiError';

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
