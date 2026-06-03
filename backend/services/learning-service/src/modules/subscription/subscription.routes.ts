import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as ctrl from './subscription.controller';

const router = Router();

// My credit status — any authenticated user
router.get('/subscription/status', authenticate, ctrl.getStatus);

// Admin — manage any user's tier
router.patch('/admin/users/:userId/upgrade', authenticate, authorize('admin'), ctrl.adminUpgrade);
router.patch('/admin/users/:userId/downgrade', authenticate, authorize('admin'), ctrl.adminDowngrade);

export default router;
