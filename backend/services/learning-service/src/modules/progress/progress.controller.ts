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

export async function getTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const timeline = await svc.getTimelineEstimate(req.params.id, req.user!.id);
    res.json({ timeline });
  } catch (err) {
    next(err);
  }
}

export async function getActivityHeatmap(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await svc.getActivityHeatmap(req.params.id, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const insights = await svc.getInsights(req.params.id, req.user!.id);
    res.json({ insights });
  } catch (err) {
    next(err);
  }
}

export async function getGlobalActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await svc.getGlobalActivityHeatmap(req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getGlobalInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const insights = await svc.getGlobalInsights(req.user!.id);
    res.json({ insights });
  } catch (err) {
    next(err);
  }
}
