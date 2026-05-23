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

// ── Activity Heatmap ─────────────────────────────────────────────────────────

export async function getActivityHeatmap(enrollmentId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { userId: true },
  });
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  if (enrollment.userId !== userId) throw ApiError.forbidden();

  // Look back 364 days (52 full weeks)
  const since = new Date(Date.now() - 364 * 86_400_000);

  const [progressRows, quizAttempts] = await Promise.all([
    prisma.learnerNodeProgress.findMany({
      where: {
        enrollmentId,
        OR: [
          { lastReviewedAt: { gte: since } },
          { masteredAt: { gte: since } },
        ],
      },
      select: { lastReviewedAt: true, masteredAt: true },
    }),
    prisma.quizAttempt.findMany({
      where: {
        userId,
        completedAt: { gte: since },
        node: {
          ontologyVersion: {
            enrollments: { some: { id: enrollmentId } },
          },
        },
      },
      select: { completedAt: true },
    }),
  ]);

  const dayMap = new Map<string, { quizzes: number; reviews: number; masteries: number }>();

  for (const r of progressRows) {
    if (r.lastReviewedAt && r.lastReviewedAt >= since) {
      const day = r.lastReviewedAt.toISOString().slice(0, 10);
      const d = dayMap.get(day) ?? { quizzes: 0, reviews: 0, masteries: 0 };
      d.reviews += 1;
      dayMap.set(day, d);
    }
    if (r.masteredAt && r.masteredAt >= since) {
      const day = r.masteredAt.toISOString().slice(0, 10);
      const d = dayMap.get(day) ?? { quizzes: 0, reviews: 0, masteries: 0 };
      d.masteries += 1;
      dayMap.set(day, d);
    }
  }

  for (const q of quizAttempts) {
    const day = q.completedAt.toISOString().slice(0, 10);
    const d = dayMap.get(day) ?? { quizzes: 0, reviews: 0, masteries: 0 };
    d.quizzes += 1;
    dayMap.set(day, d);
  }

  const days = Array.from(dayMap.entries()).map(([date, v]) => ({
    date,
    count: v.quizzes + v.reviews + v.masteries,
    quizzes: v.quizzes,
    reviews: v.reviews,
    masteries: v.masteries,
  }));

  return { days };
}

// ── Learning Insights ─────────────────────────────────────────────────────────

export async function getInsights(enrollmentId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      userId: true,
      enrolledAt: true,
      familiarityLevel: true,
      learningGoal: true,
      weeklyHours: true,
      aboutSelf: true,
      preferredLearningStyle: true,
      priorSkills: true,
      selectedBranchPath: true,
      ontologyVersionId: true,
    },
  });
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  if (enrollment.userId !== userId) throw ApiError.forbidden();

  const progressRows = await prisma.learnerNodeProgress.findMany({
    where: { enrollmentId },
    select: {
      nodeId: true,
      masteryState: true,
      bestQuizScore: true,
      attemptsCount: true,
      masteredAt: true,
      lastReviewedAt: true,
      node: { select: { title: true, difficultyLevel: true } },
    },
  });

  // Weak nodes: review_needed or relearn
  const weakNodes = progressRows
    .filter((p) => p.masteryState === 'review_needed' || p.masteryState === 'relearn')
    .map((p) => ({
      nodeId: p.nodeId,
      title: p.node.title,
      masteryState: p.masteryState,
      lastReviewedAt: p.lastReviewedAt?.toISOString() ?? null,
      difficultyLevel: p.node.difficultyLevel,
    }))
    .slice(0, 10);

  // Struggling nodes: in_progress with attemptsCount >= 2 and low score
  const strugglingNodes = progressRows
    .filter((p) => p.masteryState === 'in_progress' && p.attemptsCount >= 2)
    .sort((a, b) => {
      const sa = a.bestQuizScore ? Number(a.bestQuizScore) : 0;
      const sb = b.bestQuizScore ? Number(b.bestQuizScore) : 0;
      return sa - sb;
    })
    .slice(0, 5)
    .map((p) => ({
      nodeId: p.nodeId,
      title: p.node.title,
      bestQuizScore: p.bestQuizScore ? Number(p.bestQuizScore) : null,
      attemptsCount: p.attemptsCount,
      difficultyLevel: p.node.difficultyLevel,
    }));

  // Top mastered nodes (high difficulty mastered)
  const topNodes = progressRows
    .filter((p) => p.masteryState === 'mastered' && p.node.difficultyLevel != null)
    .sort((a, b) => (b.node.difficultyLevel ?? 0) - (a.node.difficultyLevel ?? 0))
    .slice(0, 5)
    .map((p) => ({
      nodeId: p.nodeId,
      title: p.node.title,
      bestQuizScore: p.bestQuizScore ? Number(p.bestQuizScore) : null,
      difficultyLevel: p.node.difficultyLevel,
      masteredAt: p.masteredAt?.toISOString() ?? null,
    }));

  // Momentum: activity in last 7 days vs prior 7 days
  const now = Date.now();
  const recentMasteries = progressRows.filter(
    (p) => p.masteredAt && p.masteredAt.getTime() >= now - 7 * 86_400_000,
  ).length;
  const prevMasteries = progressRows.filter(
    (p) =>
      p.masteredAt &&
      p.masteredAt.getTime() >= now - 14 * 86_400_000 &&
      p.masteredAt.getTime() < now - 7 * 86_400_000,
  ).length;
  const momentumTrend: 'up' | 'down' | 'flat' =
    recentMasteries > prevMasteries ? 'up' : recentMasteries < prevMasteries ? 'down' : 'flat';

  // Days since enrollment
  const daysSinceEnrollment = Math.floor(
    (now - new Date(enrollment.enrolledAt).getTime()) / 86_400_000,
  );

  // Average quiz score across all attempts
  const scores = progressRows
    .map((p) => (p.bestQuizScore ? Number(p.bestQuizScore) : null))
    .filter((s): s is number => s !== null);
  const avgScore = scores.length > 0
    ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
    : null;

  return {
    profile: {
      enrolledAt: enrollment.enrolledAt.toISOString(),
      familiarityLevel: enrollment.familiarityLevel,
      learningGoal: enrollment.learningGoal,
      weeklyHours: enrollment.weeklyHours,
      aboutSelf: enrollment.aboutSelf,
      preferredLearningStyle: enrollment.preferredLearningStyle,
      priorSkills: enrollment.priorSkills,
      selectedBranchPath: enrollment.selectedBranchPath,
      daysSinceEnrollment,
    },
    weakNodes,
    strugglingNodes,
    topNodes,
    momentum: {
      trend: momentumTrend,
      recentMasteries,
      prevMasteries,
    },
    avgScore,
  };
}

// ── Global Insights (across all enrollments) ─────────────────────────────────

export async function getGlobalActivityHeatmap(userId: string) {
  const since = new Date(Date.now() - 364 * 86_400_000);

  const [progressRows, quizAttempts] = await Promise.all([
    prisma.learnerNodeProgress.findMany({
      where: {
        userId,
        OR: [
          { lastReviewedAt: { gte: since } },
          { masteredAt: { gte: since } },
        ],
      },
      select: { lastReviewedAt: true, masteredAt: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId, completedAt: { gte: since } },
      select: { completedAt: true },
    }),
  ]);

  const dayMap = new Map<string, { quizzes: number; reviews: number; masteries: number }>();

  for (const r of progressRows) {
    if (r.lastReviewedAt && r.lastReviewedAt >= since) {
      const day = r.lastReviewedAt.toISOString().slice(0, 10);
      const d = dayMap.get(day) ?? { quizzes: 0, reviews: 0, masteries: 0 };
      d.reviews += 1;
      dayMap.set(day, d);
    }
    if (r.masteredAt && r.masteredAt >= since) {
      const day = r.masteredAt.toISOString().slice(0, 10);
      const d = dayMap.get(day) ?? { quizzes: 0, reviews: 0, masteries: 0 };
      d.masteries += 1;
      dayMap.set(day, d);
    }
  }

  for (const q of quizAttempts) {
    const day = q.completedAt.toISOString().slice(0, 10);
    const d = dayMap.get(day) ?? { quizzes: 0, reviews: 0, masteries: 0 };
    d.quizzes += 1;
    dayMap.set(day, d);
  }

  return {
    days: Array.from(dayMap.entries()).map(([date, v]) => ({
      date,
      count: v.quizzes + v.reviews + v.masteries,
      quizzes: v.quizzes,
      reviews: v.reviews,
      masteries: v.masteries,
    })),
  };
}

export async function getGlobalInsights(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    orderBy: { enrolledAt: 'desc' },
    select: {
      id: true,
      enrolledAt: true,
      selectedBranchPath: true,
      familiarityLevel: true,
      learningGoal: true,
      weeklyHours: true,
      preferredLearningStyle: true,
      priorSkills: true,
      domain: { select: { id: true, name: true, slug: true, iconUrl: true } },
      nodeProgress: {
        select: {
          masteryState: true,
          bestQuizScore: true,
          attemptsCount: true,
          masteredAt: true,
          lastReviewedAt: true,
          nodeId: true,
          node: { select: { title: true, difficultyLevel: true } },
        },
      },
    },
  });

  if (enrollments.length === 0) {
    return {
      totalEnrollments: 0,
      enrollmentBreakdowns: [],
      globalWeakNodes: [],
      globalTopNodes: [],
      overallStats: { totalNodes: 0, masteredNodes: 0, completionPercent: 0, avgScore: null },
      momentum: { trend: 'flat' as const, recentMasteries: 0, prevMasteries: 0 },
      streakSummary: { currentStreak: 0, longestStreak: 0 },
    };
  }

  const now = Date.now();

  // Per-enrollment breakdown
  const enrollmentBreakdowns = enrollments.map((e) => {
    const total = e.nodeProgress.length;
    const mastered = e.nodeProgress.filter(
      (p) => p.masteryState === 'mastered' || p.masteryState === 'review_needed',
    ).length;
    const scores = e.nodeProgress
      .map((p) => (p.bestQuizScore ? Number(p.bestQuizScore) : null))
      .filter((s): s is number => s !== null);
    const avgScore = scores.length > 0
      ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
      : null;
    const lastActive = e.nodeProgress
      .map((p) => p.lastReviewedAt ?? p.masteredAt)
      .filter((d): d is Date => d !== null)
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

    return {
      enrollmentId: e.id,
      domain: e.domain,
      enrolledAt: e.enrolledAt.toISOString(),
      selectedBranchPath: e.selectedBranchPath,
      totalNodes: total,
      masteredNodes: mastered,
      completionPercent: total > 0 ? Math.round((mastered / total) * 100) : 0,
      avgScore,
      lastActiveAt: lastActive?.toISOString() ?? null,
    };
  });

  // Global overalls
  const allProgress = enrollments.flatMap((e) => e.nodeProgress);
  const totalNodes = allProgress.length;
  const masteredNodes = allProgress.filter(
    (p) => p.masteryState === 'mastered' || p.masteryState === 'review_needed',
  ).length;
  const allScores = allProgress
    .map((p) => (p.bestQuizScore ? Number(p.bestQuizScore) : null))
    .filter((s): s is number => s !== null);
  const globalAvgScore = allScores.length > 0
    ? parseFloat((allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1))
    : null;

  // Global weak nodes — enriched with enrollment + domain context
  const globalWeakNodes = enrollments
    .flatMap((e) =>
      e.nodeProgress
        .filter((p) => p.masteryState === 'review_needed' || p.masteryState === 'relearn')
        .map((p) => ({
          nodeId: p.nodeId,
          title: p.node.title,
          masteryState: p.masteryState,
          lastReviewedAt: p.lastReviewedAt?.toISOString() ?? null,
          difficultyLevel: p.node.difficultyLevel,
          enrollmentId: e.id,
          domainName: e.domain.name,
        })),
    )
    .slice(0, 8);

  // Global top mastered nodes
  const globalTopNodes = allProgress
    .filter((p) => p.masteryState === 'mastered' && p.node.difficultyLevel != null)
    .sort((a, b) => (b.node.difficultyLevel ?? 0) - (a.node.difficultyLevel ?? 0))
    .slice(0, 5)
    .map((p) => ({
      nodeId: p.nodeId,
      title: p.node.title,
      bestQuizScore: p.bestQuizScore ? Number(p.bestQuizScore) : null,
      difficultyLevel: p.node.difficultyLevel,
      masteredAt: p.masteredAt?.toISOString() ?? null,
    }));

  // Global momentum
  const recentMasteries = allProgress.filter(
    (p) => p.masteredAt && p.masteredAt.getTime() >= now - 7 * 86_400_000,
  ).length;
  const prevMasteries = allProgress.filter(
    (p) =>
      p.masteredAt &&
      p.masteredAt.getTime() >= now - 14 * 86_400_000 &&
      p.masteredAt.getTime() < now - 7 * 86_400_000,
  ).length;
  const momentumTrend: 'up' | 'down' | 'flat' =
    recentMasteries > prevMasteries ? 'up' : recentMasteries < prevMasteries ? 'down' : 'flat';

  // Streak from all activity dates
  const allDates = allProgress
    .flatMap((p) => [p.lastReviewedAt, p.masteredAt])
    .filter((d): d is Date => d !== null);
  const currentStreak = computeStreak(allDates);

  return {
    totalEnrollments: enrollments.length,
    enrollmentBreakdowns,
    globalWeakNodes,
    globalTopNodes,
    overallStats: {
      totalNodes,
      masteredNodes,
      completionPercent: totalNodes > 0 ? Math.round((masteredNodes / totalNodes) * 100) : 0,
      avgScore: globalAvgScore,
    },
    momentum: { trend: momentumTrend, recentMasteries, prevMasteries },
    streakSummary: { currentStreak },
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
