import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockQuery: any = jest.fn();
const mockSignJwt: any = jest.fn();
const mockParseDuration: any = jest.fn();
const mockHashPassword: any = jest.fn();
const mockVerifyPassword: any = jest.fn();
const mockGenerateToken: any = jest.fn();
const mockHashToken: any = jest.fn();

jest.mock('../src/lib/db', () => ({
  pool: { query: mockQuery },
}));
jest.mock('../src/lib/jwt', () => ({
  signJwt: mockSignJwt,
  parseDuration: mockParseDuration,
}));
jest.mock('../src/lib/password', () => ({
  hashPassword: mockHashPassword,
  verifyPassword: mockVerifyPassword,
  generateToken: mockGenerateToken,
  hashToken: mockHashToken,
}));

import { register, login, refreshTokens, logout } from '../src/modules/auth/auth.service';

const actualJwt = jest.requireActual('../src/lib/jwt') as {
  parseDuration: (s: string) => number;
  signJwt: (payload: { sub: string; role: string }, expiresInSeconds: number) => string;
  verifyJwt: (token: string) => { sub: string; role: string };
};
const actualPassword = jest.requireActual('../src/lib/password') as {
  hashPassword: (password: string) => Promise<string>;
  verifyPassword: (password: string, stored: string) => Promise<boolean>;
  generateToken: () => string;
  hashToken: (token: string) => string;
};

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParseDuration.mockImplementation((s: string) => {
      if (s === '15m') return 900;
      if (s === '7d') return 604800;
      return 1;
    });
    mockSignJwt.mockReturnValue('access-token');
    mockGenerateToken.mockReturnValue('refresh-token');
    mockHashToken.mockReturnValue('refresh-token-hash');
  });

  it('register creates user and stores refresh token', async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'u1', email: 'a@test.com', role: 'learner' }] })
      .mockResolvedValueOnce({ rows: [] });
    mockHashPassword.mockResolvedValue('hashed-password');

    const out = await register('a@test.com', 'pass123', 'Alice');

    expect(out.user).toEqual({ id: 'u1', email: 'a@test.com', role: 'learner' });
    expect(out.tokens).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    expect(mockHashPassword).toHaveBeenCalledWith('pass123');
    expect(mockSignJwt).toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledTimes(3);
  });

  it('register rejects duplicate email', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'u1' }] });

    await expect(register('dup@test.com', 'x', 'Dup')).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('login succeeds with valid credentials', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'u1', email: 'a@test.com', role: 'learner', passwordHash: 'stored' }] })
      .mockResolvedValueOnce({ rows: [] });
    mockVerifyPassword.mockResolvedValue(true);

    const out = await login('a@test.com', 'pass123');

    expect(out.user).toEqual({ id: 'u1', email: 'a@test.com', role: 'learner' });
    expect(out.tokens.refreshToken).toBe('refresh-token');
    expect(mockVerifyPassword).toHaveBeenCalledWith('pass123', 'stored');
  });

  it('login rejects invalid credentials', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'u1', passwordHash: 'stored' }] });
    mockVerifyPassword.mockResolvedValue(false);

    await expect(login('a@test.com', 'wrong')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('refreshTokens rotates token on valid refresh token', async () => {
    const future = new Date(Date.now() + 60_000);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'rt1', userId: 'u1', expiresAt: future }] })
      .mockResolvedValueOnce({ rows: [{ id: 'u1', role: 'learner' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const tokens = await refreshTokens('plain-refresh');

    expect(tokens).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    expect(mockHashToken).toHaveBeenCalledWith('plain-refresh');
    expect(mockQuery).toHaveBeenCalledTimes(4);
  });

  it('refreshTokens rejects expired token', async () => {
    const past = new Date(Date.now() - 60_000);
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'rt1', userId: 'u1', expiresAt: past }] });

    await expect(refreshTokens('expired')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('logout deletes refresh token by user and hash', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    await logout('u1', 'plain-token');

    expect(mockHashToken).toHaveBeenCalledWith('plain-token');
    expect(mockQuery).toHaveBeenCalledWith(
      'DELETE FROM refresh_tokens WHERE "userId" = $1 AND "tokenHash" = $2',
      ['u1', 'refresh-token-hash'],
    );
  });
});

describe('jwt and password libs', () => {
  it('parseDuration parses supported units', () => {
    expect(actualJwt.parseDuration('15m')).toBe(900);
    expect(actualJwt.parseDuration('1h')).toBe(3600);
    expect(actualJwt.parseDuration('7d')).toBe(604800);
  });

  it('signJwt and verifyJwt roundtrip payload', () => {
    const token = actualJwt.signJwt({ sub: 'u1', role: 'learner' }, 60);
    const payload = actualJwt.verifyJwt(token);
    expect(payload.sub).toBe('u1');
    expect(payload.role).toBe('learner');
  });

  it('password hashing verifies correct password only', async () => {
    const hash = await actualPassword.hashPassword('my-pass');
    const ok = await actualPassword.verifyPassword('my-pass', hash);
    const bad = await actualPassword.verifyPassword('wrong-pass', hash);
    expect(ok).toBe(true);
    expect(bad).toBe(false);
  });

  it('generateToken and hashToken produce deterministic hash output length', () => {
    const token = actualPassword.generateToken();
    const digest = actualPassword.hashToken(token);
    expect(token.length).toBeGreaterThan(0);
    expect(digest).toHaveLength(64);
  });
});
