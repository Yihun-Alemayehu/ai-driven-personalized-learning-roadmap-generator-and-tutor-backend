import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as ctrl from './admin.controller';

const router = Router();

router.use(authenticate, authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: System statistics and admin tools (admin role required)
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: System-wide statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User count, enrollment count, quiz attempt stats, mastery breakdown
 */
router.get('/stats', ctrl.getSystemStats);

/**
 * @swagger
 * /admin/stats/domains:
 *   get:
 *     summary: Per-domain statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enrollments, completion rates, avg quiz scores per domain
 */
router.get('/stats/domains', ctrl.getDomainStats);

/**
 * @swagger
 * /admin/adaptation-events:
 *   get:
 *     summary: List adaptation events (filterable by type and date range)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [resource_swap, prerequisite_review, instructor_escalation, decay_micro_quiz]
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Paginated adaptation events
 */
router.get('/adaptation-events', ctrl.listAdaptationEvents);

/**
 * @swagger
 * /admin/flagged-nodes:
 *   get:
 *     summary: Nodes flagged for instructor review (instructor_escalation events)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Flagged events with user and node details
 */
router.get('/flagged-nodes', ctrl.getFlaggedNodes);

export default router;
