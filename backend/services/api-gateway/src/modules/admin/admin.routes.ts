import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as ctrl from './admin.controller';

const router = Router();

router.use(authenticate, authorize('admin'));

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users (paginated, filterable by role)
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
 *           enum: [learner, domain_expert, admin]
 *     responses:
 *       200:
 *         description: Paginated user list
 *       403: { description: Admin only }
 */
router.get('/users', ctrl.listUsers);

/**
 * @openapi
 * /admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Change user role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [learner, domain_expert, admin]
 *     responses:
 *       200:
 *         description: Updated user with new role
 *       400:
 *         description: Cannot change own role
 *       404:
 *         description: User not found
 */
router.patch('/users/:id/role', ctrl.changeUserRole);

/**
 * @openapi
 * /admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: User deleted
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', ctrl.deleteUser);

export default router;
