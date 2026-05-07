import { Router, Request, Response } from 'express';
import { pool } from '../lib/db';
import { redis } from '../lib/redis';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns DB and Redis connectivity status
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
 *                 db:
 *                   type: string
 *                   example: connected
 *                 redis:
 *                   type: string
 *                   example: connected
 *       503:
 *         description: One or more dependencies unavailable
 */
router.get('/health', async (_req: Request, res: Response) => {
  let db: 'connected' | 'disconnected' = 'disconnected';
  let redisStatus: 'connected' | 'disconnected' = 'disconnected';

  try {
    await pool.query('SELECT 1');
    db = 'connected';
  } catch {
    // stays disconnected
  }

  try {
    const pong = await redis.ping();
    if (pong === 'PONG') redisStatus = 'connected';
  } catch {
    // stays disconnected
  }

  const healthy = db === 'connected' && redisStatus === 'connected';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    db,
    redis: redisStatus,
  });
});

export default router;
