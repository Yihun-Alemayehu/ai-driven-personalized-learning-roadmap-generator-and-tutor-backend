import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockPrisma: any = {
  learnerNodeProgress: { updateMany: jest.fn() },
  nodePrerequisite: { findMany: jest.fn() },
  adaptationEvent: { create: jest.fn() },
};

const mockCheckAndUnlockNodes: any = jest.fn();
const mockRecordVelocity: any = jest.fn();
const mockAwardXp: any = jest.fn();
const mockCheckBadgesOnMastery: any = jest.fn();

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }));
jest.mock('../src/modules/progress/progress.service', () => ({
  checkAndUnlockNodes: mockCheckAndUnlockNodes,
}));
jest.mock('../src/modules/gatekeeper/velocity.service', () => ({
  recordVelocity: mockRecordVelocity,
}));
jest.mock('../src/modules/gamification/gamification.service', () => ({
  awardXp: mockAwardXp,
  checkBadgesOnMastery: mockCheckBadgesOnMastery,
}));

import {
  classifyScore,
  applyGatekeeperOutcome,
} from '../src/modules/gatekeeper/gatekeeper.service';

describe('gatekeeper.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckAndUnlockNodes.mockResolvedValue([]);
    mockRecordVelocity.mockReturnValue(Promise.resolve());
    mockAwardXp.mockReturnValue(Promise.resolve());
    mockCheckBadgesOnMastery.mockReturnValue(Promise.resolve());
  });

  it('classifies score across all tiers correctly', () => {
    expect(classifyScore(80)).toBe('strong_pass');
    expect(classifyScore(70)).toBe('marginal_pass');
    expect(classifyScore(50)).toBe('fail_low');
    expect(classifyScore(30)).toBe('fail_fundamental');
    expect(classifyScore(29.99)).toBe('fail_severe');
  });

  it('applies strong pass outcome and unlocks nodes', async () => {
    mockCheckAndUnlockNodes.mockResolvedValue(['node-2']);

    const result = await applyGatekeeperOutcome({
      userId: 'user-1',
      nodeId: 'node-1',
      enrollmentId: 'enr-1',
      quizAttemptId: 'attempt-1',
      scorePercent: 85,
    });

    expect(mockPrisma.learnerNodeProgress.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1', nodeId: 'node-1', enrollmentId: 'enr-1' },
        data: expect.objectContaining({
          masteryState: 'mastered',
          isMarginalPass: false,
        }),
      }),
    );
    expect(mockPrisma.adaptationEvent.create).not.toHaveBeenCalled();
    expect(mockCheckAndUnlockNodes).toHaveBeenCalledWith('user-1', 'enr-1');
    expect(mockAwardXp).toHaveBeenCalledWith({
      userId: 'user-1',
      source: 'node_mastered_strong',
      refId: 'node-1',
    });
    expect(mockCheckBadgesOnMastery).toHaveBeenCalledWith({
      userId: 'user-1',
      enrollmentId: 'enr-1',
      nodeId: 'node-1',
      tier: 'strong_pass',
      scorePercent: 85,
    });
    expect(result).toMatchObject({
      tier: 'strong_pass',
      newMasteryState: 'mastered',
      isMarginalPass: false,
      newlyUnlockedNodes: ['node-2'],
    });
  });

  it('creates prerequisite review adaptation on fail_fundamental', async () => {
    mockPrisma.nodePrerequisite.findMany.mockResolvedValue([
      { prerequisiteNodeId: 'pre-1' },
      { prerequisiteNodeId: 'pre-2' },
    ]);

    const result = await applyGatekeeperOutcome({
      userId: 'user-1',
      nodeId: 'node-1',
      enrollmentId: 'enr-1',
      quizAttemptId: 'attempt-1',
      scorePercent: 45,
    });

    expect(mockPrisma.learnerNodeProgress.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ masteryState: 'in_progress' }),
      }),
    );
    expect(mockPrisma.adaptationEvent.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        nodeId: 'node-1',
        quizAttemptId: 'attempt-1',
        adaptationType: 'prerequisite_review',
        details: { prerequisiteNodeIds: ['pre-1', 'pre-2'] },
      },
    });
    expect(mockAwardXp).toHaveBeenCalledWith({
      userId: 'user-1',
      source: 'quiz_attempt',
      refId: 'attempt-1',
    });
    expect(mockCheckAndUnlockNodes).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      tier: 'fail_fundamental',
      newMasteryState: 'in_progress',
      adaptationType: 'prerequisite_review',
    });
  });

  it('creates escalation adaptation on fail_severe', async () => {
    await applyGatekeeperOutcome({
      userId: 'user-1',
      nodeId: 'node-1',
      enrollmentId: 'enr-1',
      quizAttemptId: 'attempt-1',
      scorePercent: 10,
    });

    expect(mockPrisma.adaptationEvent.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        nodeId: 'node-1',
        quizAttemptId: 'attempt-1',
        adaptationType: 'instructor_escalation',
        details: {},
      },
    });
    expect(mockAwardXp).toHaveBeenCalledWith({
      userId: 'user-1',
      source: 'quiz_attempt',
      refId: 'attempt-1',
    });
  });
});
