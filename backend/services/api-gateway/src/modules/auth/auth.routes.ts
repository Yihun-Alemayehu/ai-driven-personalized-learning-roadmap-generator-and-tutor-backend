import { Router } from 'express';
import { authLimiter } from '../../middleware/rateLimiter';
import { authenticate } from '../../middleware/authenticate';
import * as ctrl from './auth.controller';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, fullName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               fullName: { type: string }
 *     responses:
 *       201:
 *         description: Registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400: { description: Validation error }
 *       409: { description: Email already registered }
 */
router.post('/register', authLimiter, ctrl.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401: { description: Invalid credentials }
 */
router.post('/login', authLimiter, ctrl.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a refresh token for a new access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New token pair
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenPair'
 *       401: { description: Invalid or expired refresh token }
 */
router.post('/refresh', ctrl.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke refresh token
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       204: { description: Logged out }
 *       401: { description: Unauthorized }
 */
router.post('/logout', authenticate, ctrl.logout);

/**
 * @openapi
 * /auth/oauth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Initiate Google OAuth2 flow
 *     responses:
 *       302: { description: Redirect to Google consent screen }
 */
router.get('/oauth/google', ctrl.googleRedirect);

/**
 * @openapi
 * /auth/oauth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Google OAuth2 callback
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       302: { description: Redirect to frontend with tokens }
 *       400: { description: Missing code }
 */
router.get('/oauth/google/callback', ctrl.googleCallback);

/**
 * @openapi
 * /auth/oauth/github:
 *   get:
 *     tags: [Auth]
 *     summary: Initiate GitHub OAuth2 flow
 *     responses:
 *       302: { description: Redirect to GitHub consent screen }
 */
router.get('/oauth/github', ctrl.githubRedirect);

/**
 * @openapi
 * /auth/oauth/github/callback:
 *   get:
 *     tags: [Auth]
 *     summary: GitHub OAuth2 callback
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       302: { description: Redirect to frontend with tokens }
 *       400: { description: Missing code }
 */
router.get('/oauth/github/callback', ctrl.githubCallback);

export default router;
