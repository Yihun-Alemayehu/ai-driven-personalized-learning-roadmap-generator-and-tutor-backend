import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockPrisma: any = {
  ontologyVersion: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  domain: { findUnique: jest.fn() },
  learningNode: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
  nodePrerequisite: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
  $transaction: jest.fn(),
};

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }));

import {
  addPrerequisite,
  createVersion,
  transitionStatus,
} from '../src/modules/ontology/ontology.service';

describe('ontology.service core', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createVersion increments version and copies published nodes', async () => {
    mockPrisma.domain.findUnique.mockResolvedValue({ id: 'd1' });
    mockPrisma.ontologyVersion.findFirst
      .mockResolvedValueOnce({ versionNumber: 2 })
      .mockResolvedValueOnce({
        id: 'ov2',
        nodes: [
          {
            id: 'old-n1',
            title: 'Node 1',
            slug: 'node-1',
            description: 'd',
            learningOutcomes: ['a'],
            estimatedHours: 2,
            difficultyLevel: 1,
            isBranchingPoint: false,
            isConvergencePoint: false,
            branchPath: null,
            positionX: null,
            positionY: null,
            prerequisites: [],
          },
        ],
      });
    mockPrisma.ontologyVersion.create.mockResolvedValue({ id: 'ov3', versionNumber: 3 });
    mockPrisma.learningNode.create.mockResolvedValue({ id: 'new-n1' });

    const version = await createVersion('d1', 'u1');

    expect(version.versionNumber).toBe(3);
    expect(mockPrisma.learningNode.create).toHaveBeenCalled();
  });

  it('transitionStatus blocks invalid transition', async () => {
    mockPrisma.ontologyVersion.findUnique.mockResolvedValue({ status: 'draft' });

    await expect(transitionStatus('ov1', 'published', 'u1')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('transitionStatus to published requires valid DAG and nodes', async () => {
    mockPrisma.ontologyVersion.findUnique.mockResolvedValue({ status: 'verified' });
    mockPrisma.learningNode.findMany
      .mockResolvedValueOnce([{ id: 'n1' }, { id: 'n2' }])
      .mockResolvedValueOnce([{ id: 'n1' }, { id: 'n2' }]);
    mockPrisma.nodePrerequisite.findMany.mockResolvedValue([{ nodeId: 'n2', prerequisiteNodeId: 'n1' }]);
    mockPrisma.ontologyVersion.update.mockResolvedValue({ id: 'ov1', status: 'published' });

    const out = await transitionStatus('ov1', 'published', 'u1');

    expect(out.status).toBe('published');
    expect(mockPrisma.ontologyVersion.update).toHaveBeenCalled();
  });

  it('addPrerequisite rejects cycle creation', async () => {
    mockPrisma.learningNode.findUnique
      .mockResolvedValueOnce({ ontologyVersionId: 'ov1' })
      .mockResolvedValueOnce({ ontologyVersionId: 'ov1' });
    mockPrisma.ontologyVersion.findUnique.mockResolvedValue({ status: 'draft' });
    mockPrisma.nodePrerequisite.findUnique.mockResolvedValue(null);
    mockPrisma.learningNode.findMany.mockResolvedValue([{ id: 'n1' }, { id: 'n2' }]);
    mockPrisma.nodePrerequisite.findMany.mockResolvedValue([{ nodeId: 'n1', prerequisiteNodeId: 'n2' }]);

    await expect(addPrerequisite('n2', 'n1')).rejects.toMatchObject({ statusCode: 400 });
  });
});
