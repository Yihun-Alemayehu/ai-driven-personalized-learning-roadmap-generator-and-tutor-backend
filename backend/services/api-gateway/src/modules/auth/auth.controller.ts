import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import * as authService from './auth.service';
import { ApiError } from '../../utils/ApiError';
import config from '../../config';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from './auth.validation';

// In-memory store for OAuth state parameters (maps state → redirectUri)
const oauthStateStore = new Map<string, { redirectUri: string; expiresAt: number }>();
const OAUTH_STATE_TTL = 10 * 60 * 1000; // 10 minutes

// Periodic cleanup of expired state entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of oauthStateStore) {
    if (value.expiresAt < now) oauthStateStore.delete(key);
  }
}, 60_000);

function validate<T>(schema: Joi.ObjectSchema<T>, data: unknown): T {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) throw ApiError.badRequest('Validation error', error.details.map((d) => d.message));
  return value as T;
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, fullName } = validate(registerSchema, req.body);
    const { user, tokens } = await authService.register(email, password, fullName);
    res.status(201).json({ user, ...tokens });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = validate(loginSchema, req.body);
    const { user, tokens } = await authService.login(email, password);
    res.json({ user, ...tokens });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = validate(refreshSchema, req.body);
    const tokens = await authService.refreshTokens(refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = validate(logoutSchema, req.body);
    await authService.logout(req.user!.id, refreshToken);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export function googleRedirect(req: Request, res: Response): void {
  if (!config.oauth.google.clientId) {
    throw ApiError.internal('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }

  const redirectUri = (req.query.redirect_uri as string) || config.oauth.frontendCallbackUrl;
  const state = crypto.randomBytes(16).toString('hex');
  oauthStateStore.set(state, { redirectUri, expiresAt: Date.now() + OAUTH_STATE_TTL });

  const params = new URLSearchParams({
    client_id: config.oauth.google.clientId,
    redirect_uri: config.oauth.google.callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    state,
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

export async function googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string | undefined;
    if (!code) throw ApiError.badRequest('Missing OAuth code');

    // Look up redirect URI from state store
    const stateData = state ? oauthStateStore.get(state) : undefined;
    const redirectTarget = stateData?.redirectUri || config.oauth.frontendCallbackUrl;
    if (state) oauthStateStore.delete(state);

    const { tokens } = await authService.handleGoogleCallback(code);
    res.redirect(
      `${redirectTarget}?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  } catch (err) {
    next(err);
  }
}

export function githubRedirect(req: Request, res: Response): void {
  if (!config.oauth.github.clientId) {
    throw ApiError.internal('GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.');
  }

  const redirectUri = (req.query.redirect_uri as string) || config.oauth.frontendCallbackUrl;
  const state = crypto.randomBytes(16).toString('hex');
  oauthStateStore.set(state, { redirectUri, expiresAt: Date.now() + OAUTH_STATE_TTL });

  const params = new URLSearchParams({
    client_id: config.oauth.github.clientId,
    redirect_uri: config.oauth.github.callbackUrl,
    scope: 'user:email',
    state,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}

export async function githubCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string | undefined;
    if (!code) throw ApiError.badRequest('Missing OAuth code');

    // Look up redirect URI from state store
    const stateData = state ? oauthStateStore.get(state) : undefined;
    const redirectTarget = stateData?.redirectUri || config.oauth.frontendCallbackUrl;
    if (state) oauthStateStore.delete(state);

    const { tokens } = await authService.handleGithubCallback(code);
    res.redirect(
      `${redirectTarget}?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  } catch (err) {
    next(err);
  }
}
