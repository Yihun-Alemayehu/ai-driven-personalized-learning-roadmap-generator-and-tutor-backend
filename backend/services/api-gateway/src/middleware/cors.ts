import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

const isDev = process.env.NODE_ENV !== 'production';

// In dev, allow any localhost port so the Vite dev server can use any available port.
// In production, only the explicit allowlist is accepted.
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

function isAllowed(origin: string): boolean {
  if (allowedOrigins.includes(origin)) return true;
  if (isDev && /^http:\/\/localhost:\d+$/.test(origin)) return true;
  return false;
}

const _cors = cors({
  origin: (origin, cb) => {
    if (!origin || isAllowed(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

export function corsOptions(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  if (!origin) return next();
  if (!isAllowed(origin)) {
    res.status(403).json({ error: { message: 'CORS: origin not allowed' } });
    return;
  }
  _cors(req, res, next);
}
