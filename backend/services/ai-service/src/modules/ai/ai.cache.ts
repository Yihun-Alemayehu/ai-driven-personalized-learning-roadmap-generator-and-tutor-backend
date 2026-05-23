import { createHash } from 'node:crypto';
import { redis } from '../../lib/redis';

const QUIZ_TTL = 7 * 86_400;        // 7 days
const EXPLANATION_TTL = 86_400;      // 24 hours
const MICRO_QUIZ_TTL = 86_400;       // 24 hours
const REMEDIAL_QUIZ_TTL = 2 * 3_600; // 2 hours

export const cacheKeys = {
  quiz: (nodeId: string, adaptedDifficulty?: number, familiarityLevel?: string | null) =>
    adaptedDifficulty != null
      ? `quiz:ai:${nodeId}:d${adaptedDifficulty}:${familiarityLevel ?? 'default'}`
      : `quiz:ai:${nodeId}`,
  remedialQuiz: (nodeId: string, weakAreas: string[]) => {
    const hash = createHash('md5').update(weakAreas.slice().sort().join(',')).digest('hex').slice(0, 8);
    return `quiz:remedial:${nodeId}:${hash}`;
  },
  explanation: (nodeId: string, familiarityLevel?: string | null) =>
    `explanation:${nodeId}:${familiarityLevel ?? 'default'}`,
  microQuiz: (nodeId: string) => `micro-quiz:ai:${nodeId}`,
};

export async function getCached<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttl: number): Promise<void> {
  await redis.setex(key, ttl, JSON.stringify(value));
}

export async function invalidateRemedialCache(nodeId: string): Promise<number> {
  const pattern = `quiz:remedial:${nodeId}:*`;
  const keys = await redis.keys(pattern);
  if (keys.length === 0) return 0;
  await redis.del(...keys);
  return keys.length;
}

export const ttls = { QUIZ_TTL, EXPLANATION_TTL, MICRO_QUIZ_TTL, REMEDIAL_QUIZ_TTL };
