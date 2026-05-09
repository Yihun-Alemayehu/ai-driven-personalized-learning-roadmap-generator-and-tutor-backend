import { redis } from '../../lib/redis';

const CB_KEY = 'cb:ollama:failures';
const CB_OPEN_KEY = 'cb:ollama:open';
const FAILURE_THRESHOLD = 5;
const COOLDOWN_TTL_S = 300; // 5 minutes

export async function isCircuitOpen(): Promise<boolean> {
  const open = await redis.exists(CB_OPEN_KEY);
  return open === 1;
}

export async function recordSuccess(): Promise<void> {
  await redis.del(CB_KEY);
}

export async function recordFailure(): Promise<void> {
  const failures = await redis.incr(CB_KEY);
  // Give the failure counter a TTL so stale failures don't accumulate forever
  if (failures === 1) await redis.expire(CB_KEY, COOLDOWN_TTL_S * 2);

  if (failures >= FAILURE_THRESHOLD) {
    await redis.setex(CB_OPEN_KEY, COOLDOWN_TTL_S, '1');
    await redis.del(CB_KEY);
  }
}

export async function getCircuitState(): Promise<{
  open: boolean;
  failures: number;
  cooldownTtl: number | null;
}> {
  const [open, failures, ttl] = await Promise.all([
    redis.exists(CB_OPEN_KEY),
    redis.get(CB_KEY),
    redis.ttl(CB_OPEN_KEY),
  ]);
  return {
    open: open === 1,
    failures: failures ? parseInt(failures, 10) : 0,
    cooldownTtl: open === 1 ? ttl : null,
  };
}
