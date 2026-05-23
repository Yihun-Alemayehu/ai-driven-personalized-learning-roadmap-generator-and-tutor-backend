import type { Request, Response, NextFunction } from 'express';
import { getGamificationSummary } from './gamification.service';

export async function getMyGamification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const summary = await getGamificationSummary(req.user!.id);
    res.json({ gamification: summary });
  } catch (err) {
    next(err);
  }
}
