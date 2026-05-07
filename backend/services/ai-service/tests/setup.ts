// Runs before each test suite in the worker context (setupFiles)
process.env.NODE_ENV = 'test';
if (!process.env.REDIS_URL) {
  process.env.REDIS_URL = 'redis://localhost:6379';
}
