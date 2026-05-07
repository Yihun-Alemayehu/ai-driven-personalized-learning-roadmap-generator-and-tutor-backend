import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import * as usersService from './users.service';
import { ApiError } from '../../utils/ApiError';
import { updateMeSchema, listUsersSchema } from './users.validation';

function validate<T>(schema: Joi.ObjectSchema<T>, data: unknown): T {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) throw ApiError.badRequest('Validation error', error.details.map((d) => d.message));
  return value as T;
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await usersService.getById(req.user!.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validate(updateMeSchema, req.body);
    const user = await usersService.updateMe(req.user!.id, {
      fullName: data.fullName,
      avatarUrl: data.avatarUrl,
      preferredLanguage: data.preferredLanguage,
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await usersService.getById(req.params.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, role } = validate(listUsersSchema, req.query);
    const { users, total } = await usersService.listUsers(page, limit, role);
    res.json({ users, total, page, limit });
  } catch (err) {
    next(err);
  }
}
