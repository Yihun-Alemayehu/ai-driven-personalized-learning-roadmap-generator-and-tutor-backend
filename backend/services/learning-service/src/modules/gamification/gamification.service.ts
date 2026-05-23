import { prisma } from '../../lib/prisma';
import type { BadgeKey, XpSource } from '@prisma/client';
import {
  LEVEL_THRESHOLDS,
  XP_WEIGHTS,
  BADGE_META,
  computeLevel,
  xpForNextLevel,
  type GamificationSummary,
  type EarnedBadge,
  type WeeklyGoal,
} from './gamification.types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeStreakFromDates(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const daySet = new Set(dates.map((d) => d.toISOString().slice(0, 10)));
  const days = [...daySet].sort().reverse();
  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86_400_000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function isoWeekBounds(): { start: Date; end: Date; label: string } {
  const now   = new Date();
  const day   = now.getDay(); // 0=Sun
  const mon   = new Date(now);
  mon.setDate(now.getDate() - ((day + 6) % 7));
  mon.setHours(0, 0, 0, 0);
  const sun   = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  const fmt   = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { start: mon, end: sun, label: `${fmt(mon)} – ${fmt(sun)}` };
}

// ── XP ────────────────────────────────────────────────────────────────────────

export async function awardXp(params: {
  userId: string;
  source: XpSource;
  refId?: string;
  overrideAmount?: number;
}): Promise<void> {
  const { userId, source, refId, overrideAmount } = params;
  const amount = overrideAmount ?? XP_WEIGHTS[source];
  if (amount <= 0) return;

  // Create the event log row
  await prisma.xpEvent.create({ data: { userId, source, amount, refId } });

  // Upsert the aggregate
  const existing = await prisma.userXp.findUnique({ where: { userId } });
  const newTotal  = (existing?.totalXp ?? 0) + amount;
  const newLevel  = computeLevel(newTotal);

  await prisma.userXp.upsert({
    where:  { userId },
    create: { userId, totalXp: newTotal, level: newLevel },
    update: { totalXp: newTotal, level: newLevel },
  });
}

// ── Badge checks ──────────────────────────────────────────────────────────────

async function grantBadgeIfNew(userId: string, key: BadgeKey): Promise<void> {
  await prisma.userBadge.upsert({
    where:  { userId_badgeKey: { userId, badgeKey: key } },
    create: { userId, badgeKey: key },
    update: {},
  });
}

export async function checkBadgesOnMastery(params: {
  userId:      string;
  enrollmentId: string;
  nodeId:      string;
  tier:        string;
  scorePercent?: number;
}): Promise<void> {
  const { userId, enrollmentId, nodeId, tier, scorePercent } = params;

  // first_mastery — any node mastered
  const masteryCount = await prisma.learnerNodeProgress.count({
    where: { userId, masteryState: 'mastered' },
  });
  if (masteryCount >= 1) await grantBadgeIfNew(userId, 'first_mastery');

  // quiz_ace — 100% score
  if (scorePercent !== undefined && scorePercent >= 100) {
    await grantBadgeIfNew(userId, 'quiz_ace');
  }

  // speed_learner — mastered in < 50% of estimated time
  const velocity = await prisma.learnerVelocity.findUnique({
    where: { userId_nodeId: { userId, nodeId } },
  });
  if (velocity && Number(velocity.velocityRatio) < 0.5) {
    await grantBadgeIfNew(userId, 'speed_learner');
  }

  // completionist — all progress rows for the enrollment are mastered
  const [total, mastered] = await Promise.all([
    prisma.learnerNodeProgress.count({ where: { enrollmentId } }),
    prisma.learnerNodeProgress.count({ where: { enrollmentId, masteryState: 'mastered' } }),
  ]);
  if (total > 0 && mastered === total) {
    await grantBadgeIfNew(userId, 'completionist');
    await awardXp({ userId, source: 'enrollment_complete' });
  }

  // comeback — previous masteryState was relearn
  const prevProgress = await prisma.learnerNodeProgress.findUnique({
    where: { userId_nodeId: { userId, nodeId } },
    select: { masteryState: true },
  });
  // Note: this runs AFTER the update so masteryState is already 'mastered'.
  // We check adaptation events: if there was a decay_micro_quiz for this node
  // then the learner was in relearn before.
  const hadRelearn = await prisma.adaptationEvent.count({
    where: { userId, nodeId, adaptationType: 'decay_micro_quiz' },
  });
  if ((prevProgress?.masteryState === 'mastered') && hadRelearn > 0) {
    await grantBadgeIfNew(userId, 'comeback');
  }

  // streak badges — evaluate current streak
  const dates = await prisma.learnerNodeProgress.findMany({
    where: { userId, lastReviewedAt: { not: null } },
    select: { lastReviewedAt: true },
  });
  const streak = computeStreakFromDates(
    dates.map((d) => d.lastReviewedAt!).filter(Boolean),
  );
  if (streak >= 5)  await grantBadgeIfNew(userId, 'streak_5');
  if (streak >= 14) await grantBadgeIfNew(userId, 'streak_14');

  // streak milestone XP
  if (streak === 5 || streak === 14) {
    const amount = streak === 14 ? 100 : 50;
    await awardXp({ userId, source: 'streak_milestone', overrideAmount: amount });
  }

  // consistent — weekly goal met
  const weeklyGoal = await computeWeeklyGoal(userId);
  if (weeklyGoal.progress >= weeklyGoal.target && weeklyGoal.target > 0) {
    await grantBadgeIfNew(userId, 'consistent');
  }
}

// ── Weekly goal ───────────────────────────────────────────────────────────────

export async function computeWeeklyGoal(userId: string): Promise<WeeklyGoal> {
  const { start, end, label } = isoWeekBounds();

  // Masteries this ISO week
  const masteries = await prisma.learnerNodeProgress.count({
    where: {
      userId,
      masteryState: 'mastered',
      masteredAt: { gte: start, lte: end },
    },
  });

  // Personalised target: avg weeklyHours across enrollments / avg node estimatedHours
  const enrollments = await prisma.enrollment.findMany({
    where:  { userId },
    select: { weeklyHours: true },
  });
  const avgWeekly = enrollments.length
    ? enrollments.reduce((s, e) => s + (e.weeklyHours ?? 5), 0) / enrollments.length
    : 5;

  // Average estimated hours per node across all enrolled nodes
  const nodeHours = await prisma.learnerNodeProgress.findMany({
    where:   { userId },
    include: { node: { select: { estimatedHours: true } } },
  });
  const estHours = nodeHours
    .map((n) => Number(n.node.estimatedHours ?? 1))
    .filter((h) => h > 0);
  const avgNodeHours = estHours.length
    ? estHours.reduce((a, b) => a + b, 0) / estHours.length
    : 2;

  const target = Math.max(1, Math.round(avgWeekly / avgNodeHours));
  const percentDone = target > 0 ? Math.min(100, Math.round((masteries / target) * 100)) : 0;

  return { target, progress: masteries, percentDone, weekLabel: label };
}

// ── Full summary ──────────────────────────────────────────────────────────────

export async function getGamificationSummary(userId: string): Promise<GamificationSummary> {
  const [xpRow, earnedBadges, weeklyGoal, recentEvents, progressDates] = await Promise.all([
    prisma.userXp.findUnique({ where: { userId } }),
    prisma.userBadge.findMany({ where: { userId }, orderBy: { earnedAt: 'asc' } }),
    computeWeeklyGoal(userId),
    prisma.xpEvent.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      take:    10,
    }),
    prisma.learnerNodeProgress.findMany({
      where:  { userId, lastReviewedAt: { not: null } },
      select: { lastReviewedAt: true },
    }),
  ]);

  const totalXp        = xpRow?.totalXp ?? 0;
  const level          = computeLevel(totalXp);
  const prevThreshold  = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold  = xpForNextLevel(level);
  const xpIntoLevel    = totalXp - prevThreshold;
  const xpSpanLevel    = nextThreshold - prevThreshold;
  const progressPct    = xpSpanLevel > 0
    ? Math.min(100, Math.round((xpIntoLevel / xpSpanLevel) * 100))
    : 100;

  const earnedKeys = new Set(earnedBadges.map((b) => b.badgeKey));
  const earnedBadgeMap = new Map(earnedBadges.map((b) => [b.badgeKey, b.earnedAt]));

  const allBadges = (Object.values(BADGE_META) as typeof BADGE_META[BadgeKey][]).map((meta) => ({
    ...meta,
    earnedAt: earnedBadgeMap.get(meta.key)?.toISOString() ?? null,
  }));

  const earned: EarnedBadge[] = earnedBadges.map((b) => ({
    ...BADGE_META[b.badgeKey],
    earnedAt: b.earnedAt.toISOString(),
  }));

  const streak = computeStreakFromDates(
    progressDates.map((d) => d.lastReviewedAt!).filter(Boolean),
  );

  return {
    xp: { total: totalXp, level, xpIntoLevel, xpForNextLevel: nextThreshold, progressPct },
    streak: { current: streak },
    badges: { earned, all: allBadges },
    weeklyGoal,
    recentXpEvents: recentEvents.map((e) => ({
      source:    e.source,
      amount:    e.amount,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}
