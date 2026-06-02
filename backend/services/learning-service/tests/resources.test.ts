import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockPrisma: any = {
  learningNode: { findUnique: jest.fn() },
  resource: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  resourceRating: { upsert: jest.fn(), aggregate: jest.fn(), deleteMany: jest.fn() },
};

const mockDiscoverForNode: any = jest.fn();
const mockValidateAllResources: any = jest.fn();

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }));
jest.mock('../src/modules/pse/pse.service', () => ({ discoverForNode: mockDiscoverForNode }));
jest.mock('../src/modules/linkValidator/linkValidator.service', () => ({ validateAllResources: mockValidateAllResources }));

import {
  getResources,
  discoverResources,
  createResource,
  updateResource,
  deleteResource,
  rateResource,
  triggerLinkValidation,
} from '../src/modules/resources/resources.service';

describe('resources.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getResources returns valid resources ordered by primary then rating', async () => {
    mockPrisma.learningNode.findUnique.mockResolvedValue({ id: 'node-1' });
    mockPrisma.resource.findMany.mockResolvedValue([
      { id: 'r1', title: 'Guide', isPrimary: true, avgRating: 4 },
    ]);

    const result = await getResources('node-1');

    expect(mockPrisma.resource.findMany).toHaveBeenCalledWith({
      where: { nodeId: 'node-1', isValid: true },
      orderBy: [{ isPrimary: 'desc' }, { avgRating: 'desc' }, { createdAt: 'asc' }],
      select: expect.any(Object),
    });
    expect(result).toHaveLength(1);
  });

  it('getResources throws 404 for missing node', async () => {
    mockPrisma.learningNode.findUnique.mockResolvedValue(null);
    await expect(getResources('bad')).rejects.toThrow('Node not found');
  });

  it('discoverResources delegates to PSE service', async () => {
    mockPrisma.learningNode.findUnique.mockResolvedValue({ id: 'node-1' });
    mockDiscoverForNode.mockResolvedValue([{ id: 'r1' }]);

    const result = await discoverResources('node-1');

    expect(mockDiscoverForNode).toHaveBeenCalledWith('node-1');
    expect(result).toEqual([{ id: 'r1' }]);
  });

  it('createResource creates resource for valid node with no duplicate', async () => {
    mockPrisma.learningNode.findUnique.mockResolvedValue({ id: 'node-1' });
    mockPrisma.resource.findFirst.mockResolvedValue(null);
    mockPrisma.resource.create.mockResolvedValue({ id: 'new-resource' });

    const result = await createResource({
      nodeId: 'node-1',
      title: 'JS Guide',
      url: 'https://example.com',
      sourceDomain: 'example.com',
      modality: 'documentation',
    });

    expect(mockPrisma.resource.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ nodeId: 'node-1', title: 'JS Guide', modality: 'documentation', fetchedVia: 'manual' }),
    });
    expect(result.id).toBe('new-resource');
  });

  it('createResource throws conflict on duplicate URL per node', async () => {
    mockPrisma.learningNode.findUnique.mockResolvedValue({ id: 'node-1' });
    mockPrisma.resource.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(createResource({ nodeId: 'node-1', title: 't', url: 'https://dup.com', sourceDomain: 'd', modality: 'tutorial' }))
      .rejects.toThrow('Resource with this URL already exists for this node');
  });

  it('updateResource updates allowed fields', async () => {
    mockPrisma.resource.findUnique.mockResolvedValue({ id: 'r1' });
    mockPrisma.resource.update.mockResolvedValue({ id: 'r1', title: 'Updated' });

    const result = await updateResource('r1', { title: 'Updated', modality: 'video' });

    expect(mockPrisma.resource.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { title: 'Updated', modality: 'video' },
    });
    expect(result.title).toBe('Updated');
  });

  it('deleteResource deletes ratings then resource', async () => {
    mockPrisma.resource.findUnique.mockResolvedValue({ id: 'r1' });

    await deleteResource('r1');

    expect(mockPrisma.resourceRating.deleteMany).toHaveBeenCalledWith({ where: { resourceId: 'r1' } });
    expect(mockPrisma.resource.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
  });

  it('rateResource upserts, recomputes aggregate, and updates resource', async () => {
    mockPrisma.resource.findUnique.mockResolvedValue({ id: 'r1' });
    mockPrisma.resourceRating.upsert.mockResolvedValue({});
    mockPrisma.resourceRating.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: { rating: 10 } });

    const result = await rateResource('r1', 'user-1', { rating: 5, comment: 'Great' });

    expect(mockPrisma.resourceRating.upsert).toHaveBeenCalledWith({
      where: { resourceId_userId: { resourceId: 'r1', userId: 'user-1' } },
      create: { resourceId: 'r1', userId: 'user-1', rating: 5, comment: 'Great' },
      update: { rating: 5, comment: 'Great' },
    });
    expect(mockPrisma.resource.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { avgRating: 4.5, ratingCount: 10 },
    });
    expect(result).toEqual({ avgRating: 4.5, ratingCount: 10 });
  });

  it('triggerLinkValidation calls validateAllResources', async () => {
    mockValidateAllResources.mockResolvedValue({ checked: 5, invalid: 1 });

    const result = await triggerLinkValidation();

    expect(mockValidateAllResources).toHaveBeenCalled();
    expect(result).toEqual({ checked: 5, invalid: 1 });
  });
});
