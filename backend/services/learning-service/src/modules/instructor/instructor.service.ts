import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';

export interface LearnerFilters {
  domainId?: string;
  limit?: number;
  offset?: number;
}

export async function listLearners(filters: LearnerFilters = {}) {
  const { domainId, limit = 20, offset = 0 } = filters;

  const where: Prisma.EnrollmentWhereInput = {};
  if (domainId) where.domainId = domainId;

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      orderBy: { enrolledAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: { select: { id: true, email: true, fullName: true, avatarUrl: true } },
        domain: { select: { id: true, name: true, slug: true } },
        _count: { select: { nodeProgress: true } },
      },
    }),
    prisma.enrollment.count({ where }),
  ]);

  return { learners: enrollments, total, limit, offset };
}

export async function getLearnerProgress(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true },
  });
  if (!user) throw ApiError.notFound('User not found');

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      domain: { select: { id: true, name: true, slug: true } },
      nodeProgress: {
        include: {
          node: { select: { id: true, title: true, slug: true, difficultyLevel: true } },
        },
        orderBy: { updatedAt: 'desc' },
      },
    },
  });

  return { user, enrollments };
}

export async function getLearnerQuizHistory(
  userId: string,
  limit = 20,
  offset = 0,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true },
  });
  if (!user) throw ApiError.notFound('User not found');

  const [attempts, total] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        node: { select: { id: true, title: true, slug: true } },
        quiz: { select: { id: true, isMicroQuiz: true, generatedBy: true } },
      },
    }),
    prisma.quizAttempt.count({ where: { userId } }),
  ]);

  return { user, attempts, total, limit, offset };
}

export async function getDomainAnalytics(domainId: string) {
  const domain = await prisma.domain.findUnique({
    where: { id: domainId },
    select: { id: true, name: true, slug: true },
  });
  if (!domain) throw ApiError.notFound('Domain not found');

  // Get all nodes for the domain
  const ontologyVersion = await prisma.ontologyVersion.findFirst({
    where: { domainId, status: 'published' },
    include: {
      nodes: {
        select: {
          id: true,
          title: true,
          slug: true,
          difficultyLevel: true,
          progress: {
            select: { masteryState: true, bestQuizScore: true, attemptsCount: true },
          },
        },
      },
    },
  });

  if (!ontologyVersion) {
    return { domain, nodes: [], enrollmentCount: 0 };
  }

  const enrollmentCount = await prisma.enrollment.count({
    where: { domainId },
  });

  // Per-node analytics
  const nodeAnalytics = ontologyVersion.nodes.map((node) => {
    const progress = node.progress;
    const total = progress.length;
    if (total === 0) return { nodeId: node.id, title: node.title, slug: node.slug, difficultyLevel: node.difficultyLevel, learnerCount: 0, masteryRate: 0, avgQuizScore: null, avgAttempts: 0 };

    const mastered = progress.filter((p) =>
      ['mastered', 'review_needed'].includes(p.masteryState),
    ).length;

    const scores = progress
      .map((p) => p.bestQuizScore)
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .map((s) => Number(s));

    const avgQuizScore =
      scores.length > 0
        ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
        : null;

    const avgAttempts =
      parseFloat((progress.reduce((sum, p) => sum + p.attemptsCount, 0) / total).toFixed(2));

    return {
      nodeId: node.id,
      title: node.title,
      slug: node.slug,
      difficultyLevel: node.difficultyLevel,
      learnerCount: total,
      masteryRate: parseFloat(((mastered / total) * 100).toFixed(2)),
      avgQuizScore,
      avgAttempts,
    };
  });

  // Problem nodes: lowest mastery rate among attempted nodes
  const problemNodes = [...nodeAnalytics]
    .filter((n) => n.learnerCount > 0)
    .sort((a, b) => a.masteryRate - b.masteryRate)
    .slice(0, 5);

  const overallMasteryRate =
    nodeAnalytics.length > 0
      ? parseFloat(
          (nodeAnalytics.reduce((sum, n) => sum + n.masteryRate, 0) / nodeAnalytics.length).toFixed(2),
        )
      : 0;

  return { domain, enrollmentCount, overallMasteryRate, nodeAnalytics, problemNodes };
}

export async function getFlaggedEvents(limit = 20, offset = 0) {
  const where: Prisma.AdaptationEventWhereInput = {
    adaptationType: 'instructor_escalation',
  };

  const [events, total] = await Promise.all([
    prisma.adaptationEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        node: { select: { id: true, title: true, slug: true } },
        quizAttempt: { select: { id: true, scorePercent: true, outcome: true } },
      },
    }),
    prisma.adaptationEvent.count({ where }),
  ]);

  return { flaggedEvents: events, total, limit, offset };
}

export async function resolveFlaggedEvent(
  eventId: string,
  instructorId: string,
  resolutionNotes: string,
) {
  const event = await prisma.adaptationEvent.findUnique({
    where: { id: eventId },
    select: { id: true, details: true, adaptationType: true },
  });
  if (!event) throw ApiError.notFound('Adaptation event not found');
  if (event.adaptationType !== 'instructor_escalation') {
    throw ApiError.badRequest('Only instructor_escalation events can be resolved');
  }

  const existingDetails = (event.details as Record<string, unknown>) ?? {};
  const updated = await prisma.adaptationEvent.update({
    where: { id: eventId },
    data: {
      details: {
        ...existingDetails,
        resolved: true,
        resolutionNotes,
        resolvedAt: new Date().toISOString(),
        resolvedById: instructorId,
      },
    },
    include: {
      user: { select: { id: true, email: true, fullName: true } },
      node: { select: { id: true, title: true, slug: true } },
    },
  });

  return { event: updated };
}
