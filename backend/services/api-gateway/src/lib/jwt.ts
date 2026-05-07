import crypto from 'crypto';
import config from '../config';

export interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

function b64url(str: string): string {
  return Buffer.from(str).toString('base64url');
}

function b64urlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf8');
}

function sign(data: string): string {
  return crypto.createHmac('sha256', config.jwt.secret).update(data).digest('base64url');
}

export function signJwt(
  payload: Pick<JwtPayload, 'sub' | 'role'>,
  expiresInSeconds: number,
): string {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = b64url(JSON.stringify({ ...payload, iat: now, exp: now + expiresInSeconds }));
  return `${header}.${body}.${sign(`${header}.${body}`)}`;
}

export function verifyJwt(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed token');

  const [header, body, sig] = parts;
  const expected = sign(`${header}.${body}`);

  const a = Buffer.from(sig, 'base64url');
  const b = Buffer.from(expected, 'base64url');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error('Invalid signature');
  }

  const decoded = JSON.parse(b64urlDecode(body)) as JwtPayload;
  if (decoded.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return decoded;
}

/** Parse duration strings like '15m', '7d', '1h' into seconds. */
export function parseDuration(s: string): number {
  const m = s.match(/^(\d+)(s|m|h|d)$/);
  if (!m) throw new Error(`Invalid duration: ${s}`);
  const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return parseInt(m[1], 10) * units[m[2]];
}
