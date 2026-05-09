import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as ctrl from './decay.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Decay
 *   description: Mastery decay and spaced repetition micro-quizzes
 */

/**
 * @swagger
 * /enrollments/{id}/decay-status:
 *   get:
 *     summary: Get decay state for all mastered/decaying nodes in an enrollment
 *     tags: [Decay]
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
 *         description: List of nodes with their decay state and days until threshold
 *       403:
 *         description: Enrollment does not belong to caller
 *       404:
 *         description: Enrollment not found
 */
router.get('/enrollments/:id/decay-status', authenticate, ctrl.getDecayStatus);

/**
 * @swagger
 * /nodes/{nodeId}/micro-quiz:
 *   post:
 *     summary: Generate a micro-quiz (2-3 questions) for a decaying node
 *     tags: [Decay]
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
 *       201:
 *         description: Micro-quiz created (correct answers hidden)
 *       400:
 *         description: Node is not in a decay state
 *       403:
 *         description: Not enrolled for this node
 *       404:
 *         description: No quiz found for this node
 */
router.post('/nodes/:nodeId/micro-quiz', authenticate, ctrl.generateMicroQuiz);

/**
 * @swagger
 * /micro-quizzes/{quizId}/attempt:
 *   post:
 *     summary: Submit a micro-quiz attempt
 *     tags: [Decay]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
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
 *             required: [enrollmentId, answers, startedAt]
 *             properties:
 *               enrollmentId:
 *                 type: string
 *                 format: uuid
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       format: uuid
 *                     answer:
 *                       type: string
 *               startedAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Attempt scored; pass resets decay timer, fail re-locks node
 *       400:
 *         description: Not a micro-quiz
 *       403:
 *         description: Not enrolled or wrong enrollment
 *       404:
 *         description: Quiz not found
 */
router.post('/micro-quizzes/:quizId/attempt', authenticate, ctrl.submitMicroQuizAttempt);

export default router;
