import { Router, Request, Response } from 'express';
import { redis } from '../lib/redis';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns Redis connectivity status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All dependencies healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 redis:
 *                   type: string
 *                   example: connected
 *       503:
 *         description: One or more dependencies unavailable
 */
router.get('/health', async (_req: Request, res: Response) => {
  let redisStatus: 'connected' | 'disconnected' = 'disconnected';

  try {
    const pong = await redis.ping();
    if (pong === 'PONG') redisStatus = 'connected';
  } catch {
    // stays disconnected
  }

  const healthy = redisStatus === 'connected';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    redis: redisStatus,
  });
});

export default router;
