import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import type { EnrollInput } from './enrollments.types';
import type { BranchPath, MasteryState } from '@prisma/client';

// ── Helpers ───────────────────────────────────────────────────────────────────

interface OntologyNode {
  id: string;
  title: string;
  description: string | null;
  learningOutcomes: unknown;
  difficultyLevel: number | null;
  isBranchingPoint: boolean;
  isConvergencePoint: boolean;
  branchPath: BranchPath | null;
  prerequisites: { prerequisiteNodeId: string }[];
}

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
          title: true,
          description: true,
          learningOutcomes: true,
          difficultyLevel: true,
          isBranchingPoint: true,
          isConvergencePoint: true,
          branchPath: true,
          prerequisites: { select: { prerequisiteNodeId: true } },
        },
      },
    },
  });

  if (!ontology) throw ApiError.badRequest('Domain has no published ontology version');
  return ontology;
}

function parseSkillKeywords(priorSkills: string): string[] {
  return priorSkills
    .split(/[,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length >= 2);
}

function nodeMatchesSkills(node: OntologyNode, skills: string[]): boolean {
  const haystack = [
    node.title,
    node.description ?? '',
    ...(Array.isArray(node.learningOutcomes) ? (node.learningOutcomes as string[]) : []),
  ]
    .join(' ')
    .toLowerCase();

  return skills.some((skill) => haystack.includes(skill));
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
      preferredLearningStyle: data.preferredLearningStyle ?? null,
      priorSkills: data.priorSkills ?? null,
    },
  });

  const level = data.familiarityLevel ?? 'beginner';
  const skillKeywords = data.priorSkills ? parseSkillKeywords(data.priorSkills) : [];

  // Identify root nodes (no prerequisites)
  const rootNodeIds = new Set(
    ontology.nodes
      .filter((n) => n.prerequisites.length === 0)
      .map((n) => n.id),
  );

  // ── Node Subtraction: identify nodes the learner already knows ──
  const autoMasteredIds = new Set<string>();
  if (skillKeywords.length > 0) {
    for (const node of ontology.nodes) {
      if (node.isBranchingPoint) continue;
      if (nodeMatchesSkills(node, skillKeywords)) {
        autoMasteredIds.add(node.id);
      }
    }
  }

  // ── Unlock Acceleration: based on familiarity level ──
  const autoUnlockedIds = new Set<string>(rootNodeIds);
  if (level === 'advanced') {
    for (const node of ontology.nodes) {
      if (node.difficultyLevel != null && node.difficultyLevel <= 2) {
        autoUnlockedIds.add(node.id);
      }
      if (node.difficultyLevel != null && node.difficultyLevel === 1) {
        autoMasteredIds.add(node.id);
      }
    }
  } else if (level === 'intermediate') {
    for (const node of ontology.nodes) {
      if (node.difficultyLevel != null && node.difficultyLevel === 1) {
        autoUnlockedIds.add(node.id);
      }
    }
  }

  // Auto-mastered nodes must also be unlocked
  for (const id of autoMasteredIds) {
    autoUnlockedIds.add(id);
  }

  // Bulk-create one progress row per node
  await prisma.learnerNodeProgress.createMany({
    data: ontology.nodes.map((node) => {
      const isMastered = autoMasteredIds.has(node.id);
      return {
        userId,
        nodeId: node.id,
        enrollmentId: enrollment.id,
        masteryState: (isMastered ? 'mastered' : 'not_started') as MasteryState,
        unlocked: autoUnlockedIds.has(node.id),
        ...(isMastered ? { masteredAt: new Date() } : {}),
      };
    }),
  });

  // After auto-mastering, cascade unlock downstream nodes whose prereqs are now all mastered
  if (autoMasteredIds.size > 0) {
    const { checkAndUnlockNodes } = await import('../progress/progress.service');
    await checkAndUnlockNodes(userId, enrollment.id);
  }

  // ── Node Addition: supplementary nodes ──
  const supplementaryData: {
    enrollmentId: string;
    title: string;
    description: string;
    nodeType: string;
    targetNodeId: string | null;
    position: string;
  }[] = [];

  // Filter visible nodes for the selected branch
  const selectedBranch = data.selectedBranchPath ?? null;
  const visibleNodes = selectedBranch
    ? ontology.nodes.filter(
        (n) => n.branchPath === null || n.branchPath === selectedBranch || n.isConvergencePoint,
      )
    : ontology.nodes;

  // Primer nodes for beginners before hard nodes
  if (level === 'beginner') {
    for (const node of visibleNodes) {
      if (node.difficultyLevel != null && node.difficultyLevel >= 4 && !node.isBranchingPoint) {
        supplementaryData.push({
          enrollmentId: enrollment.id,
          title: `Primer: ${node.title}`,
          description: `Foundational review to prepare for "${node.title}". Covers prerequisite concepts you may need.`,
          nodeType: 'primer',
          targetNodeId: node.id,
          position: 'before',
        });
      }
    }
  }

  // Practice exam nodes for certification goal
  if (data.learningGoal === 'certification') {
    const branchNodes = visibleNodes.filter((n) => !n.isBranchingPoint && !n.isConvergencePoint);
    if (branchNodes.length > 0) {
      const lastNode = branchNodes[branchNodes.length - 1];
      supplementaryData.push({
        enrollmentId: enrollment.id,
        title: 'Practice Exam',
        description: 'Comprehensive practice exam covering all topics in your learning path. Tests exam-style questions for certification preparation.',
        nodeType: 'practice_exam',
        targetNodeId: lastNode.id,
        position: 'end_of_branch',
      });
    }
  }

  // Portfolio project nodes for get_job goal
  if (data.learningGoal === 'get_job') {
    const convergenceNodes = visibleNodes.filter((n) => n.isConvergencePoint);
    for (const node of convergenceNodes) {
      supplementaryData.push({
        enrollmentId: enrollment.id,
        title: `Portfolio Project: ${node.title}`,
        description: `Guided project demonstrating skills from your learning path. Build something portfolio-worthy at the "${node.title}" convergence point.`,
        nodeType: 'portfolio_project',
        targetNodeId: node.id,
        position: 'after',
      });
    }
  }

  if (supplementaryData.length > 0) {
    await prisma.supplementaryNode.createMany({ data: supplementaryData });
  }

  return {
    enrollment,
    totalNodes: ontology.nodes.length,
    unlockedNodes: autoUnlockedIds.size,
    personalization: {
      skippedNodes: autoMasteredIds.size,
      supplementaryNodes: supplementaryData.length,
      unlockAcceleration: level !== 'beginner' ? level : null,
    },
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
