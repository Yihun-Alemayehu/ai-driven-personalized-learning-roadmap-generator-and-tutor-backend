import { Router, Request, Response } from 'express';
import { redis } from '../lib/redis';
import { isPhi4Reachable } from '../modules/ai/phi4.client';
import { isOllamaReachable } from '../modules/ai/ollama.client';
import { isGeminiConfigured } from '../modules/ai/gemini.client';
import { getCircuitState } from '../modules/ai/ai.circuit-breaker';
import config from '../config';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns status of Redis and all AI providers
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All dependencies healthy
 *       503:
 *         description: One or more dependencies unavailable
 */
router.get('/health', async (_req: Request, res: Response) => {
  const [redisOk, phi4Ok, ollamaOk, phi4Circuit, ollamaCircuit] = await Promise.all([
    redis.ping().then((p) => p === 'PONG').catch(() => false),
    isPhi4Reachable(),
    isOllamaReachable(),
    getCircuitState('phi4'),
    getCircuitState('ollama'),
  ]);

  const healthy = redisOk;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    redis: redisOk ? 'connected' : 'disconnected',
    providers: {
      phi4: {
        configured: Boolean(config.phi4.baseUrl),
        reachable: phi4Ok,
        circuit: phi4Circuit,
      },
      ollama: {
        configured: true,
        reachable: ollamaOk,
        circuit: ollamaCircuit,
      },
      gemini: {
        configured: isGeminiConfigured(),
      },
    },
  });
});

export default router;
