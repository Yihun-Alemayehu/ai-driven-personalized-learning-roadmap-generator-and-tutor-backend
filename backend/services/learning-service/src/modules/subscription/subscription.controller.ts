import type { Request, Response, NextFunction } from 'express';
import * as svc from './subscription.service';

export async function getStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const status = await svc.getCreditStatus(req.user!.id, req.user!.role);
    res.json(status);
  } catch (err) {
    next(err);
  }
}

// Admin only — upgrade any user to Pro
export async function adminUpgrade(req: Request, res: Response, next: NextFunction) {
  try {
    const sub = await svc.upgradeToPro(req.params.userId);
    res.json({ tier: sub.tier });
  } catch (err) {
    next(err);
  }
}

// Admin only — downgrade user to Free
export async function adminDowngrade(req: Request, res: Response, next: NextFunction) {
  try {
    const sub = await svc.downgradeToFree(req.params.userId);
    res.json({ tier: sub.tier, creditsRemaining: sub.creditsRemaining });
  } catch (err) {
    next(err);
  }
}
