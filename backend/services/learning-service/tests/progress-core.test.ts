import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockPrisma: any = {
  enrollment: { findUnique: jest.fn() },
  learnerNodeProgress: { findMany: jest.fn(), updateMany: jest.fn() },
  nodePrerequisite: { findMany: jest.fn() },
};

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }));

import {
  checkAndUnlockNodes,
  getStats,
} from '../src/modules/progress/progress.service';

describe('progress.service core', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('checkAndUnlockNodes unlocks nodes when all prerequisites are complete', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue({ ontologyVersionId: 'ov1' });
    mockPrisma.learnerNodeProgress.findMany.mockResolvedValue([
      { nodeId: 'n1', masteryState: 'mastered', unlocked: true },
      { nodeId: 'n2', masteryState: 'review_needed', unlocked: true },
      { nodeId: 'n3', masteryState: 'not_started', unlocked: false },
      { nodeId: 'n4', masteryState: 'in_progress', unlocked: false },
    ]);
    mockPrisma.nodePrerequisite.findMany.mockResolvedValue([
      { nodeId: 'n3', prerequisiteNodeId: 'n1' },
      { nodeId: 'n3', prerequisiteNodeId: 'n2' },
      { nodeId: 'n4', prerequisiteNodeId: 'n3' },
    ]);

    const unlocked = await checkAndUnlockNodes('u1', 'e1');

    expect(unlocked).toEqual(['n3']);
    expect(mockPrisma.learnerNodeProgress.updateMany).toHaveBeenCalledWith({
      where: { enrollmentId: 'e1', nodeId: { in: ['n3'] } },
      data: { unlocked: true },
    });
  });

  it('checkAndUnlockNodes returns empty when enrollment not found', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue(null);

    const unlocked = await checkAndUnlockNodes('u1', 'missing');

    expect(unlocked).toEqual([]);
    expect(mockPrisma.learnerNodeProgress.updateMany).not.toHaveBeenCalled();
  });

  it('getStats computes completion, average score, streak, and byState', async () => {
    const now = Date.now();
    mockPrisma.enrollment.findUnique.mockResolvedValue({ userId: 'u1', ontologyVersionId: 'ov1', selectedBranchPath: null });
    mockPrisma.learnerNodeProgress.findMany.mockResolvedValue([
      { masteryState: 'mastered', unlocked: true, bestQuizScore: 90, lastReviewedAt: new Date(now) },
      { masteryState: 'review_needed', unlocked: true, bestQuizScore: 70, lastReviewedAt: new Date(now - 1 * 86_400_000) },
      { masteryState: 'in_progress', unlocked: true, bestQuizScore: null, lastReviewedAt: null },
      { masteryState: 'not_started', unlocked: false, bestQuizScore: null, lastReviewedAt: null },
    ]);

    const stats = await getStats('e1', 'u1');

    expect(stats.totalNodes).toBe(4);
    expect(stats.unlockedNodes).toBe(3);
    expect(stats.completedNodes).toBe(2);
    expect(stats.completionPercent).toBe(50);
    expect(stats.avgQuizScore).toBe(80);
    expect(stats.currentStreak).toBe(2);
    expect(stats.byState.mastered).toBe(1);
    expect(stats.byState.review_needed).toBe(1);
    expect(stats.byState.relearn).toBe(0);
  });
});
