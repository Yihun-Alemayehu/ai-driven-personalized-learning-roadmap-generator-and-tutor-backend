import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { getMyGamification } from './gamification.controller';

const router = Router();

/**
 * GET /me/gamification
 * Returns the authenticated user's full gamification summary:
 * XP level, badges, streak, weekly goal, recent XP events.
 */
router.get('/me/gamification', authenticate, getMyGamification);

export default router;
