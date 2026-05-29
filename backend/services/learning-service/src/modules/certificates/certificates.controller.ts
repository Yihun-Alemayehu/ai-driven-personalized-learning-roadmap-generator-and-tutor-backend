import type { Request, Response, NextFunction } from 'express';
import * as svc from './certificates.service';

export async function getMyCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await svc.getMyCertificate(req.params.enrollmentId, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function claimCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const certificate = await svc.claimCertificate(req.params.enrollmentId, req.user!.id);
    res.status(201).json({ certificate });
  } catch (err) {
    next(err);
  }
}

/** Public — no authentication. */
export async function verifyCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await svc.getPublicCertificate(req.params.publicId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
