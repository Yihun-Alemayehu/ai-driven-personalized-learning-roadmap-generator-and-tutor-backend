import { Request, Response, NextFunction } from 'express';
import * as svc from './ontology.service';
import {
  createNodeSchema,
  updateNodeSchema,
  addPrerequisiteSchema,
  transitionStatusSchema,
  importNodesSchema,
} from './ontology.validation';
import { ApiError } from '../../utils/ApiError';
import type { OntologyStatus } from './ontology.types';

// ── Ontology Versions ─────────────────────────────────────────────────────────

export async function createVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const version = await svc.createVersion(req.params.domainId, req.user!.id);
    res.status(201).json({ version });
  } catch (err) {
    next(err);
  }
}

export async function listVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const versions = await svc.listVersions(req.params.domainId);
    res.json({ versions });
  } catch (err) {
    next(err);
  }
}

export async function getVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const version = await svc.getVersion(req.params.id);
    res.json({ version });
  } catch (err) {
    next(err);
  }
}

export async function transitionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error, value } = transitionStatusSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const version = await svc.transitionStatus(req.params.id, value.status as OntologyStatus, req.user!.id, req.user!.role);
    res.json({ version });
  } catch (err) {
    next(err);
  }
}

// ── Learning Nodes ────────────────────────────────────────────────────────────

export async function createNode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error, value } = createNodeSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const node = await svc.createNode(req.params.ontologyId, value);
    res.status(201).json({ node });
  } catch (err) {
    next(err);
  }
}

export async function importNodes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error, value } = importNodesSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const result = await svc.importNodes(req.params.ontologyId, value);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateNode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error, value } = updateNodeSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const node = await svc.updateNode(req.params.id, value);
    res.json({ node });
  } catch (err) {
    next(err);
  }
}

export async function deleteNode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await svc.deleteNode(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ── Prerequisites ─────────────────────────────────────────────────────────────

export async function addPrerequisite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error, value } = addPrerequisiteSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const edge = await svc.addPrerequisite(req.params.nodeId, value.prerequisiteNodeId as string);
    res.status(201).json({ edge });
  } catch (err) {
    next(err);
  }
}

export async function removePrerequisite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await svc.removePrerequisite(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ── DAG Queries ───────────────────────────────────────────────────────────────

export async function validateDAG(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const report = await svc.validateOntologyDAG(req.params.id);
    res.json(report);
  } catch (err) {
    next(err);
  }
}

export async function getGraph(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const graph = await svc.getGraph(req.params.id);
    res.json(graph);
  } catch (err) {
    next(err);
  }
}
