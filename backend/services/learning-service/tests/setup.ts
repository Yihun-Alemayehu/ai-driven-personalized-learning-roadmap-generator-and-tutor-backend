// Runs before each test suite in the worker context (setupFiles)
process.env.NODE_ENV = 'test';
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5432/learner_roadmap_test';
}
if (!process.env.REDIS_URL) {
  process.env.REDIS_URL = 'redis://localhost:6379';
}
