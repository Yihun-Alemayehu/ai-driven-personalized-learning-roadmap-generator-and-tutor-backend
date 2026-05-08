import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as ctrl from './ontology.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Ontology
 *   description: Ontology versions, nodes, edges, and DAG operations
 */

// ── Ontology Versions ─────────────────────────────────────────────────────────

/**
 * @swagger
 * /domains/{domainId}/ontologies:
 *   post:
 *     summary: Create a new ontology version (draft)
 *     tags: [Ontology]
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
 *       201:
 *         description: New draft ontology version
 *       404:
 *         description: Domain not found
 */
router.post(
  '/domains/:domainId/ontologies',
  authenticate,
  authorize('admin', 'domain_expert'),
  ctrl.createVersion,
);

/**
 * @swagger
 * /domains/{domainId}/ontologies:
 *   get:
 *     summary: List ontology versions for a domain
 *     tags: [Ontology]
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
 *         description: Array of ontology versions
 */
router.get('/domains/:domainId/ontologies', authenticate, ctrl.listVersions);

/**
 * @swagger
 * /ontologies/{id}:
 *   get:
 *     summary: Get ontology version with all nodes and edges
 *     tags: [Ontology]
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
 *         description: Ontology version with nodes and prerequisites
 *       404:
 *         description: Not found
 */
router.get('/ontologies/:id', authenticate, ctrl.getVersion);

/**
 * @swagger
 * /ontologies/{id}/status:
 *   patch:
 *     summary: Transition ontology version status
 *     tags: [Ontology]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, in_review, verified, published, archived]
 *     responses:
 *       200:
 *         description: Updated version
 *       400:
 *         description: Invalid transition or DAG validation failure
 */
router.patch(
  '/ontologies/:id/status',
  authenticate,
  authorize('admin', 'domain_expert'),
  ctrl.transitionStatus,
);

// ── Learning Nodes ────────────────────────────────────────────────────────────

/**
 * @swagger
 * /ontologies/{ontologyId}/nodes:
 *   post:
 *     summary: Add a learning node to a draft ontology
 *     tags: [Ontology]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ontologyId
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
 *             required: [title, slug, learningOutcomes]
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               learningOutcomes:
 *                 type: array
 *                 items:
 *                   type: string
 *               estimatedHours:
 *                 type: number
 *               difficultyLevel:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Created node
 *       400:
 *         description: Ontology not in draft status
 */
router.post(
  '/ontologies/:ontologyId/nodes',
  authenticate,
  authorize('admin', 'domain_expert'),
  ctrl.createNode,
);

/**
 * @swagger
 * /nodes/{id}:
 *   patch:
 *     summary: Update a learning node (draft ontology only)
 *     tags: [Ontology]
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
 *         description: Updated node
 */
router.patch('/nodes/:id', authenticate, authorize('admin', 'domain_expert'), ctrl.updateNode);

/**
 * @swagger
 * /nodes/{id}:
 *   delete:
 *     summary: Delete a learning node (draft ontology only)
 *     tags: [Ontology]
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
 */
router.delete('/nodes/:id', authenticate, authorize('admin', 'domain_expert'), ctrl.deleteNode);

// ── Prerequisites ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /nodes/{nodeId}/prerequisites:
 *   post:
 *     summary: Add a prerequisite edge (draft ontology only)
 *     tags: [Ontology]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nodeId
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
 *             required: [prerequisiteNodeId]
 *             properties:
 *               prerequisiteNodeId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Created edge
 *       400:
 *         description: Self-reference or would create a cycle
 */
router.post(
  '/nodes/:nodeId/prerequisites',
  authenticate,
  authorize('admin', 'domain_expert'),
  ctrl.addPrerequisite,
);

/**
 * @swagger
 * /prerequisites/{id}:
 *   delete:
 *     summary: Remove a prerequisite edge (draft ontology only)
 *     tags: [Ontology]
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
 */
router.delete(
  '/prerequisites/:id',
  authenticate,
  authorize('admin', 'domain_expert'),
  ctrl.removePrerequisite,
);

// ── DAG Queries ───────────────────────────────────────────────────────────────

/**
 * @swagger
 * /ontologies/{id}/validate:
 *   get:
 *     summary: Run DAG validation and return issues
 *     tags: [Ontology]
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
 *         description: Validation report with valid flag and issues array
 */
router.get('/ontologies/:id/validate', authenticate, authorize('admin', 'domain_expert'), ctrl.validateDAG);

/**
 * @swagger
 * /ontologies/{id}/graph:
 *   get:
 *     summary: Get the full DAG (nodes + edges) for visualization
 *     tags: [Ontology]
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
 *         description: Graph with version metadata, nodes array, and edges array
 */
router.get('/ontologies/:id/graph', authenticate, ctrl.getGraph);

export default router;
