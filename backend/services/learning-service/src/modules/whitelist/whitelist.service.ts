import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import type { ResourceModality } from '@prisma/client';

export async function listWhitelist(domainId: string) {
  const domain = await prisma.domain.findUnique({ where: { id: domainId } });
  if (!domain) throw ApiError.notFound('Domain not found');

  return prisma.domainWhitelist.findMany({
    where: { domainId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      sourceDomain: true,
      sourceName: true,
      defaultModality: true,
      createdAt: true,
      addedBy: { select: { id: true, fullName: true } },
    },
  });
}

export async function addToWhitelist(
  domainId: string,
  data: { sourceDomain: string; sourceName: string; defaultModality: string },
  userId: string,
) {
  const domain = await prisma.domain.findUnique({ where: { id: domainId } });
  if (!domain) throw ApiError.notFound('Domain not found');

  const existing = await prisma.domainWhitelist.findUnique({
    where: { domainId_sourceDomain: { domainId, sourceDomain: data.sourceDomain } },
  });
  if (existing) throw ApiError.conflict('Source domain already whitelisted');

  return prisma.domainWhitelist.create({
    data: {
      domainId,
      sourceDomain: data.sourceDomain,
      sourceName: data.sourceName,
      defaultModality: data.defaultModality as ResourceModality,
      addedById: userId,
    },
  });
}

export async function removeFromWhitelist(id: string) {
  const entry = await prisma.domainWhitelist.findUnique({ where: { id } });
  if (!entry) throw ApiError.notFound('Whitelist entry not found');
  await prisma.domainWhitelist.delete({ where: { id } });
}
