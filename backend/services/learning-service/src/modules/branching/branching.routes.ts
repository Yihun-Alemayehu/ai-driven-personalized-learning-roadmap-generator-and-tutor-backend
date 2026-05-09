import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as ctrl from './branching.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Branching
 *   description: Multi-path branching, path selection and roadmap filtering
 */

/**
 * @swagger
 * /enrollments/{id}/branching-points:
 *   get:
 *     summary: Get reachable branching points and their path options
 *     tags: [Branching]
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
 *         description: Branching points with path options and learner reach status
 *       404:
 *         description: Enrollment not found
 */
router.get('/enrollments/:id/branching-points', authenticate, ctrl.getBranchingPoints);

/**
 * @swagger
 * /enrollments/{id}/available-paths:
 *   get:
 *     summary: Get available branch paths with node counts and estimated hours
 *     tags: [Branching]
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
 *         description: Available paths with metadata
 */
router.get('/enrollments/:id/available-paths', authenticate, ctrl.getAvailablePaths);

/**
 * @swagger
 * /enrollments/{id}/select-path:
 *   post:
 *     summary: Select a branch path (frontend / backend / data_science)
 *     tags: [Branching]
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
 *             required: [branchPath]
 *             properties:
 *               branchPath:
 *                 type: string
 *                 enum: [frontend, backend, data_science]
 *     responses:
 *       200:
 *         description: Path selected; roadmap will now be filtered to this path
 *       400:
 *         description: Prerequisites not met or invalid branchPath
 */
router.post('/enrollments/:id/select-path', authenticate, ctrl.selectPath);

/**
 * @swagger
 * /enrollments/{id}/switch-path:
 *   post:
 *     summary: Switch to a different branch path (validates prerequisites)
 *     tags: [Branching]
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
 *             required: [branchPath]
 *             properties:
 *               branchPath:
 *                 type: string
 *                 enum: [frontend, backend, data_science]
 *     responses:
 *       200:
 *         description: Path switched
 *       400:
 *         description: Prerequisites not met for new path
 */
router.post('/enrollments/:id/switch-path', authenticate, ctrl.switchPath);

export default router;
