import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import type { EnrollInput } from './enrollments.types';
import type { BranchPath } from '@prisma/client';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getPublishedOntology(domainId: string) {
  const domain = await prisma.domain.findUnique({ where: { id: domainId } });
  if (!domain) throw ApiError.notFound('Domain not found');

  const ontology = await prisma.ontologyVersion.findFirst({
    where: { domainId, status: 'published' },
    orderBy: { versionNumber: 'desc' },
    include: {
      nodes: {
        select: {
          id: true,
          prerequisites: { select: { prerequisiteNodeId: true } },
        },
      },
    },
  });

  if (!ontology) throw ApiError.badRequest('Domain has no published ontology version');
  return ontology;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function enroll(userId: string, data: EnrollInput) {
  const existing = await prisma.enrollment.findUnique({
    where: { userId_domainId: { userId, domainId: data.domainId } },
  });
  if (existing) throw ApiError.conflict('Already enrolled in this domain');

  const ontology = await getPublishedOntology(data.domainId);

  const enrollment = await prisma.enrollment.create({
    data: {
      userId,
      domainId: data.domainId,
      ontologyVersionId: ontology.id,
      selectedBranchPath: (data.selectedBranchPath as BranchPath) ?? null,
      weeklyHours: data.weeklyHours ?? null,
      familiarityLevel: data.familiarityLevel ?? null,
      learningGoal: data.learningGoal ?? null,
      aboutSelf: data.aboutSelf ?? null,
    },
  });

  // Identify root nodes (no prerequisites)
  const rootNodeIds = new Set(
    ontology.nodes
      .filter((n) => n.prerequisites.length === 0)
      .map((n) => n.id),
  );

  // Bulk-create one progress row per node
  await prisma.learnerNodeProgress.createMany({
    data: ontology.nodes.map((node) => ({
      userId,
      nodeId: node.id,
      enrollmentId: enrollment.id,
      masteryState: 'not_started',
      unlocked: rootNodeIds.has(node.id),
    })),
  });

  return {
    enrollment,
    totalNodes: ontology.nodes.length,
    unlockedNodes: rootNodeIds.size,
  };
}

export async function listEnrollments(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId },
    orderBy: { enrolledAt: 'desc' },
    include: {
      domain: { select: { id: true, name: true, slug: true, iconUrl: true } },
      ontologyVersion: { select: { id: true, versionNumber: true } },
      _count: { select: { nodeProgress: true } },
    },
  });
}

export async function getEnrollment(enrollmentId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      domain: { select: { id: true, name: true, slug: true, iconUrl: true } },
      ontologyVersion: { select: { id: true, versionNumber: true, status: true } },
      _count: { select: { nodeProgress: true } },
    },
  });
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  if (enrollment.userId !== userId) throw ApiError.forbidden();
  return enrollment;
}

export async function unenroll(enrollmentId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  if (enrollment.userId !== userId) throw ApiError.forbidden();

  // Delete progress rows first (FK constraint), then the enrollment
  await prisma.learnerNodeProgress.deleteMany({ where: { enrollmentId } });
  await prisma.enrollment.delete({ where: { id: enrollmentId } });
}
