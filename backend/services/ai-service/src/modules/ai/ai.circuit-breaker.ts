import { redis } from '../../lib/redis';

const FAILURE_THRESHOLD = 5;
const COOLDOWN_TTL_S = 300; // 5 minutes

function cbKey(provider: string) { return `cb:${provider}:failures`; }
function cbOpenKey(provider: string) { return `cb:${provider}:open`; }

export async function isCircuitOpen(provider = 'ollama'): Promise<boolean> {
  const open = await redis.exists(cbOpenKey(provider));
  return open === 1;
}

export async function recordSuccess(provider = 'ollama'): Promise<void> {
  await redis.del(cbKey(provider));
}

export async function recordFailure(provider = 'ollama'): Promise<void> {
  const failures = await redis.incr(cbKey(provider));
  if (failures === 1) await redis.expire(cbKey(provider), COOLDOWN_TTL_S * 2);

  if (failures >= FAILURE_THRESHOLD) {
    await redis.setex(cbOpenKey(provider), COOLDOWN_TTL_S, '1');
    await redis.del(cbKey(provider));
  }
}

export async function getCircuitState(provider = 'ollama'): Promise<{
  open: boolean;
  failures: number;
  cooldownTtl: number | null;
}> {
  const [open, failures, ttl] = await Promise.all([
    redis.exists(cbOpenKey(provider)),
    redis.get(cbKey(provider)),
    redis.ttl(cbOpenKey(provider)),
  ]);
  return {
    open: open === 1,
    failures: failures ? parseInt(failures, 10) : 0,
    cooldownTtl: open === 1 ? ttl : null,
  };
}
