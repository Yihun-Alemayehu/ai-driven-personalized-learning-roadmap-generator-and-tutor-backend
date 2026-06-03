import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockPrisma: any = {
  domain: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
};

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }));

import { listDomains, getDomainBySlug, createDomain, updateDomain } from '../src/modules/domains/domains.service';

describe('domains.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('listDomains returns domains sorted by name ascending', async () => {
    const rows = [{ name: 'A' }, { name: 'B' }];
    mockPrisma.domain.findMany.mockResolvedValue(rows);

    const result = await listDomains();

    expect(mockPrisma.domain.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
    expect(result).toEqual(rows);
  });

  it('getDomainBySlug returns domain when found', async () => {
    mockPrisma.domain.findUnique.mockResolvedValue({ id: 'd1', slug: 'js' });

    const result = await getDomainBySlug('js');

    expect(result.slug).toBe('js');
  });

  it('getDomainBySlug throws 404 when not found', async () => {
    mockPrisma.domain.findUnique.mockResolvedValue(null);
    await expect(getDomainBySlug('nope')).rejects.toThrow('Domain not found');
  });

  it('createDomain auto-generates slug from name when not provided', async () => {
    mockPrisma.domain.findFirst.mockResolvedValue(null);
    mockPrisma.domain.create.mockImplementation(({ data }: any) => Promise.resolve(data));

    const result = await createDomain({ name: 'JavaScript & ES6' });

    expect(mockPrisma.domain.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: 'JavaScript & ES6', slug: 'javascript-es6' }),
    });
  });

  it('createDomain uses provided slug', async () => {
    mockPrisma.domain.findFirst.mockResolvedValue(null);
    mockPrisma.domain.create.mockImplementation(({ data }: any) => Promise.resolve(data));

    const result = await createDomain({ name: 'JavaScript', slug: 'custom-js' });

    expect(result.slug).toBe('custom-js');
  });

  it('createDomain throws conflict on duplicate name', async () => {
    mockPrisma.domain.findFirst.mockResolvedValue({ name: 'JavaScript', slug: 'js' });

    await expect(createDomain({ name: 'JavaScript' })).rejects.toThrow('Domain with this name already exists');
  });

  it('createDomain throws conflict on duplicate slug', async () => {
    mockPrisma.domain.findFirst.mockResolvedValue({ name: 'Other', slug: 'js' });

    await expect(createDomain({ name: 'Unique', slug: 'js' })).rejects.toThrow('Domain with this slug already exists');
  });

  it('updateDomain updates fields when no conflicts', async () => {
    mockPrisma.domain.findUnique.mockResolvedValue({ id: 'd1', name: 'Old', slug: 'old' });
    mockPrisma.domain.findUnique.mockImplementation((args: any) =>
      args.where.name ? null : args.where.slug ? null : Promise.resolve(null),
    );
    mockPrisma.domain.update.mockImplementation(({ data }: any) => Promise.resolve({ id: 'd1', ...data }));

    const result = await updateDomain('d1', { name: 'New', slug: 'new' });

    expect(mockPrisma.domain.update).toHaveBeenCalledWith({ where: { id: 'd1' }, data: { name: 'New', slug: 'new' } });
    expect(result.name).toBe('New');
  });

  it('updateDomain throws 404 for missing domain', async () => {
    mockPrisma.domain.findUnique.mockResolvedValue(null);
    await expect(updateDomain('bad', { name: 'Nope' })).rejects.toThrow('Domain not found');
  });

  it('updateDomain throws conflict on name clash', async () => {
    mockPrisma.domain.findUnique
      .mockResolvedValueOnce({ id: 'd1', name: 'Old', slug: 'old' })
      .mockResolvedValueOnce({ id: 'd2', name: 'Taken' });

    await expect(updateDomain('d1', { name: 'Taken' })).rejects.toThrow('Domain name already taken');
  });
});
