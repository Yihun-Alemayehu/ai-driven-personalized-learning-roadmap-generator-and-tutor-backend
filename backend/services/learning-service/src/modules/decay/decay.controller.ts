import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import * as svc from './decay.service';
import { ApiError } from '../../utils/ApiError';

const microQuizAttemptSchema = Joi.object({
  enrollmentId: Joi.string().uuid().required(),
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().uuid().required(),
        answer: Joi.string().min(1).required(),
      }),
    )
    .min(1)
    .required(),
  startedAt: Joi.string().isoDate().required(),
});

export async function getDecayStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const status = await svc.getDecayStatus(req.params.id, req.user!.id);
    res.json({ decayStatus: status });
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
    const quiz = await svc.generateMicroQuiz(req.params.nodeId, req.user!.id);
    res.status(201).json({ quiz });
  } catch (err) {
    next(err);
  }
}

export async function submitMicroQuizAttempt(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = microQuizAttemptSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const result = await svc.submitMicroQuizAttempt(req.user!.id, req.params.quizId, value);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
