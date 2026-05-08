import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../lib/jwt';
import { ApiError } from '../utils/ApiError';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return next(ApiError.unauthorized());
  try {
    const payload = verifyJwt(auth.slice(7));
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(ApiError.unauthorized());
  }
}
