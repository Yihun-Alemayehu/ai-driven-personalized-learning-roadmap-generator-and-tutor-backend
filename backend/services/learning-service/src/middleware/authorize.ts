import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

type Role = 'learner' | 'instructor' | 'admin' | 'domain_expert';

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      return next(ApiError.forbidden());
    }
    next();
  };
}
