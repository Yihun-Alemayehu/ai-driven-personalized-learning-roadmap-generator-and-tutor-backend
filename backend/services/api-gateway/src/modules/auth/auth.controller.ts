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

export function googleRedirect(_req: Request, res: Response): void {
  const params = new URLSearchParams({
    client_id: config.oauth.google.clientId,
    redirect_uri: config.oauth.google.callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

export async function googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const code = req.query.code as string;
    if (!code) throw ApiError.badRequest('Missing OAuth code');
    const { tokens } = await authService.handleGoogleCallback(code);
    // Redirect to frontend with tokens in query params (or set httpOnly cookie — kept simple here)
    res.redirect(
      `${config.oauth.frontendCallbackUrl}?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  } catch (err) {
    next(err);
  }
}

export function githubRedirect(_req: Request, res: Response): void {
  const params = new URLSearchParams({
    client_id: config.oauth.github.clientId,
    redirect_uri: config.oauth.github.callbackUrl,
    scope: 'user:email',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}

export async function githubCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const code = req.query.code as string;
    if (!code) throw ApiError.badRequest('Missing OAuth code');
    const { tokens } = await authService.handleGithubCallback(code);
    res.redirect(
      `${config.oauth.frontendCallbackUrl}?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  } catch (err) {
    next(err);
  }
}
