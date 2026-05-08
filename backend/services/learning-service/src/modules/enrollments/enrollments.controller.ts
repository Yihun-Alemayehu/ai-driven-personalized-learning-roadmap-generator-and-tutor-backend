import { Request, Response, NextFunction } from 'express';
import * as svc from './enrollments.service';
import { enrollSchema } from './enrollments.validation';
import { ApiError } from '../../utils/ApiError';

export async function enroll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error, value } = enrollSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const result = await svc.enroll(req.user!.id, value);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const enrollments = await svc.listEnrollments(req.user!.id);
    res.json({ enrollments });
  } catch (err) {
    next(err);
  }
}

export async function getEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const enrollment = await svc.getEnrollment(req.params.id, req.user!.id);
    res.json({ enrollment });
  } catch (err) {
    next(err);
  }
}

export async function unenroll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await svc.unenroll(req.params.id, req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
