import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as ctrl from './instructor.controller';

const router = Router();

router.use(authenticate, authorize('domain_expert', 'admin'));

/**
 * @swagger
 * tags:
 *   name: Instructor
 *   description: Learner progress views and class management (domain_expert/admin role required)
 */

/**
 * @swagger
 * /instructor/learners:
 *   get:
 *     summary: List learners (optionally filtered by domain)
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: domainId
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Paginated list of learner enrollments
 */
router.get('/learners', ctrl.listLearners);

/**
 * @swagger
 * /instructor/learners/{userId}/progress:
 *   get:
 *     summary: View a learner's full node progress across all enrollments
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Full progress detail for the learner
 *       404:
 *         description: User not found
 */
router.get('/learners/:userId/progress', ctrl.getLearnerProgress);

/**
 * @swagger
 * /instructor/learners/{userId}/quiz-history:
 *   get:
 *     summary: View a learner's quiz attempt history
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Learner quiz attempt history
 */
router.get('/learners/:userId/quiz-history', ctrl.getLearnerQuizHistory);

/**
 * @swagger
 * /instructor/domains/{domainId}/analytics:
 *   get:
 *     summary: Domain analytics — per-node mastery rates, problem nodes, avg scores
 *     tags: [Instructor]
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
 *         description: Domain analytics with problem nodes identified
 *       404:
 *         description: Domain not found
 */
router.get('/domains/:domainId/analytics', ctrl.getDomainAnalytics);

/**
 * @swagger
 * /instructor/flagged:
 *   get:
 *     summary: List flagged nodes (instructor_escalation events)
 *     tags: [Instructor]
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
 *         description: Flagged escalation events for review
 */
router.get('/flagged', ctrl.getFlaggedEvents);

/**
 * @swagger
 * /instructor/flagged/{eventId}/resolve:
 *   patch:
 *     summary: Mark a flagged event as resolved with notes
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
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
 *             required: [resolutionNotes]
 *             properties:
 *               resolutionNotes:
 *                 type: string
 *                 description: Notes about how the issue was resolved
 *     responses:
 *       200:
 *         description: Event resolved; resolution data stored in details
 *       400:
 *         description: Event is not an instructor_escalation type
 *       404:
 *         description: Event not found
 */
router.patch('/flagged/:eventId/resolve', ctrl.resolveFlaggedEvent);

export default router;
