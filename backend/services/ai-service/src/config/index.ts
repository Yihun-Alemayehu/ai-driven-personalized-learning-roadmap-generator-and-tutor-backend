import 'dotenv/config';

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('AI_SERVICE_PORT', '3002'), 10),

  redis: {
    url: optional('REDIS_URL', 'redis://localhost:6379'),
  },

  gemini: {
    apiKey: optional('GEMINI_API_KEY', ''),
    model: optional('GEMINI_MODEL', 'gemini-1.5-flash'),
  },

  pse: {
    apiKey: optional('GOOGLE_PSE_API_KEY', ''),
    engineId: optional('GOOGLE_PSE_ENGINE_ID', ''),
  },
} as const;

export default config;
