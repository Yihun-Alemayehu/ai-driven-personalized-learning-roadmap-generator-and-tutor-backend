import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as ctrl from './whitelist.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Whitelist
 *   description: Domain resource source whitelist management
 */

/**
 * @swagger
 * /domains/{domainId}/whitelist:
 *   get:
 *     summary: List whitelisted resource sources for a domain
 *     tags: [Whitelist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: domainId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Array of whitelist entries
 *       404:
 *         description: Domain not found
 */
router.get('/domains/:domainId/whitelist', authenticate, ctrl.listWhitelist);

/**
 * @swagger
 * /domains/{domainId}/whitelist:
 *   post:
 *     summary: Add a source domain to the whitelist (admin/domain_expert)
 *     tags: [Whitelist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: domainId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sourceDomain, sourceName, defaultModality]
 *             properties:
 *               sourceDomain:
 *                 type: string
 *               sourceName:
 *                 type: string
 *               defaultModality:
 *                 type: string
 *                 enum: [documentation, tutorial, video, interactive, reference]
 *     responses:
 *       201:
 *         description: Whitelist entry created
 *       409:
 *         description: Source domain already whitelisted
 */
router.post('/domains/:domainId/whitelist', authenticate, authorize('admin', 'domain_expert'), ctrl.addToWhitelist);

/**
 * @swagger
 * /whitelist/{id}:
 *   delete:
 *     summary: Remove a whitelist entry (admin only)
 *     tags: [Whitelist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Removed
 *       404:
 *         description: Not found
 */
router.delete('/whitelist/:id', authenticate, authorize('admin'), ctrl.removeFromWhitelist);

export default router;
