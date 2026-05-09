import type { BranchPath } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';

async function assertEnrollmentOwnership(enrollmentId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { userId: true, ontologyVersionId: true, selectedBranchPath: true },
  });
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  if (enrollment.userId !== userId) throw ApiError.forbidden();
  return enrollment;
}

const PATH_DESCRIPTIONS: Partial<Record<string, string>> = {
  frontend: 'Master modern frontend development with React, TypeScript, and advanced UI patterns',
  backend: 'Build scalable server-side applications with Node.js, databases, and API design',
  data_science: 'Explore data analysis, machine learning, and visualization techniques',
};

function toHours(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

export async function getBranchingPoints(enrollmentId: string, userId: string) {
  const enrollment = await assertEnrollmentOwnership(enrollmentId, userId);

  const branchingNodes = await prisma.learningNode.findMany({
    where: { ontologyVersionId: enrollment.ontologyVersionId, isBranchingPoint: true },
    select: { id: true, title: true, slug: true, description: true },
  });

  const pathGroups = await prisma.learningNode.groupBy({
    by: ['branchPath'],
    where: { ontologyVersionId: enrollment.ontologyVersionId, branchPath: { not: null } },
    _count: { id: true },
    _sum: { estimatedHours: true },
  });

  const pathSummaries = pathGroups.map((pg) => ({
    branchPath: pg.branchPath,
    nodeCount: pg._count.id,
    estimatedHours: toHours(pg._sum.estimatedHours),
    description: PATH_DESCRIPTIONS[pg.branchPath as string] ?? null,
  }));

  const branchingPoints = await Promise.all(
    branchingNodes.map(async (bp) => {
      const progress = await prisma.learnerNodeProgress.findUnique({
        where: { userId_nodeId: { userId, nodeId: bp.id } },
        select: { unlocked: true, masteryState: true },
      });
      return {
        node: { id: bp.id, title: bp.title, slug: bp.slug, description: bp.description },
        isReached: progress?.unlocked ?? false,
        isMastered: ['mastered', 'review_needed'].includes(progress?.masteryState ?? ''),
        paths: pathSummaries,
      };
    }),
  );

  return { selectedBranchPath: enrollment.selectedBranchPath, branchingPoints };
}

export async function getAvailablePaths(enrollmentId: string, userId: string) {
  const enrollment = await assertEnrollmentOwnership(enrollmentId, userId);

  const pathGroups = await prisma.learningNode.groupBy({
    by: ['branchPath'],
    where: { ontologyVersionId: enrollment.ontologyVersionId, branchPath: { not: null } },
    _count: { id: true },
    _sum: { estimatedHours: true },
  });

  return {
    selectedBranchPath: enrollment.selectedBranchPath,
    paths: pathGroups.map((pg) => ({
      branchPath: pg.branchPath,
      nodeCount: pg._count.id,
      estimatedHours: toHours(pg._sum.estimatedHours),
      description: PATH_DESCRIPTIONS[pg.branchPath as string] ?? null,
    })),
  };
}

// Returns { valid, unmetPrereqs } — checks that at least one branching point is unlocked.
// If the ontology has no branching points, selection is always valid (open ontology).
async function validatePathSelectionPrereqs(
  ontologyVersionId: string,
  enrollmentId: string,
  userId: string,
): Promise<{ valid: boolean; unmetPrereqs: { nodeId: string; title: string }[] }> {
  const branchingPoints = await prisma.learningNode.findMany({
    where: { ontologyVersionId, isBranchingPoint: true },
    select: {
      id: true,
      title: true,
      prerequisites: { select: { prerequisiteNodeId: true } },
    },
  });

  if (branchingPoints.length === 0) return { valid: true, unmetPrereqs: [] };

  const progressRows = await prisma.learnerNodeProgress.findMany({
    where: { enrollmentId },
    select: { nodeId: true, masteryState: true, unlocked: true },
  });
  const progressMap = new Map(progressRows.map((p) => [p.nodeId, p]));
  const completedStates = new Set(['mastered', 'review_needed']);

  // Sufficient: any branching point is unlocked (all its prereqs are done)
  for (const bp of branchingPoints) {
    if (progressMap.get(bp.id)?.unlocked) return { valid: true, unmetPrereqs: [] };
  }

  // Build list of unmet prereqs for the first branching point to give actionable feedback
  const firstBp = branchingPoints[0];
  const unmetNodeIds = firstBp.prerequisites
    .map((p) => p.prerequisiteNodeId)
    .filter((id) => {
      const p = progressMap.get(id);
      return !p || !completedStates.has(p.masteryState);
    });

  const unmetNodes = await prisma.learningNode.findMany({
    where: { id: { in: unmetNodeIds } },
    select: { id: true, title: true },
  });

  return { valid: false, unmetPrereqs: unmetNodes.map((n) => ({ nodeId: n.id, title: n.title })) };
}

async function applyPathChange(
  enrollmentId: string,
  userId: string,
  branchPath: string,
): Promise<{ enrollment: { id: string; selectedBranchPath: BranchPath | null } }> {
  const enrollment = await assertEnrollmentOwnership(enrollmentId, userId);

  const { valid, unmetPrereqs } = await validatePathSelectionPrereqs(
    enrollment.ontologyVersionId,
    enrollmentId,
    userId,
  );

  if (!valid) {
    throw ApiError.badRequest('Prerequisites for path selection not yet met', { unmetPrereqs });
  }

  const updated = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { selectedBranchPath: branchPath as BranchPath },
    select: {
      id: true,
      selectedBranchPath: true,
      domain: { select: { id: true, name: true, slug: true } },
    },
  });

  return { enrollment: updated };
}

export async function selectPath(enrollmentId: string, userId: string, branchPath: string) {
  return applyPathChange(enrollmentId, userId, branchPath);
}

export async function switchPath(enrollmentId: string, userId: string, newBranchPath: string) {
  return applyPathChange(enrollmentId, userId, newBranchPath);
}
