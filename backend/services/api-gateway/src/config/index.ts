import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('API_GATEWAY_PORT', '3000'), 10),

  db: {
    url: optional('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/learner_roadmap'),
  },

  redis: {
    url: optional('REDIS_URL', 'redis://localhost:6379'),
  },

  jwt: {
    secret: optional('JWT_SECRET', 'dev-secret-change-in-production'),
    expiresIn: optional('JWT_EXPIRES_IN', '15m'),
    refreshExpiresIn: optional('REFRESH_TOKEN_EXPIRES_IN', '7d'),
  },

  rateLimit: {
    windowMs: parseInt(optional('RATE_LIMIT_WINDOW_MS', '60000'), 10),
    max: parseInt(optional('RATE_LIMIT_MAX', '100'), 10),
    authMax: parseInt(optional('RATE_LIMIT_AUTH_MAX', '10'), 10),
  },

  services: {
    learningServiceUrl: optional('LEARNING_SERVICE_URL', 'http://learning-service:3001'),
    aiServiceUrl: optional('AI_SERVICE_URL', 'http://ai-service:3002'),
  },
} as const;

export default config;
