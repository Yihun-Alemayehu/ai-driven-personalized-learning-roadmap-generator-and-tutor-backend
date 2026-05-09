import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import * as svc from './notifications.service';
import { ApiError } from '../../utils/ApiError';

const listSchema = Joi.object({
  read: Joi.boolean(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

export async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = listSchema.validate(req.query, { convert: true });
    if (error) return next(ApiError.badRequest(error.message));
    const result = await svc.getNotifications(req.user!.id, value);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function markRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const notification = await svc.markRead(req.params.id, req.user!.id);
    res.json({ notification });
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await svc.markAllRead(req.user!.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}
