import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as ctrl from './progress.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Progress
 *   description: Learner node progress and roadmap
 */

/**
 * @swagger
 * /enrollments/{id}/progress:
 *   get:
 *     summary: Get all node progress for an enrollment
 *     tags: [Progress]
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
 *         description: Array of node progress rows with node metadata
 *       403:
 *         description: Not your enrollment
 *       404:
 *         description: Not found
 */
router.get('/enrollments/:id/progress', authenticate, ctrl.getProgress);

/**
 * @swagger
 * /enrollments/{id}/progress/stats:
 *   get:
 *     summary: Get progress statistics for an enrollment
 *     tags: [Progress]
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
 *         description: Stats object with totalNodes, completedNodes, completionPercent, avgQuizScore, currentStreak, byState
 */
router.get('/enrollments/:id/progress/stats', authenticate, ctrl.getStats);

/**
 * @swagger
 * /enrollments/{id}/roadmap:
 *   get:
 *     summary: Get the ontology DAG overlaid with learner progress
 *     tags: [Progress]
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
 *         description: Object with nodes (including masteryState, unlocked, scores) and edges arrays
 */
router.get('/enrollments/:id/roadmap', authenticate, ctrl.getRoadmap);

/**
 * @swagger
 * /enrollments/{id}/timeline:
 *   get:
 *     summary: Get estimated completion timeline for an enrollment
 *     tags: [Progress]
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
 *         description: Timeline estimate with remaining hours, estimated weeks, and completion date
 */
router.get('/enrollments/:id/timeline', authenticate, ctrl.getTimeline);

export default router;
