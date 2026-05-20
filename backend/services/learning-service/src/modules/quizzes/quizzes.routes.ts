import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as ctrl from './quizzes.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Quizzes
 *   description: Quiz retrieval, attempt submission, and challenge projects
 */

/**
 * @swagger
 * /nodes/{nodeId}/quiz:
 *   get:
 *     summary: Get the quiz for a node (correct answers hidden)
 *     tags: [Quizzes]
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
 *         description: Quiz with questions (no correctAnswer field)
 *       403:
 *         description: Not enrolled or node is locked
 *       404:
 *         description: No quiz found for this node
 */
router.get('/nodes/:nodeId/quiz', authenticate, ctrl.getQuizForNode);

/**
 * @swagger
 * /quizzes/{quizId}/attempt:
 *   post:
 *     summary: Submit a quiz attempt and receive the Gatekeeper outcome
 *     tags: [Quizzes]
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
 *                   required: [questionId, answer]
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
 *         description: Attempt scored; includes gatekeeper result and optional challenge project
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not enrolled or node locked
 */
router.post('/quizzes/:quizId/attempt', authenticate, ctrl.submitAttempt);

/**
 * @swagger
 * /quiz-attempts:
 *   get:
 *     summary: List my quiz attempts (filterable by nodeId)
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nodeId
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
 *         description: Array of attempt summaries
 */
router.get('/quiz-attempts', authenticate, ctrl.listAttempts);

/**
 * @swagger
 * /quiz-attempts/{id}:
 *   get:
 *     summary: Get a specific quiz attempt with full answer details
 *     tags: [Quizzes]
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
 *         description: Full attempt record with adaptation events
 *       403:
 *         description: Not your attempt
 *       404:
 *         description: Not found
 */
router.get('/quiz-attempts/:id', authenticate, ctrl.getAttempt);

/**
 * @swagger
 * /nodes/{nodeId}/challenge:
 *   get:
 *     summary: Get the challenge project for a mastered node
 *     tags: [Quizzes]
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
 *         description: Challenge project details
 *       403:
 *         description: Node not yet mastered
 *       404:
 *         description: No challenge project for this node
 */
router.get('/nodes/:nodeId/challenge', authenticate, ctrl.getChallengeProject);

/**
 * @swagger
 * /nodes/{nodeId}/explanation:
 *   get:
 *     summary: Get AI-generated explanation for a node (Ollama primary, Gemini fallback)
 *     tags: [Quizzes]
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
 *         description: AI explanation with summary, key points, and common mistakes
 *       403:
 *         description: Node is locked
 */
router.get('/nodes/:nodeId/explanation', authenticate, ctrl.getNodeExplanation);

/**
 * @swagger
 * /nodes/{nodeId}/ask:
 *   post:
 *     summary: Ask the AI instructor a question about a node
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nodeId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question: { type: string }
 *               explanation: { type: object }
 *     responses:
 *       200:
 *         description: AI instructor answer
 *       403:
 *         description: Node is locked
 */
router.post('/nodes/:nodeId/ask', authenticate, ctrl.askNodeQuestion);

export default router;
