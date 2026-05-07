import net from 'net';
import { Router, Request, Response } from 'express';
import { redis } from '../lib/redis';
import config from '../config';

const router = Router();

function pgReachable(): Promise<boolean> {
  const url = new URL(config.db.url);
  const host = url.hostname;
  const port = parseInt(url.port || '5432', 10);
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port });
    socket.setTimeout(3000);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('error', () => resolve(false));
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
  });
}

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
 *       503:
 *         description: One or more dependencies unavailable
 */
router.get('/health', async (_req: Request, res: Response) => {
  const [dbOk, redisPong] = await Promise.allSettled([
    pgReachable(),
    redis.ping(),
  ]);

  const db: 'connected' | 'disconnected' =
    dbOk.status === 'fulfilled' && dbOk.value ? 'connected' : 'disconnected';
  const redisStatus: 'connected' | 'disconnected' =
    redisPong.status === 'fulfilled' && redisPong.value === 'PONG'
      ? 'connected'
      : 'disconnected';

  const healthy = db === 'connected' && redisStatus === 'connected';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    db,
    redis: redisStatus,
  });
});

export default router;
