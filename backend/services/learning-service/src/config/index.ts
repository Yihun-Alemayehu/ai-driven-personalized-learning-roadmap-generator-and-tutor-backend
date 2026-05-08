import 'dotenv/config';

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('LEARNING_SERVICE_PORT', '3001'), 10),

  db: {
    url: optional('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/learner_roadmap'),
  },

  redis: {
    url: optional('REDIS_URL', 'redis://localhost:6379'),
  },

  jwt: {
    secret: optional('JWT_SECRET', 'dev-secret-change-in-production'),
  },

  services: {
    aiServiceUrl: optional('AI_SERVICE_URL', 'http://ai-service:3002'),
  },
} as const;

export default config;
