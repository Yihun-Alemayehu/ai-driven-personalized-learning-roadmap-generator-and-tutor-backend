import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as ctrl from './certificates.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Certificates
 *   description: Course-completion certificates (claim, fetch, public verify)
 */

/**
 * @swagger
 * /enrollments/{enrollmentId}/certificate:
 *   get:
 *     summary: Get my certificate state for an enrollment (issued cert + eligibility)
 *     tags: [Certificates]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Certificate (or null) plus eligibility + completion percent }
 */
router.get('/enrollments/:enrollmentId/certificate', authenticate, ctrl.getMyCertificate);

/**
 * @swagger
 * /enrollments/{enrollmentId}/certificate:
 *   post:
 *     summary: Claim a certificate for a 100%-complete enrollment (idempotent)
 *     tags: [Certificates]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       201: { description: Certificate issued (or existing one returned) }
 *       403: { description: Roadmap not yet 100% complete }
 */
router.post('/enrollments/:enrollmentId/certificate', authenticate, ctrl.claimCertificate);

/**
 * @swagger
 * /certificates/{publicId}/verify:
 *   get:
 *     summary: Publicly verify a certificate by its printed ID (no auth)
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Verified certificate data }
 *       404: { description: Certificate not found }
 */
router.get('/certificates/:publicId/verify', ctrl.verifyCertificate);

export default router;
