import { Request, Response, NextFunction } from 'express';

function sanitize(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(/<[^>]*>/g, '').trim();
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = sanitize(v);
    return out;
  }
  return value;
}

export function inputSanitizer(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) req.body = sanitize(req.body);
  next();
}
