import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as ctrl from './users.controller';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401: { description: Unauthorized }
 */
router.get('/me', ctrl.getMe);

/**
 * @openapi
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               avatarUrl: { type: string, format: uri, nullable: true }
 *               preferredLanguage: { type: string, minLength: 2, maxLength: 2 }
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 */
router.patch('/me', ctrl.updateMe);

/**
 * @openapi
 * /users/me/change-password:
 *   post:
 *     tags: [Users]
 *     summary: Change current user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmPassword]
 *             properties:
 *               currentPassword: { type: string, minLength: 8 }
 *               newPassword: { type: string, minLength: 8 }
 *               confirmPassword: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password changed
 *       400: { description: Validation error }
 *       401: { description: Unauthorized or wrong current password }
 */
router.post('/me/change-password', ctrl.changeMyPassword);

/**
 * @openapi
 * /users/me:
 *   delete:
 *     tags: [Users]
 *     summary: Delete current user account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Account deleted
 *       400:
 *         description: Account cannot be deleted due to ownership constraints
 *       401: { description: Unauthorized }
 */
router.delete('/me', ctrl.deleteMe);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: User not found }
 */
router.get('/:id', authorize('admin'), ctrl.getUserById);

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List users with pagination (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [learner, instructor, admin, domain_expert]
 *     responses:
 *       200:
 *         description: Paginated user list
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get('/', authorize('admin'), ctrl.listUsers);

export default router;
