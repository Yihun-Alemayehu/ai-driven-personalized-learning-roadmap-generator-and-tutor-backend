import { Request, Response, NextFunction } from 'express';
import * as svc from './progress.service';

export async function getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const progress = await svc.getProgress(req.params.id, req.user!.id);
    res.json({ progress });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await svc.getStats(req.params.id, req.user!.id);
    res.json({ stats });
  } catch (err) {
    next(err);
  }
}

export async function getRoadmap(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const roadmap = await svc.getRoadmap(req.params.id, req.user!.id);
    res.json(roadmap);
  } catch (err) {
    next(err);
  }
}
