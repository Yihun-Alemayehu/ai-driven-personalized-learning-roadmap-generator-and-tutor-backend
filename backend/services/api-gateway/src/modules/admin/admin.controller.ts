import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import * as svc from './admin.service';
import { ApiError } from '../../utils/ApiError';
import { listUsersSchema } from '../users/users.validation';

const changeRoleSchema = Joi.object({
  role: Joi.string()
    .valid('learner', 'instructor', 'admin', 'domain_expert')
    .required(),
});

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = listUsersSchema.validate(req.query);
    if (error) return next(ApiError.badRequest(error.message));
    const { users, total } = await svc.listUsers(value.page, value.limit, value.role);
    res.json({ users, total, page: value.page, limit: value.limit });
  } catch (err) {
    next(err);
  }
}

export async function changeUserRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { error, value } = changeRoleSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const user = await svc.changeUserRole(req.user!.id, req.params.id, value.role);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await svc.deleteUser(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
