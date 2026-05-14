import { Request, Response, NextFunction } from 'express';

// Keys whose string values must not be HTML-stripped (quiz answers may contain HTML code snippets)
const PASS_THROUGH_KEYS = new Set(['answer', 'correctAnswer']);

function sanitize(value: unknown, key?: string): unknown {
  if (typeof value === 'string') {
    if (key && PASS_THROUGH_KEYS.has(key)) return value;
    return value.replace(/<[^>]*>/g, '').trim();
  }
  if (Array.isArray(value)) return value.map((v) => sanitize(v, key));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = sanitize(v, k);
    return out;
  }
  return value;
}

export function inputSanitizer(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) req.body = sanitize(req.body);
  next();
}
