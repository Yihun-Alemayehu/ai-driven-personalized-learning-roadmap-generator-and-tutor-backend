import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockPrisma: any = {
  enrollment: { findUnique: jest.fn(), update: jest.fn() },
  learningNode: { findMany: jest.fn(), groupBy: jest.fn() },
  learnerNodeProgress: { findUnique: jest.fn(), findMany: jest.fn() },
};

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }));

import {
  getAvailablePaths,
  getBranchingPoints,
  selectPath,
  switchPath,
} from '../src/modules/branching/branching.service';

describe('branching.service core', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAvailablePaths returns grouped branch path summaries', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue({
      userId: 'u1',
      ontologyVersionId: 'ov1',
      selectedBranchPath: 'frontend',
    });
    mockPrisma.learningNode.groupBy.mockResolvedValue([
      { branchPath: 'frontend', _count: { id: 5 }, _sum: { estimatedHours: 12 } },
      { branchPath: 'backend', _count: { id: 4 }, _sum: { estimatedHours: 10 } },
    ]);

    const out = await getAvailablePaths('e1', 'u1');

    expect(out.selectedBranchPath).toBe('frontend');
    expect(out.paths).toHaveLength(2);
    expect(out.paths[0]).toMatchObject({ branchPath: 'frontend', nodeCount: 5, estimatedHours: 12 });
  });

  it('getBranchingPoints marks reached/mastered state', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue({
      userId: 'u1',
      ontologyVersionId: 'ov1',
      selectedBranchPath: null,
    });
    mockPrisma.learningNode.findMany.mockResolvedValue([
      { id: 'bp1', title: 'Choose Path', slug: 'choose-path', description: 'Pick one' },
    ]);
    mockPrisma.learningNode.groupBy.mockResolvedValue([
      { branchPath: 'frontend', _count: { id: 5 }, _sum: { estimatedHours: 12 } },
    ]);
    mockPrisma.learnerNodeProgress.findUnique.mockResolvedValue({ unlocked: true, masteryState: 'mastered' });

    const out = await getBranchingPoints('e1', 'u1');

    expect(out.branchingPoints).toHaveLength(1);
    expect(out.branchingPoints[0].isReached).toBe(true);
    expect(out.branchingPoints[0].isMastered).toBe(true);
  });

  it('selectPath updates selected branch when prerequisites are satisfied', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue({
      userId: 'u1',
      ontologyVersionId: 'ov1',
      selectedBranchPath: null,
    });
    mockPrisma.learningNode.findMany.mockResolvedValue([
      { id: 'bp1', title: 'Branch', prerequisites: [] },
    ]);
    mockPrisma.learnerNodeProgress.findMany.mockResolvedValue([
      { nodeId: 'bp1', masteryState: 'not_started', unlocked: true },
    ]);
    mockPrisma.enrollment.update.mockResolvedValue({
      id: 'e1',
      selectedBranchPath: 'frontend',
      domain: { id: 'd1', name: 'Domain', slug: 'domain' },
    });

    const out = await selectPath('e1', 'u1', 'frontend');

    expect(out.enrollment.selectedBranchPath).toBe('frontend');
    expect(mockPrisma.enrollment.update).toHaveBeenCalled();
  });

  it('switchPath rejects when branching prerequisites are unmet', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue({
      userId: 'u1',
      ontologyVersionId: 'ov1',
      selectedBranchPath: 'frontend',
    });
    mockPrisma.learningNode.findMany
      .mockResolvedValueOnce([
        { id: 'bp1', title: 'Branch', prerequisites: [{ prerequisiteNodeId: 'n1' }] },
      ])
      .mockResolvedValueOnce([{ id: 'n1', title: 'Prereq Node' }]);
    mockPrisma.learnerNodeProgress.findMany.mockResolvedValue([
      { nodeId: 'bp1', masteryState: 'not_started', unlocked: false },
      { nodeId: 'n1', masteryState: 'in_progress', unlocked: false },
    ]);

    await expect(switchPath('e1', 'u1', 'backend')).rejects.toMatchObject({ statusCode: 400 });
    expect(mockPrisma.enrollment.update).not.toHaveBeenCalled();
  });
});
