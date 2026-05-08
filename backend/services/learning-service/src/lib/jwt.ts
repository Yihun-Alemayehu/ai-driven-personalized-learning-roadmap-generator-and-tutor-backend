import crypto from 'crypto';
import config from '../config';

export interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

function b64urlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf8');
}

function sign(data: string): string {
  return crypto.createHmac('sha256', config.jwt.secret).update(data).digest('base64url');
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
