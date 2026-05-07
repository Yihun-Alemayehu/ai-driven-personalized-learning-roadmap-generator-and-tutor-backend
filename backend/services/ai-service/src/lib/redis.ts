import Redis from 'ioredis';
import config from '../config';

export const redis = new Redis(config.redis.url, { lazyConnect: true });

redis.on('error', () => {
  // Suppress — health route reports connectivity state
});
