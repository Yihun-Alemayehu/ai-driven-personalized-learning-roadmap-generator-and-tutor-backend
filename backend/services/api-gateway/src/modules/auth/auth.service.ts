import superagent from 'superagent';
import { pool } from '../../lib/db';
import { signJwt, parseDuration } from '../../lib/jwt';
import { hashPassword, verifyPassword, generateToken, hashToken } from '../../lib/password';
import { ApiError } from '../../utils/ApiError';
import config from '../../config';
import type { UserRecord, TokenPair } from './auth.types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function issueTokens(userId: string, role: string): TokenPair {
  const accessToken = signJwt(
    { sub: userId, role },
    parseDuration(config.jwt.expiresIn),
  );
  const refreshToken = generateToken();
  return { accessToken, refreshToken };
}

async function storeRefreshToken(userId: string, plainToken: string): Promise<void> {
  const expiresAt = new Date(Date.now() + parseDuration(config.jwt.refreshExpiresIn) * 1000);
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hashToken(plainToken), expiresAt],
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function register(
  email: string,
  password: string,
  fullName: string,
): Promise<{ user: Pick<UserRecord, 'id' | 'email' | 'role'>; tokens: TokenPair }> {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount && existing.rowCount > 0) {
    throw ApiError.conflict('Email already registered');
  }

  const passwordHash = await hashPassword(password);
  const { rows } = await pool.query<Pick<UserRecord, 'id' | 'email' | 'role'>>(
    `INSERT INTO users (email, password_hash, full_name)
     VALUES ($1, $2, $3)
     RETURNING id, email, role`,
    [email, passwordHash, fullName],
  );
  const user = rows[0];

  const tokens = issueTokens(user.id, user.role);
  await storeRefreshToken(user.id, tokens.refreshToken);
  return { user, tokens };
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: Pick<UserRecord, 'id' | 'email' | 'role'>; tokens: TokenPair }> {
  const { rows } = await pool.query<Pick<UserRecord, 'id' | 'email' | 'role' | 'password_hash'>>(
    'SELECT id, email, role, password_hash FROM users WHERE email = $1',
    [email],
  );

  const user = rows[0];
  const validCredentials =
    user?.password_hash != null && (await verifyPassword(password, user.password_hash));

  // Same 401 for both "no user" and "wrong password" — no user enumeration
  if (!validCredentials) throw ApiError.unauthorized('Invalid credentials');

  const tokens = issueTokens(user.id, user.role);
  await storeRefreshToken(user.id, tokens.refreshToken);
  return { user: { id: user.id, email: user.email, role: user.role }, tokens };
}

export async function refreshTokens(plainToken: string): Promise<TokenPair> {
  const hash = hashToken(plainToken);
  const { rows } = await pool.query<{ id: string; user_id: string; expires_at: Date }>(
    'SELECT id, user_id, expires_at FROM refresh_tokens WHERE token_hash = $1',
    [hash],
  );

  const record = rows[0];
  if (!record || record.expires_at < new Date()) throw ApiError.unauthorized('Invalid or expired refresh token');

  const { rows: userRows } = await pool.query<Pick<UserRecord, 'id' | 'role'>>(
    'SELECT id, role FROM users WHERE id = $1',
    [record.user_id],
  );
  const user = userRows[0];
  if (!user) throw ApiError.unauthorized('User not found');

  // Rotate: delete old token, issue new pair
  await pool.query('DELETE FROM refresh_tokens WHERE id = $1', [record.id]);
  const tokens = issueTokens(user.id, user.role);
  await storeRefreshToken(user.id, tokens.refreshToken);
  return tokens;
}

export async function logout(userId: string, plainToken: string): Promise<void> {
  await pool.query(
    'DELETE FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2',
    [userId, hashToken(plainToken)],
  );
}

// ── OAuth ─────────────────────────────────────────────────────────────────────

interface OAuthProfile {
  provider: string;
  providerId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

async function findOrCreateOAuthUser(
  profile: OAuthProfile,
): Promise<{ user: Pick<UserRecord, 'id' | 'email' | 'role'>; tokens: TokenPair }> {
  // 1. Try to find existing OAuth-linked user
  const { rows: existing } = await pool.query<Pick<UserRecord, 'id' | 'email' | 'role'>>(
    'SELECT id, email, role FROM users WHERE oauth_provider = $1 AND oauth_provider_id = $2',
    [profile.provider, profile.providerId],
  );

  let user = existing[0];

  if (!user) {
    // 2. Try to find by email and link the OAuth account
    const { rows: byEmail } = await pool.query<Pick<UserRecord, 'id' | 'email' | 'role'>>(
      'SELECT id, email, role FROM users WHERE email = $1',
      [profile.email],
    );
    if (byEmail[0]) {
      await pool.query(
        'UPDATE users SET oauth_provider = $1, oauth_provider_id = $2, updated_at = NOW() WHERE id = $3',
        [profile.provider, profile.providerId, byEmail[0].id],
      );
      user = byEmail[0];
    } else {
      // 3. Create new user
      const { rows: created } = await pool.query<Pick<UserRecord, 'id' | 'email' | 'role'>>(
        `INSERT INTO users (email, full_name, oauth_provider, oauth_provider_id, avatar_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, role`,
        [profile.email, profile.fullName, profile.provider, profile.providerId, profile.avatarUrl],
      );
      user = created[0];
    }
  }

  const tokens = issueTokens(user.id, user.role);
  await storeRefreshToken(user.id, tokens.refreshToken);
  return { user, tokens };
}

export async function handleGoogleCallback(
  code: string,
): Promise<{ user: Pick<UserRecord, 'id' | 'email' | 'role'>; tokens: TokenPair }> {
  const tokenRes = await superagent
    .post('https://oauth2.googleapis.com/token')
    .type('form')
    .send({
      code,
      client_id: config.oauth.google.clientId,
      client_secret: config.oauth.google.clientSecret,
      redirect_uri: config.oauth.google.callbackUrl,
      grant_type: 'authorization_code',
    });

  const userRes = await superagent
    .get('https://www.googleapis.com/oauth2/v2/userinfo')
    .set('Authorization', `Bearer ${tokenRes.body.access_token as string}`);

  const g = userRes.body as { id: string; email: string; name: string; picture: string };
  return findOrCreateOAuthUser({
    provider: 'google',
    providerId: g.id,
    email: g.email,
    fullName: g.name,
    avatarUrl: g.picture ?? null,
  });
}

export async function handleGithubCallback(
  code: string,
): Promise<{ user: Pick<UserRecord, 'id' | 'email' | 'role'>; tokens: TokenPair }> {
  const tokenRes = await superagent
    .post('https://github.com/login/oauth/access_token')
    .accept('application/json')
    .send({
      client_id: config.oauth.github.clientId,
      client_secret: config.oauth.github.clientSecret,
      code,
    });

  const accessToken = tokenRes.body.access_token as string;

  const [userRes, emailsRes] = await Promise.all([
    superagent
      .get('https://api.github.com/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('User-Agent', 'learner-roadmap-app'),
    superagent
      .get('https://api.github.com/user/emails')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('User-Agent', 'learner-roadmap-app'),
  ]);

  const gh = userRes.body as { id: number; name: string; avatar_url: string; login: string };
  const emails = emailsRes.body as { email: string; primary: boolean; verified: boolean }[];
  const primaryEmail = emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email;

  if (!primaryEmail) throw ApiError.badRequest('GitHub account has no accessible email');

  return findOrCreateOAuthUser({
    provider: 'github',
    providerId: String(gh.id),
    email: primaryEmail,
    fullName: gh.name ?? gh.login,
    avatarUrl: gh.avatar_url ?? null,
  });
}
