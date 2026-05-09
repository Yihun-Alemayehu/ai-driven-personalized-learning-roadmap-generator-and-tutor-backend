import { redis } from '../../lib/redis';

const QUIZ_TTL = 7 * 86_400;     // 7 days
const EXPLANATION_TTL = 86_400;   // 24 hours
const MICRO_QUIZ_TTL = 86_400;    // 24 hours

export const cacheKeys = {
  quiz: (nodeId: string) => `quiz:ai:${nodeId}`,
  explanation: (nodeId: string) => `explanation:${nodeId}`,
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

export const ttls = { QUIZ_TTL, EXPLANATION_TTL, MICRO_QUIZ_TTL };
