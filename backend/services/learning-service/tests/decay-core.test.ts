import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockCreateNotification = jest.fn();

const mockPrisma: any = {
  learnerNodeProgress: {
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    findUnique: jest.fn(),
  },
  nodePrerequisite: { findMany: jest.fn() },
  quiz: { findFirst: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
  quizAttempt: { create: jest.fn() },
  adaptationEvent: { create: jest.fn() },
  enrollment: { findUnique: jest.fn() },
};

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }));
jest.mock('../src/modules/notifications/notifications.service', () => ({
  createNotification: mockCreateNotification,
}));

import {
  generateMicroQuiz,
  runDecayScan,
  submitMicroQuizAttempt,
} from '../src/modules/decay/decay.service';

describe('decay.service core', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runDecayScan transitions mastered/review_needed and notifies', async () => {
    const old20d = new Date(Date.now() - 20 * 86_400_000);
    const old40d = new Date(Date.now() - 40 * 86_400_000);
    mockPrisma.learnerNodeProgress.findMany
      .mockResolvedValueOnce([
        {
          id: 'p1',
          userId: 'u1',
          nodeId: 'n1',
          enrollmentId: 'e1',
          isMarginalPass: false,
          lastReviewedAt: old20d,
          decayNotifiedAt: null,
          node: { title: 'Node 1' },
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'p2',
          userId: 'u1',
          nodeId: 'n2',
          enrollmentId: 'e1',
          lastReviewedAt: old40d,
          decayNotifiedAt: null,
          node: { title: 'Node 2' },
        },
      ]);

    const out = await runDecayScan();

    expect(out.transitioned).toBe(2);
    expect(out.notified).toBe(2);
    expect(mockCreateNotification).toHaveBeenCalledTimes(2);
  });

  it('generateMicroQuiz creates 2-3 question quiz from main quiz', async () => {
    mockPrisma.learnerNodeProgress.findUnique.mockResolvedValue({ masteryState: 'review_needed' });
    mockPrisma.quiz.findFirst.mockResolvedValue({
      id: 'q-main',
      questions: [
        { questionType: 'multiple_choice', questionText: 'Q1', options: ['a'], correctAnswer: 'a', explanation: 'e1' },
        { questionType: 'multiple_choice', questionText: 'Q2', options: ['b'], correctAnswer: 'b', explanation: 'e2' },
        { questionType: 'multiple_choice', questionText: 'Q3', options: ['c'], correctAnswer: 'c', explanation: 'e3' },
        { questionType: 'multiple_choice', questionText: 'Q4', options: ['d'], correctAnswer: 'd', explanation: 'e4' },
      ],
    });
    mockPrisma.quiz.create.mockResolvedValue({ id: 'q-micro', isMicroQuiz: true, questions: [{ id: 'mq1' }, { id: 'mq2' }, { id: 'mq3' }] });

    const quiz = await generateMicroQuiz('n1', 'u1');

    expect(quiz.isMicroQuiz).toBe(true);
    expect(mockPrisma.quiz.create).toHaveBeenCalled();
  });

  it('submitMicroQuizAttempt passes and restores mastered state at >=80', async () => {
    mockPrisma.quiz.findUnique.mockResolvedValue({
      id: 'q1',
      nodeId: 'n1',
      isMicroQuiz: true,
      questions: [
        { id: 'a', correctAnswer: '1' },
        { id: 'b', correctAnswer: '2' },
      ],
    });
    mockPrisma.learnerNodeProgress.findUnique.mockResolvedValue({ enrollmentId: 'e1', masteryState: 'review_needed' });
    mockPrisma.quizAttempt.create.mockResolvedValue({ id: 'attempt-1' });

    const out = await submitMicroQuizAttempt('u1', 'q1', {
      enrollmentId: 'e1',
      startedAt: new Date().toISOString(),
      answers: [
        { questionId: 'a', answer: '1' },
        { questionId: 'b', answer: '2' },
      ],
    });

    expect(out.passed).toBe(true);
    expect(out.newMasteryState).toBe('mastered');
    expect(mockPrisma.learnerNodeProgress.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ masteryState: 'mastered' }) }),
    );
  });

  it('submitMicroQuizAttempt fail locks dependents and creates adaptation event', async () => {
    mockPrisma.quiz.findUnique.mockResolvedValue({
      id: 'q1',
      nodeId: 'n1',
      isMicroQuiz: true,
      questions: [
        { id: 'a', correctAnswer: '1' },
        { id: 'b', correctAnswer: '2' },
      ],
    });
    mockPrisma.learnerNodeProgress.findUnique.mockResolvedValue({ enrollmentId: 'e1', masteryState: 'review_needed' });
    mockPrisma.quizAttempt.create.mockResolvedValue({ id: 'attempt-2' });
    mockPrisma.nodePrerequisite.findMany
      .mockResolvedValueOnce([{ nodeId: 'n2' }])
      .mockResolvedValueOnce([{ nodeId: 'n3' }])
      .mockResolvedValueOnce([]);

    const out = await submitMicroQuizAttempt('u1', 'q1', {
      enrollmentId: 'e1',
      startedAt: new Date().toISOString(),
      answers: [
        { questionId: 'a', answer: '1' },
        { questionId: 'b', answer: 'x' },
      ],
    });

    expect(out.passed).toBe(false);
    expect(mockPrisma.learnerNodeProgress.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u1', nodeId: { in: ['n2', 'n3'] } },
      }),
    );
    expect(mockPrisma.adaptationEvent.create).toHaveBeenCalled();
  });
});
