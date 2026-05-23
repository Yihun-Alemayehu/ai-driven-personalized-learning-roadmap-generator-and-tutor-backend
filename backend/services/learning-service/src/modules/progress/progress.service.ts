import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import type { MasteryState, ProgressStats, RoadmapNode, RoadmapEdge, SupplementaryNodeRow } from './progress.types';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function assertOwnership(enrollmentId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { userId: true, ontologyVersionId: true, selectedBranchPath: true },
  });
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  if (enrollment.userId !== userId) throw ApiError.forbidden();
  return enrollment;
}

// ── Progress Queries ──────────────────────────────────────────────────────────

export async function getProgress(enrollmentId: string, userId: string) {
  await assertOwnership(enrollmentId, userId);

  return prisma.learnerNodeProgress.findMany({
    where: { enrollmentId },
    orderBy: { createdAt: 'asc' },
    include: {
      node: {
        select: {
          id: true,
          title: true,
          slug: true,
          estimatedHours: true,
          difficultyLevel: true,
        },
      },
    },
  });
}

export async function getStats(enrollmentId: string, userId: string): Promise<ProgressStats> {
  await assertOwnership(enrollmentId, userId);

  const rows = await prisma.learnerNodeProgress.findMany({
    where: { enrollmentId },
    select: {
      masteryState: true,
      unlocked: true,
      bestQuizScore: true,
      lastReviewedAt: true,
    },
  });

  const totalNodes = rows.length;
  const unlockedNodes = rows.filter((r) => r.unlocked).length;
  const completedStates: MasteryState[] = ['mastered', 'review_needed'];
  const completedNodes = rows.filter((r) =>
    completedStates.includes(r.masteryState as MasteryState),
  ).length;
  const completionPercent = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  const scores = rows
    .map((r) => r.bestQuizScore)
    .filter((s) => s !== null)
    .map((s) => Number(s))
    .filter((s) => !isNaN(s));
  const avgQuizScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  // Streak: count consecutive calendar days with any activity (lastReviewedAt not null)
  const currentStreak = computeStreak(
    rows.map((r) => r.lastReviewedAt).filter((d): d is Date => d !== null),
  );

  const byState = rows.reduce(
    (acc, r) => {
      const s = r.masteryState as MasteryState;
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    {} as Record<MasteryState, number>,
  );

  // Ensure all states present
  for (const s of ['not_started', 'in_progress', 'mastered', 'review_needed', 'relearn'] as MasteryState[]) {
    byState[s] = byState[s] ?? 0;
  }

  return { totalNodes, unlockedNodes, completedNodes, completionPercent, avgQuizScore, currentStreak, byState };
}

function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const daySet = new Set(dates.map((d) => d.toISOString().slice(0, 10)));
  const days = [...daySet].sort().reverse();

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (days[0] !== today && days[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ── Roadmap ───────────────────────────────────────────────────────────────────

export async function getRoadmap(
  enrollmentId: string,
  userId: string,
): Promise<{ nodes: RoadmapNode[]; edges: RoadmapEdge[]; selectedBranchPath: string | null; supplementaryNodes: SupplementaryNodeRow[] }> {
  const enrollment = await assertOwnership(enrollmentId, userId);

  const [nodes, progressRows, edges, supplementary] = await Promise.all([
    prisma.learningNode.findMany({
      where: { ontologyVersionId: enrollment.ontologyVersionId },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        estimatedHours: true,
        difficultyLevel: true,
        isBranchingPoint: true,
        isConvergencePoint: true,
        branchPath: true,
        positionX: true,
        positionY: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.learnerNodeProgress.findMany({
      where: { enrollmentId },
      select: {
        nodeId: true,
        masteryState: true,
        unlocked: true,
        bestQuizScore: true,
        attemptsCount: true,
        masteredAt: true,
      },
    }),
    prisma.nodePrerequisite.findMany({
      where: {
        node: { ontologyVersionId: enrollment.ontologyVersionId },
      },
      select: { id: true, nodeId: true, prerequisiteNodeId: true },
    }),
    prisma.supplementaryNode.findMany({
      where: { enrollmentId },
      select: {
        id: true,
        title: true,
        description: true,
        nodeType: true,
        targetNodeId: true,
        position: true,
      },
    }),
  ]);

  const progressMap = new Map(progressRows.map((p) => [p.nodeId, p]));

  // Detect auto-mastered nodes: mastered with masteredAt within 5s of enrollment creation
  // (set during enrollment, not via quiz)
  const autoMasteredIds = new Set<string>();
  for (const p of progressRows) {
    if (p.masteryState === 'mastered' && p.masteredAt && p.attemptsCount === 0) {
      autoMasteredIds.add(p.nodeId);
    }
  }

  // Filter nodes to selected path: show shared (branchPath=null), selected path, and convergence nodes
  const { selectedBranchPath } = enrollment;
  const visibleNodes = selectedBranchPath
    ? nodes.filter(
        (n) => n.branchPath === null || n.branchPath === selectedBranchPath || n.isConvergencePoint,
      )
    : nodes;

  const visibleIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = edges.filter(
    (e) => visibleIds.has(e.nodeId) && visibleIds.has(e.prerequisiteNodeId),
  );

  const roadmapNodes: RoadmapNode[] = visibleNodes.map((n) => {
    const p = progressMap.get(n.id);
    return {
      ...n,
      masteryState: (p?.masteryState as MasteryState) ?? 'not_started',
      unlocked: p?.unlocked ?? false,
      bestQuizScore: p?.bestQuizScore ?? null,
      attemptsCount: p?.attemptsCount ?? 0,
      isAutoMastered: autoMasteredIds.has(n.id),
    };
  });

  return { nodes: roadmapNodes, edges: visibleEdges, selectedBranchPath, supplementaryNodes: supplementary };
}

// ── Timeline Estimate ────────────────────────────────────────────────────────

export async function getTimelineEstimate(enrollmentId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { userId: true, weeklyHours: true, ontologyVersionId: true, selectedBranchPath: true },
  });
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  if (enrollment.userId !== userId) throw ApiError.forbidden();

  const weeklyHours = enrollment.weeklyHours ?? 5;

  const [nodes, progressRows] = await Promise.all([
    prisma.learningNode.findMany({
      where: { ontologyVersionId: enrollment.ontologyVersionId },
      select: {
        id: true,
        estimatedHours: true,
        branchPath: true,
        isConvergencePoint: true,
      },
    }),
    prisma.learnerNodeProgress.findMany({
      where: { enrollmentId },
      select: { nodeId: true, masteryState: true },
    }),
  ]);

  const { selectedBranchPath } = enrollment;
  const visibleNodes = selectedBranchPath
    ? nodes.filter(
        (n) => n.branchPath === null || n.branchPath === selectedBranchPath || n.isConvergencePoint,
      )
    : nodes;

  const completedStates = new Set(['mastered', 'review_needed']);
  const progressMap = new Map(progressRows.map((p) => [p.nodeId, p.masteryState]));

  let totalHours = 0;
  let completedHours = 0;
  let remainingHours = 0;

  for (const node of visibleNodes) {
    const hours = node.estimatedHours ? Number(node.estimatedHours) : 0;
    totalHours += hours;
    const state = progressMap.get(node.id);
    if (state && completedStates.has(state)) {
      completedHours += hours;
    } else {
      remainingHours += hours;
    }
  }

  // Adjust remaining hours using learner's actual velocity
  const { getAverageVelocity } = await import('../gatekeeper/velocity.service');
  const avgVelocity = await getAverageVelocity(enrollmentId);
  const adjustedRemainingHours = avgVelocity !== null
    ? parseFloat((remainingHours * avgVelocity).toFixed(1))
    : remainingHours;

  const estimatedWeeksRemaining = weeklyHours > 0
    ? parseFloat((adjustedRemainingHours / weeklyHours).toFixed(1))
    : null;

  const estimatedCompletionDate = estimatedWeeksRemaining !== null
    ? new Date(Date.now() + estimatedWeeksRemaining * 7 * 86_400_000).toISOString().slice(0, 10)
    : null;

  return {
    totalHours: parseFloat(totalHours.toFixed(1)),
    completedHours: parseFloat(completedHours.toFixed(1)),
    remainingHours: parseFloat(remainingHours.toFixed(1)),
    adjustedRemainingHours,
    weeklyHours,
    estimatedWeeksRemaining,
    estimatedCompletionDate,
    velocityMultiplier: avgVelocity,
  };
}

// ── Unlock Logic (called by Phase 6 quiz completion) ─────────────────────────

export async function checkAndUnlockNodes(userId: string, enrollmentId: string): Promise<string[]> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { ontologyVersionId: true },
  });
  if (!enrollment) return [];

  const [progressRows, edges] = await Promise.all([
    prisma.learnerNodeProgress.findMany({
      where: { enrollmentId },
      select: { nodeId: true, masteryState: true, unlocked: true },
    }),
    prisma.nodePrerequisite.findMany({
      where: { node: { ontologyVersionId: enrollment.ontologyVersionId } },
      select: { nodeId: true, prerequisiteNodeId: true },
    }),
  ]);

  const masteryMap = new Map(
    progressRows.map((p) => [p.nodeId, p.masteryState as MasteryState]),
  );
  const unlockedSet = new Set(progressRows.filter((p) => p.unlocked).map((p) => p.nodeId));

  // Group edges by nodeId: nodeId → list of prerequisiteNodeIds
  const prereqsOf = new Map<string, string[]>();
  for (const e of edges) {
    if (!prereqsOf.has(e.nodeId)) prereqsOf.set(e.nodeId, []);
    prereqsOf.get(e.nodeId)!.push(e.prerequisiteNodeId);
  }

  const completedStates: MasteryState[] = ['mastered', 'review_needed'];
  const newlyUnlocked: string[] = [];

  for (const [nodeId, prereqs] of prereqsOf) {
    if (unlockedSet.has(nodeId)) continue; // already unlocked
    const allPrereqsDone = prereqs.every((pId) => {
      const state = masteryMap.get(pId);
      return state !== undefined && completedStates.includes(state);
    });
    if (allPrereqsDone) newlyUnlocked.push(nodeId);
  }

  if (newlyUnlocked.length > 0) {
    await prisma.learnerNodeProgress.updateMany({
      where: { enrollmentId, nodeId: { in: newlyUnlocked } },
      data: { unlocked: true },
    });
  }

  return newlyUnlocked;
}
