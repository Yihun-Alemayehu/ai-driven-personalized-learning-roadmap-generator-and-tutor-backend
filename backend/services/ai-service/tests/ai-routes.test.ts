import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const mockGenerateQuiz: any = jest.fn();
const mockGenerateExplanation: any = jest.fn();
const mockGenerateMicroQuiz: any = jest.fn();
const mockAskQuestion: any = jest.fn();
const mockStreamExplanation: any = jest.fn();
const mockStreamAskQuestion: any = jest.fn();
const mockInvalidateRemedialCache: any = jest.fn();
const mockIsOllamaReachable: any = jest.fn();
const mockGetCircuitState: any = jest.fn();
const mockIsGeminiConfigured: any = jest.fn();

jest.mock('../src/modules/ai/ai.service', () => ({
  generateQuiz: mockGenerateQuiz,
  generateExplanation: mockGenerateExplanation,
  generateMicroQuiz: mockGenerateMicroQuiz,
  askQuestion: mockAskQuestion,
  streamExplanation: mockStreamExplanation,
  streamAskQuestion: mockStreamAskQuestion,
}));
jest.mock('../src/modules/ai/ai.cache', () => ({ invalidateRemedialCache: mockInvalidateRemedialCache }));
jest.mock('../src/modules/ai/ollama.client', () => ({ isOllamaReachable: mockIsOllamaReachable }));
jest.mock('../src/modules/ai/ai.circuit-breaker', () => ({ getCircuitState: mockGetCircuitState }));
jest.mock('../src/modules/ai/gemini.client', () => ({ isGeminiConfigured: mockIsGeminiConfigured }));

import aiRouter from '../src/modules/ai/ai.routes';
import { errorHandler } from '../src/middleware/errorHandler';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/ai', aiRouter);
  app.use(errorHandler);
  return app;
}

describe('ai routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validNodePayload = {
    nodeId: 'node-1',
    nodeTitle: 'Closures',
    learningOutcomes: ['Understand closure'],
  };

  it('POST /api/v1/ai/generate-quiz returns 200 with quiz data', async () => {
    mockGenerateQuiz.mockResolvedValue({ questions: [], generatedBy: 'ai_tutor' });

    const res = await request(createApp())
      .post('/api/v1/ai/generate-quiz')
      .send(validNodePayload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ quiz: { questions: [], generatedBy: 'ai_tutor' }, cached: false });
  });

  it('POST /api/v1/ai/generate-quiz returns 400 for invalid body', async () => {
    const res = await request(createApp())
      .post('/api/v1/ai/generate-quiz')
      .send({ nodeId: 'node-1' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('required');
  });

  it('POST /api/v1/ai/generate-explanation returns 200 with explanation', async () => {
    mockGenerateExplanation.mockResolvedValue({ summary: 'S', keyPoints: ['K'] });

    const res = await request(createApp())
      .post('/api/v1/ai/generate-explanation')
      .send(validNodePayload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ explanation: { summary: 'S', keyPoints: ['K'] } });
  });

  it('POST /api/v1/ai/generate-micro-quiz returns 200', async () => {
    mockGenerateMicroQuiz.mockResolvedValue({ questions: [], generatedBy: 'ai_tutor' });

    const res = await request(createApp())
      .post('/api/v1/ai/generate-micro-quiz')
      .send(validNodePayload);

    expect(res.status).toBe(200);
    expect(res.body.quiz).toBeDefined();
  });

  it('POST /api/v1/ai/ask-question returns 200 with answer', async () => {
    mockAskQuestion.mockResolvedValue('An answer');

    const res = await request(createApp())
      .post('/api/v1/ai/ask-question')
      .send({ ...validNodePayload, question: 'Why closures?' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ answer: 'An answer' });
  });

  it('POST /api/v1/ai/ask-question returns 400 when question too short', async () => {
    const res = await request(createApp())
      .post('/api/v1/ai/ask-question')
      .send({ ...validNodePayload, question: 'ab' });

    expect(res.status).toBe(400);
  });

  it('DELETE /api/v1/ai/cache/remedial/:nodeId returns count', async () => {
    mockInvalidateRemedialCache.mockResolvedValue(3);

    const res = await request(createApp())
      .delete('/api/v1/ai/cache/remedial/node-1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: 3 });
  });

  it('GET /api/v1/ai/health returns aggregated status', async () => {
    mockIsOllamaReachable.mockResolvedValue(true);
    mockGetCircuitState.mockResolvedValue({ open: false, failures: 0, cooldownTtl: null });
    mockIsGeminiConfigured.mockReturnValue(true);

    const res = await request(createApp())
      .get('/api/v1/ai/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      ollama: { reachable: true, circuitBreaker: { open: false, failures: 0, cooldownTtl: null } },
      gemini: { configured: true },
    });
  });

  it('POST /api/v1/ai/generate-explanation/stream sets SSE headers', async () => {
    mockStreamExplanation.mockImplementation(async (_input: any, onChunk: any) => {
      onChunk('token');
    });

    const res = await request(createApp())
      .post('/api/v1/ai/generate-explanation/stream')
      .send(validNodePayload);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(res.headers['cache-control']).toContain('no-cache');
    expect(res.headers['x-accel-buffering']).toBe('no');
  });

  it('POST /api/v1/ai/ask-question/stream sets SSE headers and streams chunks', async () => {
    mockStreamAskQuestion.mockImplementation(async (_input: any, onChunk: any) => {
      onChunk('hello ');
      onChunk('world');
    });

    const res = await request(createApp())
      .post('/api/v1/ai/ask-question/stream')
      .send({ ...validNodePayload, question: 'Why closures?' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(res.text).toContain('hello');
    expect(res.text).toContain('world');
  });
});
