import type { Request, Response, NextFunction } from 'express';
import * as svc from './branching.service';
import { selectPathSchema } from './branching.validation';
import { ApiError } from '../../utils/ApiError';

export async function getBranchingPoints(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await svc.getBranchingPoints(req.params.id, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getAvailablePaths(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await svc.getAvailablePaths(req.params.id, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function selectPath(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = selectPathSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const result = await svc.selectPath(req.params.id, req.user!.id, value.branchPath);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function switchPath(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = selectPathSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const result = await svc.switchPath(req.params.id, req.user!.id, value.branchPath);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
