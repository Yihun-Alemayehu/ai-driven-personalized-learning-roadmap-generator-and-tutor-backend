import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export async function getSystemStats() {
  const [userCount, enrollmentCount, attemptStats, decayStats] = await Promise.all([
    prisma.user.count(),
    prisma.enrollment.count(),
    prisma.quizAttempt.aggregate({
      _count: { id: true },
      _avg: { scorePercent: true },
    }),
    prisma.learnerNodeProgress.groupBy({
      by: ['masteryState'],
      _count: { id: true },
    }),
  ]);

  const masteryBreakdown = Object.fromEntries(
    decayStats.map((r) => [r.masteryState, r._count.id]),
  );

  return {
    users: userCount,
    enrollments: enrollmentCount,
    quizAttempts: attemptStats._count.id,
    avgQuizScore: attemptStats._avg.scorePercent
      ? parseFloat(Number(attemptStats._avg.scorePercent).toFixed(2))
      : null,
    masteryBreakdown,
  };
}

export async function getDomainStats() {
  const domains = await prisma.domain.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      enrollments: {
        select: {
          id: true,
          nodeProgress: {
            select: { masteryState: true, bestQuizScore: true },
          },
        },
      },
    },
  });

  return domains.map((domain) => {
    const enrollmentCount = domain.enrollments.length;
    const allProgress = domain.enrollments.flatMap((e) => e.nodeProgress);
    const totalNodes = allProgress.length;
    const masteredNodes = allProgress.filter((p) =>
      ['mastered', 'review_needed'].includes(p.masteryState),
    ).length;
    const avgCompletion =
      totalNodes > 0 ? parseFloat(((masteredNodes / totalNodes) * 100).toFixed(2)) : 0;

    const scores = allProgress
      .map((p) => p.bestQuizScore)
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .map((s) => Number(s));
    const avgQuizScore =
      scores.length > 0
        ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
        : null;

    return { domainId: domain.id, name: domain.name, slug: domain.slug, enrollmentCount, avgCompletion, avgQuizScore };
  });
}

export interface AdaptationEventFilters {
  type?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

export async function listAdaptationEvents(filters: AdaptationEventFilters = {}) {
  const { type, fromDate, toDate, limit = 20, offset = 0 } = filters;

  const where: Prisma.AdaptationEventWhereInput = {};
  if (type) where.adaptationType = type as Prisma.EnumAdaptationTypeFilter['equals'];
  if (fromDate) where.createdAt = { ...((where.createdAt as object) ?? {}), gte: new Date(fromDate) };
  if (toDate) where.createdAt = { ...((where.createdAt as object) ?? {}), lte: new Date(toDate) };

  const [events, total] = await Promise.all([
    prisma.adaptationEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        node: { select: { id: true, title: true, slug: true } },
      },
    }),
    prisma.adaptationEvent.count({ where }),
  ]);

  return { events, total, limit, offset };
}

export async function getFlaggedNodes(limit = 20, offset = 0) {
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
