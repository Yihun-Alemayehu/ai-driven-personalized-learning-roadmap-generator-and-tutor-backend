import { Request, Response, NextFunction } from 'express';
import * as svc from './whitelist.service';
import { addWhitelistSchema } from './whitelist.validation';
import { ApiError } from '../../utils/ApiError';

export async function listWhitelist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const entries = await svc.listWhitelist(req.params.domainId);
    res.json({ whitelist: entries });
  } catch (err) {
    next(err);
  }
}

export async function addToWhitelist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error, value } = addWhitelistSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const entry = await svc.addToWhitelist(req.params.domainId, value, req.user!.id);
    res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
}

export async function removeFromWhitelist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await svc.removeFromWhitelist(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
