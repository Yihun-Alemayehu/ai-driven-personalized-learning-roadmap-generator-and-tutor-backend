import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockPrisma: any = {
  resource: { findMany: jest.fn() },
  learningNode: { findUnique: jest.fn() },
};

const mockDiscoverForNode: any = jest.fn();

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }));
jest.mock('../src/modules/pse/pse.service', () => ({ discoverForNode: mockDiscoverForNode }));

import { getAdaptedResources } from '../src/modules/adaptation/adaptation.service';

describe('adaptation.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const makeResource = (modality: string, rating = 3) => ({
    id: `r-${modality}`,
    modality,
    avgRating: rating,
    createdAt: new Date(),
    isValid: true,
  });

  it('returns resources ordered by rating for a node', async () => {
    const r1 = makeResource('video', 5);
    const r2 = makeResource('documentation', 3);
    mockPrisma.resource.findMany.mockResolvedValue([r1, r2]);

    const result = await getAdaptedResources('node-1');

    expect(mockPrisma.resource.findMany).toHaveBeenCalledWith({
      where: { nodeId: 'node-1', isValid: true },
      orderBy: [{ avgRating: 'desc' }, { createdAt: 'asc' }],
    });
    expect(result).toEqual([r1, r2]);
  });

  it('triggers PSE discovery when no resources exist', async () => {
    mockPrisma.resource.findMany.mockResolvedValue([]);
    mockPrisma.learningNode.findUnique.mockResolvedValue({ title: 'Closures' });
    mockDiscoverForNode.mockResolvedValue([makeResource('tutorial')]);

    const result = await getAdaptedResources('node-1');

    expect(mockDiscoverForNode).toHaveBeenCalledWith('node-1', expect.stringContaining('Closures tutorial beginner guide'));
    expect(result).toHaveLength(1);
  });

  it('swaps modality based on most common source modality', async () => {
    const resources = [
      makeResource('documentation', 4),
      makeResource('documentation', 3),
      makeResource('video', 5),
      makeResource('interactive', 2),
    ];
    mockPrisma.resource.findMany.mockResolvedValue(resources);

    // Most common = documentation → SWAP_PREFERENCE = ['tutorial', 'video', 'interactive']
    // Tutorial not present → skip, video present → return video resources
    const result = await getAdaptedResources('node-1');

    expect(result).toHaveLength(1);
    expect(result[0].modality).toBe('video');
  });

  it('uses explicit fromModality override when provided', async () => {
    const resources = [
      makeResource('tutorial', 4),
      makeResource('documentation', 5),
    ];
    mockPrisma.resource.findMany.mockResolvedValue(resources);

    // fromModality = 'interactive' → SWAP_PREFERENCE = ['tutorial', 'documentation', 'video']
    // tutorial present → return tutorial
    const result = await getAdaptedResources('node-1', 'interactive');

    expect(result).toHaveLength(1);
    expect(result[0].modality).toBe('tutorial');
  });

  it('triggers PSE when no alternative modality exists in swap chain', async () => {
    const resources = [makeResource('reference', 3)]; // only reference
    mockPrisma.resource.findMany.mockResolvedValue(resources);
    mockPrisma.learningNode.findUnique.mockResolvedValue({ title: 'Scope' });
    // reference → ['tutorial', 'documentation', 'video'] — none present
    mockDiscoverForNode.mockResolvedValue([makeResource('tutorial')]);

    const result = await getAdaptedResources('node-1');

    expect(mockDiscoverForNode).toHaveBeenCalledWith('node-1', expect.stringContaining('Scope tutorial video guide'));
    expect(result).toHaveLength(1);
  });

  it('caps alternative modality results to 3', async () => {
    const resources = Array.from({ length: 5 }, (_, i) => makeResource('video', 5 - i));
    mockPrisma.resource.findMany.mockResolvedValue(resources);

    const result = await getAdaptedResources('node-1', 'documentation');

    expect(result.length).toBeLessThanOrEqual(3);
  });
});
