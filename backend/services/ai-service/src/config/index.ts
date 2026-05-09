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

  ollama: {
    baseUrl: optional('OLLAMA_BASE_URL', 'http://host.docker.internal:11434'),
    model: optional('OLLAMA_MODEL', 'qwen2.5:3b'),
  },

  gemini: {
    apiKey: optional('GEMINI_API_KEY', ''),
    model: optional('GEMINI_MODEL', 'gemini-1.5-flash'),
  },
} as const;

export default config;
