import crypto from 'crypto';

const KEY_LEN = 64;
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 };

export function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LEN, SCRYPT_OPTS, (err, key) => {
      if (err) reject(err);
      else resolve(`${salt}:${key.toString('hex')}`);
    });
  });
}

export function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LEN, SCRYPT_OPTS, (err, key) => {
      if (err) reject(err);
      else {
        try {
          resolve(crypto.timingSafeEqual(Buffer.from(hash, 'hex'), key));
        } catch {
          resolve(false);
        }
      }
    });
  });
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** SHA-256 hash of a random token — safe because input is already high-entropy. */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
