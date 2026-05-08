import { Request, Response, NextFunction } from 'express';
import * as svc from './resources.service';
import { createResourceSchema, updateResourceSchema, rateResourceSchema } from './resources.validation';
import { ApiError } from '../../utils/ApiError';

export async function getResources(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resources = await svc.getResources(req.params.nodeId);
    res.json({ resources });
  } catch (err) {
    next(err);
  }
}

export async function discoverResources(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resources = await svc.discoverResources(req.params.nodeId);
    res.json({ discovered: resources.length, resources });
  } catch (err) {
    next(err);
  }
}

export async function createResource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error, value } = createResourceSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const resource = await svc.createResource(value);
    res.status(201).json({ resource });
  } catch (err) {
    next(err);
  }
}

export async function updateResource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error, value } = updateResourceSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const resource = await svc.updateResource(req.params.id, value);
    res.json({ resource });
  } catch (err) {
    next(err);
  }
}

export async function deleteResource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await svc.deleteResource(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function rateResource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error, value } = rateResourceSchema.validate(req.body);
    if (error) return next(ApiError.badRequest(error.message));
    const result = await svc.rateResource(req.params.id, req.user!.id, value);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function validateLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await svc.triggerLinkValidation();
    res.json(result);
  } catch (err) {
    next(err);
  }
}
