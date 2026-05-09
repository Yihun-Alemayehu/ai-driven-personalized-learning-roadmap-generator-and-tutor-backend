import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import * as svc from './admin.service';
import { ApiError } from '../../utils/ApiError';

const adaptationEventFiltersSchema = Joi.object({
  type: Joi.string().valid(
    'resource_swap',
    'prerequisite_review',
    'instructor_escalation',
    'decay_micro_quiz',
  ),
  fromDate: Joi.string().isoDate(),
  toDate: Joi.string().isoDate(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

const paginationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

export async function getSystemStats(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const stats = await svc.getSystemStats();
    res.json({ stats });
  } catch (err) {
    next(err);
  }
}

export async function getDomainStats(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const stats = await svc.getDomainStats();
    res.json({ stats });
  } catch (err) {
    next(err);
  }
}

export async function listAdaptationEvents(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = adaptationEventFiltersSchema.validate(req.query, { convert: true });
    if (error) return next(ApiError.badRequest(error.message));
    const result = await svc.listAdaptationEvents(value);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getFlaggedNodes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = paginationSchema.validate(req.query, { convert: true });
    if (error) return next(ApiError.badRequest(error.message));
    const result = await svc.getFlaggedNodes(value.limit, value.offset);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
