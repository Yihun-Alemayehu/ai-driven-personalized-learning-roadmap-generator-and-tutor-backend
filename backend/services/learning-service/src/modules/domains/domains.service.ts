import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import type { Domain, CreateDomainInput, UpdateDomainInput } from './domains.types';

export async function listDomains(): Promise<Domain[]> {
  return prisma.domain.findMany({ orderBy: { name: 'asc' } });
}

export async function getDomainBySlug(slug: string): Promise<Domain> {
  const domain = await prisma.domain.findUnique({ where: { slug } });
  if (!domain) throw ApiError.notFound('Domain not found');
  return domain;
}

export async function createDomain(data: CreateDomainInput): Promise<Domain> {
  const existing = await prisma.domain.findFirst({
    where: { OR: [{ name: data.name }, { slug: data.slug }] },
  });
  if (existing) {
    const field = existing.name === data.name ? 'name' : 'slug';
    throw ApiError.conflict(`Domain with this ${field} already exists`);
  }
  return prisma.domain.create({ data });
}

export async function updateDomain(id: string, data: UpdateDomainInput): Promise<Domain> {
  const domain = await prisma.domain.findUnique({ where: { id } });
  if (!domain) throw ApiError.notFound('Domain not found');

  if (data.name && data.name !== domain.name) {
    const clash = await prisma.domain.findUnique({ where: { name: data.name } });
    if (clash) throw ApiError.conflict('Domain name already taken');
  }
  if (data.slug && data.slug !== domain.slug) {
    const clash = await prisma.domain.findUnique({ where: { slug: data.slug } });
    if (clash) throw ApiError.conflict('Domain slug already taken');
  }

  return prisma.domain.update({ where: { id }, data });
}
