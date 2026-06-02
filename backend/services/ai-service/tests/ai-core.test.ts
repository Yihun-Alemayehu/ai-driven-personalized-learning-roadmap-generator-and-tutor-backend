import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockRedis: any = {
  get: jest.fn(),
  setex: jest.fn(),
  keys: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  exists: jest.fn(),
  ttl: jest.fn(),
};

const mockPhi4Generate: any = jest.fn();
const mockOllamaGenerate: any = jest.fn();
const mockGeminiGenerate: any = jest.fn();
const mockOllamaStream: any = jest.fn();
const mockGeminiStream: any = jest.fn();

jest.mock('../src/lib/redis', () => ({ redis: mockRedis }));
jest.mock('../src/config', () => ({
  __esModule: true,
  default: {
    env: 'test',
    port: 3002,
    redis: { url: 'redis://localhost:6379' },
    phi4: { baseUrl: 'http://phi4.local' },
    ollama: { baseUrl: 'http://ollama.local', model: 'qwen2.5:3b' },
    gemini: { apiKey: 'fake-key', model: 'gemini-1.5-flash' },
  },
}));
jest.mock('../src/modules/ai/phi4.client', () => ({ phi4Generate: mockPhi4Generate }));
jest.mock('../src/modules/ai/ollama.client', () => ({
  ollamaGenerate: mockOllamaGenerate,
  ollamaStream: mockOllamaStream,
}));
jest.mock('../src/modules/ai/gemini.client', () => ({
  geminiGenerate: mockGeminiGenerate,
  geminiStream: mockGeminiStream,
}));

import {
  cacheKeys,
  getCached,
  invalidateRemedialCache,
  setCache,
} from '../src/modules/ai/ai.cache';
import {
  getCircuitState,
  isCircuitOpen,
  recordFailure,
  recordSuccess,
} from '../src/modules/ai/ai.circuit-breaker';
import {
  askQuestion,
  generateExplanation,
  generateQuiz,
} from '../src/modules/ai/ai.service';

describe('ai cache + circuit breaker + service core', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds stable cache keys and round-trips JSON cache', async () => {
    const remedialA = cacheKeys.remedialQuiz('node-1', ['b', 'a']);
    const remedialB = cacheKeys.remedialQuiz('node-1', ['a', 'b']);
    expect(remedialA).toBe(remedialB);

    mockRedis.get.mockResolvedValue(JSON.stringify({ questions: [] }));
    const cached = await getCached<{ questions: unknown[] }>('quiz:ai:node-1');
    expect(cached).toEqual({ questions: [] });

    await setCache('quiz:ai:node-1', { ok: true }, 123);
    expect(mockRedis.setex).toHaveBeenCalledWith('quiz:ai:node-1', 123, JSON.stringify({ ok: true }));
  });

  it('invalidates all remedial quiz keys for a node', async () => {
    mockRedis.keys.mockResolvedValue(['quiz:remedial:node-1:aaaa', 'quiz:remedial:node-1:bbbb']);
    mockRedis.del.mockResolvedValue(2);

    const deleted = await invalidateRemedialCache('node-1');

    expect(mockRedis.keys).toHaveBeenCalledWith('quiz:remedial:node-1:*');
    expect(mockRedis.del).toHaveBeenCalledWith('quiz:remedial:node-1:aaaa', 'quiz:remedial:node-1:bbbb');
    expect(deleted).toBe(2);
  });

  it('opens circuit after threshold failures and resets on success', async () => {
    mockRedis.incr.mockResolvedValue(5);

    await recordFailure('ollama');

    expect(mockRedis.setex).toHaveBeenCalledWith('cb:ollama:open', 300, '1');
    expect(mockRedis.del).toHaveBeenCalledWith('cb:ollama:failures');

    await recordSuccess('ollama');
    expect(mockRedis.del).toHaveBeenCalledWith('cb:ollama:failures');
  });

  it('reads circuit state shape correctly', async () => {
    mockRedis.exists.mockResolvedValue(1);
    mockRedis.get.mockResolvedValue('3');
    mockRedis.ttl.mockResolvedValue(120);

    const open = await isCircuitOpen('phi4');
    const state = await getCircuitState('phi4');

    expect(open).toBe(true);
    expect(state).toEqual({ open: true, failures: 3, cooldownTtl: 120 });
  });

  it('generateQuiz falls back to Ollama when Phi-4 output is invalid', async () => {
    mockRedis.get.mockResolvedValue(null); // cache miss + circuit closed
    mockRedis.exists.mockResolvedValue(0);
    mockPhi4Generate.mockResolvedValue('not-json');
    mockOllamaGenerate.mockResolvedValue(
      JSON.stringify({
        questions: [
          {
            questionText: 'What is closure in JavaScript?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
            explanation: 'Because lexical scope.',
          },
        ],
      }),
    );

    const quiz = await generateQuiz({
      nodeId: 'node-1',
      nodeTitle: 'Closures',
      learningOutcomes: ['Explain closure'],
      questionCount: 1,
    });

    expect(mockPhi4Generate).toHaveBeenCalled();
    expect(mockOllamaGenerate).toHaveBeenCalled();
    expect(mockGeminiGenerate).not.toHaveBeenCalled();
    expect(quiz?.generatedBy).toBe('ai_tutor');
    expect(mockRedis.setex).toHaveBeenCalled();
  });

  it('generateExplanation returns cached value without provider calls', async () => {
    mockRedis.get.mockResolvedValue(
      JSON.stringify({ summary: 'S'.repeat(25), keyPoints: ['K'.repeat(5)] }),
    );

    const explanation = await generateExplanation({
      nodeId: 'node-1',
      nodeTitle: 'Promises',
      learningOutcomes: ['Explain promise states'],
    });

    expect(explanation).toEqual({ summary: 'S'.repeat(25), keyPoints: ['K'.repeat(5)] });
    expect(mockPhi4Generate).not.toHaveBeenCalled();
    expect(mockOllamaGenerate).not.toHaveBeenCalled();
    expect(mockGeminiGenerate).not.toHaveBeenCalled();
  });

  it('askQuestion uses fallback chain and returns parsed answer', async () => {
    mockRedis.exists.mockResolvedValue(0);
    mockPhi4Generate.mockResolvedValue('');
    mockOllamaGenerate.mockResolvedValue('{"answer":"Use lexical scope."}');

    const answer = await askQuestion({
      nodeId: 'node-1',
      nodeTitle: 'Closures',
      question: 'Why closures?',
    });

    expect(mockPhi4Generate).toHaveBeenCalled();
    expect(mockOllamaGenerate).toHaveBeenCalled();
    expect(answer).toBe('Use lexical scope.');
  });
});
