import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../lib/jwt';
import { ApiError } from '../utils/ApiError';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized());
  }

  const token = header.slice(7);
  try {
    const payload = verifyJwt(token);
    req.user = { id: payload.sub, email: '', role: payload.role };
    next();
  } catch {
    next(ApiError.unauthorized());
  }
}
