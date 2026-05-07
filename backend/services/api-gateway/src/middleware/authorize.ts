import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import type { UserRole } from '../modules/auth/auth.types';

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role as UserRole)) return next(ApiError.forbidden());
    next();
  };
}
