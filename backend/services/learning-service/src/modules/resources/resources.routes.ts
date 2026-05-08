import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as ctrl from './resources.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: Learning resources for nodes — CRUD, ratings, and PSE discovery
 */

/**
 * @swagger
 * /nodes/{nodeId}/resources:
 *   get:
 *     summary: Get resources for a node (sorted by rating)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nodeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Array of resources sorted by isPrimary then avgRating
 *       404:
 *         description: Node not found
 */
router.get('/nodes/:nodeId/resources', authenticate, ctrl.getResources);

/**
 * @swagger
 * /nodes/{nodeId}/resources/discover:
 *   post:
 *     summary: Trigger Google PSE search to discover resources for a node
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nodeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Newly discovered resources (cached 24h)
 *       404:
 *         description: Node not found
 */
router.post('/nodes/:nodeId/resources/discover', authenticate, ctrl.discoverResources);

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Manually add a resource (admin/domain_expert)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nodeId, title, url, sourceDomain, modality]
 *             properties:
 *               nodeId:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *                 format: uri
 *               sourceDomain:
 *                 type: string
 *               modality:
 *                 type: string
 *                 enum: [documentation, tutorial, video, interactive, reference]
 *               description:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Resource created
 *       409:
 *         description: URL already exists for this node
 */
router.post('/resources', authenticate, authorize('admin', 'domain_expert'), ctrl.createResource);

/**
 * @swagger
 * /resources/{id}:
 *   patch:
 *     summary: Update a resource (admin/domain_expert)
 *     tags: [Resources]
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
 *       200:
 *         description: Updated resource
 *       404:
 *         description: Not found
 */
router.patch('/resources/:id', authenticate, authorize('admin', 'domain_expert'), ctrl.updateResource);

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: Delete a resource (admin)
 *     tags: [Resources]
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
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/resources/:id', authenticate, authorize('admin'), ctrl.deleteResource);

/**
 * @swagger
 * /resources/{id}/rate:
 *   post:
 *     summary: Rate a resource 1-5 (learner)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated avgRating and ratingCount
 *       404:
 *         description: Resource not found
 */
router.post('/resources/:id/rate', authenticate, ctrl.rateResource);

/**
 * @swagger
 * /resources/validate-links:
 *   post:
 *     summary: Trigger bulk HTTP HEAD validation for all stored resources (admin)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary with checked and invalid counts
 */
router.post('/resources/validate-links', authenticate, authorize('admin'), ctrl.validateLinks);

export default router;
