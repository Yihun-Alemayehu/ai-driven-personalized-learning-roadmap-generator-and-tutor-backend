import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockPrisma: any = {
  xpEvent: { create: jest.fn(), findMany: jest.fn() },
  userXp: { findUnique: jest.fn(), upsert: jest.fn() },
  userBadge: { upsert: jest.fn(), findMany: jest.fn() },
  learnerNodeProgress: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  learnerVelocity: { findUnique: jest.fn() },
  adaptationEvent: { count: jest.fn() },
  enrollment: { findMany: jest.fn() },
};

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }));

import {
  awardXp,
  checkBadgesOnMastery,
  computeWeeklyGoal,
} from '../src/modules/gamification/gamification.service';

describe('gamification.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('awards XP and updates aggregate level', async () => {
    mockPrisma.userXp.findUnique.mockResolvedValue({ userId: 'user-1', totalXp: 150, level: 1 });

    await awardXp({ userId: 'user-1', source: 'node_mastered_strong', refId: 'node-1' });

    expect(mockPrisma.xpEvent.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', source: 'node_mastered_strong', amount: 100, refId: 'node-1' },
    });
    expect(mockPrisma.userXp.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      create: { userId: 'user-1', totalXp: 250, level: 2 },
      update: { totalXp: 250, level: 2 },
    });
  });

  it('skips XP write when amount is non-positive', async () => {
    await awardXp({ userId: 'user-1', source: 'quiz_attempt', overrideAmount: 0 });

    expect(mockPrisma.xpEvent.create).not.toHaveBeenCalled();
    expect(mockPrisma.userXp.upsert).not.toHaveBeenCalled();
  });

  it('computes weekly goal target and progress', async () => {
    mockPrisma.learnerNodeProgress.count.mockResolvedValue(2);
    mockPrisma.enrollment.findMany.mockResolvedValue([
      { weeklyHours: 6 },
      { weeklyHours: 10 },
    ]);
    mockPrisma.learnerNodeProgress.findMany.mockResolvedValue([
      { node: { estimatedHours: 2 } },
      { node: { estimatedHours: 4 } },
    ]);

    const goal = await computeWeeklyGoal('user-1');

    expect(goal.target).toBe(3);
    expect(goal.progress).toBe(2);
    expect(goal.percentDone).toBe(67);
    expect(goal.weekLabel.length).toBeGreaterThan(0);
  });

  it('grants key badges and milestone XP on mastery', async () => {
    const now = Date.now();

    mockPrisma.learnerNodeProgress.count.mockImplementation(({ where }: any) => {
      if (where.masteredAt) return Promise.resolve(2); // weekly goal progress
      if (where.userId && where.masteryState === 'mastered' && where.enrollmentId) return Promise.resolve(4);
      if (where.enrollmentId && where.masteryState === 'mastered') return Promise.resolve(4);
      if (where.enrollmentId) return Promise.resolve(4);
      if (where.userId && where.masteryState === 'mastered') return Promise.resolve(1);
      return Promise.resolve(0);
    });

    mockPrisma.learnerVelocity.findUnique.mockResolvedValue({ velocityRatio: 0.4 });
    mockPrisma.learnerNodeProgress.findUnique.mockResolvedValue({ masteryState: 'mastered' });
    mockPrisma.adaptationEvent.count.mockResolvedValue(1);
    mockPrisma.enrollment.findMany.mockResolvedValue([{ weeklyHours: 10 }]);
    mockPrisma.userXp.findUnique.mockResolvedValue(null);

    mockPrisma.learnerNodeProgress.findMany.mockImplementation((args: any) => {
      if (args.include) {
        return Promise.resolve([
          { node: { estimatedHours: 2 } },
          { node: { estimatedHours: 2 } },
        ]);
      }
      return Promise.resolve([
        { lastReviewedAt: new Date(now) },
        { lastReviewedAt: new Date(now - 1 * 86_400_000) },
        { lastReviewedAt: new Date(now - 2 * 86_400_000) },
        { lastReviewedAt: new Date(now - 3 * 86_400_000) },
        { lastReviewedAt: new Date(now - 4 * 86_400_000) },
      ]);
    });

    await checkBadgesOnMastery({
      userId: 'user-1',
      enrollmentId: 'enr-1',
      nodeId: 'node-1',
      tier: 'strong_pass',
      scorePercent: 100,
    });

    const grantedBadges = mockPrisma.userBadge.upsert.mock.calls.map((call: any[]) => call[0].create.badgeKey);
    expect(grantedBadges).toEqual(expect.arrayContaining([
      'first_mastery',
      'quiz_ace',
      'speed_learner',
      'completionist',
      'comeback',
      'streak_5',
    ]));

    const xpSources = mockPrisma.xpEvent.create.mock.calls.map((call: any[]) => call[0].data.source);
    expect(xpSources).toEqual(expect.arrayContaining(['enrollment_complete', 'streak_milestone']));
  });
});
