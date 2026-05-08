import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { discoverForNode } from '../pse/pse.service';
import { validateAllResources } from '../linkValidator/linkValidator.service';
import type { ResourceModality } from '@prisma/client';

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getResources(nodeId: string) {
  const node = await prisma.learningNode.findUnique({ where: { id: nodeId } });
  if (!node) throw ApiError.notFound('Node not found');

  return prisma.resource.findMany({
    where: { nodeId, isValid: true },
    orderBy: [{ isPrimary: 'desc' }, { avgRating: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      title: true,
      url: true,
      sourceDomain: true,
      modality: true,
      description: true,
      isPrimary: true,
      avgRating: true,
      ratingCount: true,
      lastValidatedAt: true,
      fetchedVia: true,
      createdAt: true,
    },
  });
}

// ── PSE Discovery ─────────────────────────────────────────────────────────────

export async function discoverResources(nodeId: string) {
  const node = await prisma.learningNode.findUnique({ where: { id: nodeId } });
  if (!node) throw ApiError.notFound('Node not found');
  return discoverForNode(nodeId);
}

// ── Write (admin/expert) ──────────────────────────────────────────────────────

export async function createResource(data: {
  nodeId: string;
  title: string;
  url: string;
  sourceDomain: string;
  modality: string;
  description?: string;
  isPrimary?: boolean;
}) {
  const node = await prisma.learningNode.findUnique({ where: { id: data.nodeId } });
  if (!node) throw ApiError.notFound('Node not found');

  const duplicate = await prisma.resource.findFirst({ where: { nodeId: data.nodeId, url: data.url } });
  if (duplicate) throw ApiError.conflict('Resource with this URL already exists for this node');

  return prisma.resource.create({
    data: {
      nodeId: data.nodeId,
      title: data.title,
      url: data.url,
      sourceDomain: data.sourceDomain,
      modality: data.modality as ResourceModality,
      description: data.description,
      isPrimary: data.isPrimary ?? false,
      fetchedVia: 'manual',
    },
  });
}

export async function updateResource(
  id: string,
  data: Partial<{
    title: string;
    url: string;
    modality: string;
    description: string;
    isPrimary: boolean;
  }>,
) {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) throw ApiError.notFound('Resource not found');

  const { modality, ...rest } = data;
  return prisma.resource.update({
    where: { id },
    data: {
      ...rest,
      ...(modality ? { modality: modality as ResourceModality } : {}),
    },
  });
}

export async function deleteResource(id: string) {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) throw ApiError.notFound('Resource not found');
  await prisma.resourceRating.deleteMany({ where: { resourceId: id } });
  await prisma.resource.delete({ where: { id } });
}

// ── Ratings ───────────────────────────────────────────────────────────────────

export async function rateResource(
  resourceId: string,
  userId: string,
  data: { rating: number; comment?: string },
) {
  const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
  if (!resource) throw ApiError.notFound('Resource not found');

  // Upsert rating
  await prisma.resourceRating.upsert({
    where: { resourceId_userId: { resourceId, userId } },
    create: { resourceId, userId, rating: data.rating, comment: data.comment },
    update: { rating: data.rating, comment: data.comment },
  });

  // Recompute aggregate from DB for accuracy
  const agg = await prisma.resourceRating.aggregate({
    where: { resourceId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const avgRating = agg._avg.rating ?? 0;
  const ratingCount = agg._count.rating;

  await prisma.resource.update({
    where: { id: resourceId },
    data: { avgRating, ratingCount },
  });

  return { avgRating, ratingCount };
}

// ── Link validation ───────────────────────────────────────────────────────────

export async function triggerLinkValidation() {
  return validateAllResources();
}
