import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockPrisma: any = {
  learningNode: { findUnique: jest.fn() },
  domainWhitelist: { findMany: jest.fn() },
  resource: { findMany: jest.fn(), create: jest.fn() },
};

const mockRedis: any = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
};

const mockSearch: any = jest.fn();

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }));
jest.mock('../src/lib/redis', () => ({ redis: mockRedis }));
jest.mock('../src/modules/pse/pse.client', () => ({ search: mockSearch }));

import { discoverForNode, bustCache } from '../src/modules/pse/pse.service';

describe('pse.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns cached results from redis when available', async () => {
    const cached = [{ id: 'r1', title: 'Cached' }];
    mockRedis.get.mockResolvedValue(JSON.stringify(cached));

    const result = await discoverForNode('node-1');

    expect(mockRedis.get).toHaveBeenCalledWith('serper:node:node-1');
    expect(mockPrisma.learningNode.findUnique).not.toHaveBeenCalled();
    expect(result).toEqual(cached);
  });

  it('returns empty array when node is not found', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockPrisma.learningNode.findUnique.mockResolvedValue(null);

    const result = await discoverForNode('node-1');

    expect(result).toEqual([]);
  });

  it('queries whitelist sources and creates resources', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockPrisma.learningNode.findUnique.mockResolvedValue({
      id: 'node-1',
      title: 'Closures',
      learningOutcomes: ['Understand closure', 'Use closure'],
      ontologyVersion: { domainId: 'domain-1' },
    });
    mockPrisma.domainWhitelist.findMany.mockResolvedValue([
      { sourceDomain: 'developer.mozilla.org', defaultModality: 'reference' },
      { sourceDomain: 'javascript.info', defaultModality: 'tutorial' },
    ]);
    mockPrisma.resource.findMany.mockResolvedValue([]);
    mockSearch.mockResolvedValue([
      { link: 'https://developer.mozilla.org/closures', title: 'MDN Closures', snippet: 'Guide' },
      { link: 'https://javascript.info/closure', title: 'JS Info Closures', snippet: 'Tutorial' },
    ]);
    mockPrisma.resource.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 'new', ...data }));

    const result = await discoverForNode('node-1');

    expect(mockSearch).toHaveBeenCalledTimes(2);
    expect(mockSearch).toHaveBeenCalledWith(expect.stringContaining('Closures'), 'developer.mozilla.org');
    expect(mockPrisma.resource.create).toHaveBeenCalledTimes(2);
    expect(mockRedis.setex).toHaveBeenCalledWith('serper:node:node-1', 86400, expect.any(String));
    expect(result).toHaveLength(2);
  });

  it('deduplicates against existing resource URLs', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockPrisma.learningNode.findUnique.mockResolvedValue({
      id: 'node-1',
      title: 'Closures',
      learningOutcomes: [],
      ontologyVersion: { domainId: 'domain-1' },
    });
    mockPrisma.domainWhitelist.findMany.mockResolvedValue([
      { sourceDomain: '', defaultModality: 'documentation' },
    ]);
    mockPrisma.resource.findMany.mockResolvedValue([{ url: 'https://example.com/dup' }]);
    mockSearch.mockResolvedValue([
      { link: 'https://example.com/dup', title: 'Dup', snippet: '' },
      { link: 'https://example.com/new', title: 'New', snippet: '' },
    ]);
    mockPrisma.resource.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 'new', ...data }));

    const result = await discoverForNode('node-1');

    expect(mockPrisma.resource.create).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('New');
  });

  it('uses queryOverride when provided', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockPrisma.learningNode.findUnique.mockResolvedValue({
      id: 'node-1',
      title: 'Closures',
      learningOutcomes: [],
      ontologyVersion: { domainId: 'domain-1' },
    });
    mockPrisma.domainWhitelist.findMany.mockResolvedValue([]);
    mockPrisma.resource.findMany.mockResolvedValue([]);
    mockSearch.mockResolvedValue([]);

    await discoverForNode('node-1', 'custom query');

    expect(mockSearch).toHaveBeenCalledWith('custom query', undefined);
  });

  it('bustCache deletes the redis key', async () => {
    await bustCache('node-1');
    expect(mockRedis.del).toHaveBeenCalledWith('serper:node:node-1');
  });
});
