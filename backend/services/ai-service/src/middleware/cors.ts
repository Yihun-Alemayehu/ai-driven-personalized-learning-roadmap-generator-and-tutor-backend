import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

const _cors = cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

export function corsOptions(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  // Server-to-server calls (no Origin header) are always allowed
  if (!origin) return next();
  // Block disallowed browser origins before cors middleware can pass through
  if (!allowedOrigins.includes(origin)) {
    res.status(403).json({ error: { message: 'CORS: origin not allowed' } });
    return;
  }
  _cors(req, res, next);
}
