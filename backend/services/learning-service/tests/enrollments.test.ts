import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockCheckAndUnlockNodes = jest.fn();

const mockPrisma: any = {
  enrollment: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
  domain: { findUnique: jest.fn() },
  ontologyVersion: { findFirst: jest.fn() },
  learnerNodeProgress: { createMany: jest.fn(), deleteMany: jest.fn() },
  supplementaryNode: { createMany: jest.fn() },
};

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }));
jest.mock('../src/modules/progress/progress.service', () => ({
  checkAndUnlockNodes: mockCheckAndUnlockNodes,
}));

import { enroll, getEnrollment, unenroll } from '../src/modules/enrollments/enrollments.service';

describe('enrollments.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates enrollment and initial progress rows with beginner profile', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue(null);
    mockPrisma.domain.findUnique.mockResolvedValue({ id: 'd1' });
    mockPrisma.ontologyVersion.findFirst.mockResolvedValue({
      id: 'ov1',
      nodes: [
        {
          id: 'n1',
          title: 'Intro',
          description: 'Basics',
          learningOutcomes: ['x'],
          difficultyLevel: 1,
          isBranchingPoint: false,
          isConvergencePoint: false,
          branchPath: null,
          prerequisites: [],
        },
        {
          id: 'n2',
          title: 'Advanced Topic',
          description: 'Hard',
          learningOutcomes: ['y'],
          difficultyLevel: 4,
          isBranchingPoint: false,
          isConvergencePoint: false,
          branchPath: 'frontend',
          prerequisites: [{ prerequisiteNodeId: 'n1' }],
        },
      ],
    });
    mockPrisma.enrollment.create.mockResolvedValue({ id: 'e1', domainId: 'd1' });
    mockPrisma.learnerNodeProgress.createMany.mockResolvedValue({ count: 2 });
    mockPrisma.supplementaryNode.createMany.mockResolvedValue({ count: 1 });

    const out = await enroll('u1', {
      domainId: 'd1',
      familiarityLevel: 'beginner',
      selectedBranchPath: 'frontend',
      learningGoal: 'upskill',
      weeklyHours: 6,
    });

    expect(out.enrollment.id).toBe('e1');
    expect(out.totalNodes).toBe(2);
    expect(out.unlockedNodes).toBe(1);
    expect(out.personalization.supplementaryNodes).toBe(1);
    expect(mockPrisma.learnerNodeProgress.createMany).toHaveBeenCalled();
    expect(mockCheckAndUnlockNodes).not.toHaveBeenCalled();
  });

  it('auto-masters and cascades unlock for advanced + prior skills', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue(null);
    mockPrisma.domain.findUnique.mockResolvedValue({ id: 'd1' });
    mockPrisma.ontologyVersion.findFirst.mockResolvedValue({
      id: 'ov1',
      nodes: [
        {
          id: 'n1',
          title: 'JavaScript Basics',
          description: 'variables',
          learningOutcomes: ['variables'],
          difficultyLevel: 1,
          isBranchingPoint: false,
          isConvergencePoint: false,
          branchPath: null,
          prerequisites: [],
        },
      ],
    });
    mockPrisma.enrollment.create.mockResolvedValue({ id: 'e1', domainId: 'd1' });

    const out = await enroll('u1', {
      domainId: 'd1',
      familiarityLevel: 'advanced',
      priorSkills: 'javascript',
      learningGoal: 'get_job',
    });

    expect(out.personalization.skippedNodes).toBeGreaterThanOrEqual(1);
    expect(out.personalization.unlockAcceleration).toBe('advanced');
    expect(mockCheckAndUnlockNodes).toHaveBeenCalledWith('u1', 'e1');
  });

  it('rejects duplicate enrollment', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(enroll('u1', { domainId: 'd1' })).rejects.toMatchObject({ statusCode: 409 });
  });

  it('getEnrollment enforces ownership', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'e1', userId: 'u2' });

    await expect(getEnrollment('e1', 'u1')).rejects.toMatchObject({ statusCode: 403 });
  });

  it('unenroll deletes progress then enrollment', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'e1', userId: 'u1' });
    mockPrisma.learnerNodeProgress.deleteMany.mockResolvedValue({ count: 4 });
    mockPrisma.enrollment.delete.mockResolvedValue({ id: 'e1' });

    await unenroll('e1', 'u1');

    expect(mockPrisma.learnerNodeProgress.deleteMany).toHaveBeenCalledWith({ where: { enrollmentId: 'e1' } });
    expect(mockPrisma.enrollment.delete).toHaveBeenCalledWith({ where: { id: 'e1' } });
  });
});
