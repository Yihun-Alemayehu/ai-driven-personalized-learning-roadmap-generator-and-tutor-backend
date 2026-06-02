import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockPrisma: any = {
  learnerNodeProgress: { findUnique: jest.fn(), updateMany: jest.fn() },
  quiz: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
  quizAttempt: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  challengeProject: { findFirst: jest.fn() },
  learningNode: { findUnique: jest.fn() },
};

const mockApplyGatekeeperOutcome: any = jest.fn();
const mockGetAdaptedResources: any = jest.fn();
const mockBuildLearnerContext: any = jest.fn();
const mockComputeAdaptiveDifficulty: any = jest.fn();
const mockDetectWeakAreas: any = jest.fn();
const mockRequestAiQuiz: any = jest.fn();
const mockRequestAiExplanation: any = jest.fn();
const mockRequestAiAsk: any = jest.fn();
const mockInvalidateRemedialQuizCache: any = jest.fn();

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }));
jest.mock('../src/modules/gatekeeper/gatekeeper.service', () => ({
  classifyScore: (scorePercent: number) => {
    if (scorePercent >= 80) return 'strong_pass';
    if (scorePercent >= 70) return 'marginal_pass';
    if (scorePercent >= 50) return 'fail_low';
    if (scorePercent >= 30) return 'fail_fundamental';
    return 'fail_severe';
  },
  applyGatekeeperOutcome: mockApplyGatekeeperOutcome,
}));
jest.mock('../src/modules/adaptation/adaptation.service', () => ({
  getAdaptedResources: mockGetAdaptedResources,
}));
jest.mock('../src/modules/progress/learner-context.service', () => ({
  buildLearnerContext: mockBuildLearnerContext,
  computeAdaptiveDifficulty: mockComputeAdaptiveDifficulty,
  detectWeakAreas: mockDetectWeakAreas,
}));
jest.mock('../src/lib/aiClient', () => ({
  requestAiQuiz: mockRequestAiQuiz,
  requestAiExplanation: mockRequestAiExplanation,
  requestAiAsk: mockRequestAiAsk,
  invalidateRemedialQuizCache: mockInvalidateRemedialQuizCache,
}));

import {
  submitAttempt,
  getQuizForNode,
  buildAskStreamContext,
} from '../src/modules/quizzes/quizzes.service';

describe('quizzes.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvalidateRemedialQuizCache.mockReturnValue(Promise.resolve());
  });

  it('submits attempt, computes score, updates progress, and applies strong-pass flow', async () => {
    mockPrisma.quiz.findUnique.mockResolvedValue({
      id: 'quiz-1',
      nodeId: 'node-1',
      questions: [
        { id: 'q1', correctAnswer: 'A' },
        { id: 'q2', correctAnswer: 'B' },
        { id: 'q3', correctAnswer: 'C' },
        { id: 'q4', correctAnswer: 'D' },
      ],
    });
    mockPrisma.learnerNodeProgress.findUnique.mockResolvedValue({
      unlocked: true,
      enrollmentId: 'enr-1',
      attemptsCount: 0,
      bestQuizScore: 70,
    });
    mockPrisma.quizAttempt.create.mockResolvedValue({ id: 'attempt-1' });
    mockApplyGatekeeperOutcome.mockResolvedValue({
      tier: 'strong_pass',
      newMasteryState: 'mastered',
      isMarginalPass: false,
      newlyUnlockedNodes: ['node-2'],
    });
    mockPrisma.challengeProject.findFirst.mockResolvedValue({ id: 'cp-1', title: 'Build mini app' });

    const result = await submitAttempt('user-1', 'quiz-1', {
      enrollmentId: 'enr-1',
      startedAt: '2026-06-01T09:00:00.000Z',
      answers: [
        { questionId: 'q1', answer: 'A' },
        { questionId: 'q2', answer: 'B' },
        { questionId: 'q3', answer: 'C' },
        { questionId: 'q4', answer: 'X' },
      ],
    });

    expect(mockPrisma.quizAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          quizId: 'quiz-1',
          nodeId: 'node-1',
          scorePercent: 75,
          outcome: 'marginal_pass',
        }),
      }),
    );
    expect(mockPrisma.learnerNodeProgress.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', nodeId: 'node-1', enrollmentId: 'enr-1' },
      data: {
        attemptsCount: { increment: 1 },
        bestQuizScore: 75,
      },
    });
    expect(mockApplyGatekeeperOutcome).toHaveBeenCalledWith({
      userId: 'user-1',
      nodeId: 'node-1',
      enrollmentId: 'enr-1',
      quizAttemptId: 'attempt-1',
      scorePercent: 75,
    });
    expect(mockInvalidateRemedialQuizCache).toHaveBeenCalledWith('node-1');
    expect(result.attempt.correctAnswers).toBe(3);
    expect(result.attempt.totalQuestions).toBe(4);
    expect(result.attempt.scorePercent).toBe(75);
    expect(result.gatekeeper.tier).toBe('strong_pass');
  });

  it('returns adapted resources when tier is fail_low', async () => {
    mockPrisma.quiz.findUnique.mockResolvedValue({
      id: 'quiz-1',
      nodeId: 'node-1',
      questions: [
        { id: 'q1', correctAnswer: 'A' },
        { id: 'q2', correctAnswer: 'B' },
      ],
    });
    mockPrisma.learnerNodeProgress.findUnique.mockResolvedValue({
      unlocked: true,
      enrollmentId: 'enr-1',
      attemptsCount: 1,
      bestQuizScore: 80,
    });
    mockPrisma.quizAttempt.create.mockResolvedValue({ id: 'attempt-2' });
    mockApplyGatekeeperOutcome.mockResolvedValue({
      tier: 'fail_low',
      newMasteryState: 'in_progress',
      isMarginalPass: false,
      adaptationType: 'resource_swap',
      newlyUnlockedNodes: [],
    });
    mockGetAdaptedResources.mockResolvedValue([{ id: 'res-1' }]);

    const result = await submitAttempt('user-1', 'quiz-1', {
      enrollmentId: 'enr-1',
      startedAt: '2026-06-01T09:00:00.000Z',
      answers: [
        { questionId: 'q1', answer: 'A' },
        { questionId: 'q2', answer: 'X' },
      ],
    });

    expect(result.attempt.scorePercent).toBe(50);
    expect(mockGetAdaptedResources).toHaveBeenCalledWith('node-1');
    expect(result.adaptedResources).toEqual([{ id: 'res-1' }]);
    expect(mockInvalidateRemedialQuizCache).not.toHaveBeenCalled();
  });

  it('prefers fresh cached AI quiz on first attempt', async () => {
    mockPrisma.learnerNodeProgress.findUnique.mockResolvedValue({
      unlocked: true,
      enrollmentId: 'enr-1',
    });
    mockBuildLearnerContext.mockResolvedValue({
      currentNodeAttempts: 0,
      currentNodeBestScore: null,
      overallAvgScore: null,
    });
    const cachedQuiz = { id: 'quiz-cached', questions: [{ id: 'q1' }] };
    mockPrisma.quiz.findFirst.mockResolvedValue(cachedQuiz);

    const quiz = await getQuizForNode('node-1', 'user-1');

    expect(quiz).toEqual(cachedQuiz);
    expect(mockRequestAiExplanation).not.toHaveBeenCalled();
    expect(mockRequestAiQuiz).not.toHaveBeenCalled();
  });

  it('builds ask-stream context with node and learner data', async () => {
    mockPrisma.learnerNodeProgress.findUnique.mockResolvedValue({
      unlocked: true,
      enrollmentId: 'enr-1',
    });
    mockPrisma.learningNode.findUnique.mockResolvedValue({
      title: 'Node Title',
      description: 'Node desc',
      learningOutcomes: ['Outcome A', 'Outcome B'],
    });
    mockBuildLearnerContext.mockResolvedValue({
      familiarityLevel: 'beginner',
      currentNodeAttempts: 1,
    });

    const ctx = await buildAskStreamContext(
      'node-1',
      'user-1',
      'What is closure?',
      { summary: 'S', keyPoints: ['K1'] },
    );

    expect(ctx).toMatchObject({
      nodeId: 'node-1',
      nodeTitle: 'Node Title',
      question: 'What is closure?',
      description: 'Node desc',
      learningOutcomes: ['Outcome A', 'Outcome B'],
      explanation: { summary: 'S', keyPoints: ['K1'] },
      learnerContext: { familiarityLevel: 'beginner', currentNodeAttempts: 1 },
    });
  });
});
