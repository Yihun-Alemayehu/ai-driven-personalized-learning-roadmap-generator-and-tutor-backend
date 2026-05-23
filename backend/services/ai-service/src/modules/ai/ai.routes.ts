import { Router } from 'express';
import * as ctrl from './ai.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI quiz and explanation generation (internal — called by learning-service)
 */

/**
 * @swagger
 * /ai/generate-quiz:
 *   post:
 *     summary: Generate quiz questions for a node (Ollama primary, Gemini fallback)
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nodeId, nodeTitle, learningOutcomes]
 *             properties:
 *               nodeId:
 *                 type: string
 *               nodeTitle:
 *                 type: string
 *               description:
 *                 type: string
 *               learningOutcomes:
 *                 type: array
 *                 items:
 *                   type: string
 *               difficultyLevel:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               questionCount:
 *                 type: integer
 *                 default: 4
 *     responses:
 *       200:
 *         description: Generated quiz (null if both providers failed)
 */
router.post('/generate-quiz', ctrl.generateQuiz);

/**
 * @swagger
 * /ai/generate-explanation:
 *   post:
 *     summary: Generate a learning explanation for a node
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nodeId, nodeTitle, learningOutcomes]
 *     responses:
 *       200:
 *         description: Generated explanation (null if both providers failed)
 */
router.post('/generate-explanation', ctrl.generateExplanation);

/**
 * @swagger
 * /ai/generate-micro-quiz:
 *   post:
 *     summary: Generate 2-3 spaced-repetition questions for a decaying node
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nodeId, nodeTitle, learningOutcomes]
 *     responses:
 *       200:
 *         description: Micro-quiz questions (null if generation failed)
 */
router.post('/generate-micro-quiz', ctrl.generateMicroQuiz);

/**
 * @swagger
 * /ai/ask-question:
 *   post:
 *     summary: Ask the AI instructor a question about a node
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nodeId, nodeTitle, question]
 *             properties:
 *               nodeId: { type: string }
 *               nodeTitle: { type: string }
 *               question: { type: string }
 *               description: { type: string }
 *               learningOutcomes: { type: array, items: { type: string } }
 *               explanation: { type: object }
 *     responses:
 *       200:
 *         description: AI instructor answer
 */
router.post('/ask-question', ctrl.askQuestion);

/**
 * @swagger
 * /ai/health:
 *   get:
 *     summary: AI service health — Ollama reachability and circuit breaker state
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Health status of Ollama and Gemini
 */
/**
 * @swagger
 * /ai/cache/remedial/{nodeId}:
 *   delete:
 *     summary: Invalidate remedial quiz cache entries for a node
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: nodeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Number of cache entries deleted
 */
router.delete('/cache/remedial/:nodeId', ctrl.invalidateCache);

router.get('/health', ctrl.healthDetail);

export default router;
