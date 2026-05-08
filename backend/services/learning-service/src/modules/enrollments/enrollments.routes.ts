import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as ctrl from './enrollments.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Domain enrollment management
 */

/**
 * @swagger
 * /enrollments:
 *   post:
 *     summary: Enroll in a domain
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [domainId]
 *             properties:
 *               domainId:
 *                 type: string
 *                 format: uuid
 *               selectedBranchPath:
 *                 type: string
 *                 enum: [frontend, backend, data_science]
 *     responses:
 *       201:
 *         description: Enrolled successfully; returns enrollment and progress init counts
 *       400:
 *         description: No published ontology for domain
 *       409:
 *         description: Already enrolled
 */
router.post('/enrollments', authenticate, authorize('learner', 'instructor', 'admin'), ctrl.enroll);

/**
 * @swagger
 * /enrollments:
 *   get:
 *     summary: List my enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of enrollments with domain info
 */
router.get('/enrollments', authenticate, ctrl.listEnrollments);

/**
 * @swagger
 * /enrollments/{id}:
 *   get:
 *     summary: Get enrollment details
 *     tags: [Enrollments]
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
 *         description: Enrollment object
 *       403:
 *         description: Not your enrollment
 *       404:
 *         description: Not found
 */
router.get('/enrollments/:id', authenticate, ctrl.getEnrollment);

/**
 * @swagger
 * /enrollments/{id}:
 *   delete:
 *     summary: Unenroll — removes enrollment and all progress rows
 *     tags: [Enrollments]
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
 *         description: Unenrolled
 *       403:
 *         description: Not your enrollment
 */
router.delete('/enrollments/:id', authenticate, ctrl.unenroll);

export default router;
