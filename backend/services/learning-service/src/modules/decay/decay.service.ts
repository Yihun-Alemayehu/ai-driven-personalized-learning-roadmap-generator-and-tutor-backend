import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { classifyScore } from '../gatekeeper/gatekeeper.service';
import { createNotification } from '../notifications/notifications.service';

const STRONG_PASS_DAYS = 14;
const MARGINAL_PASS_DAYS = 7;
const RELEARN_DAYS = 30;
const NOTIFY_COOLDOWN_DAYS = 1;

function daysSince(date: Date): number {
  return (Date.now() - date.getTime()) / 86_400_000;
}

async function getDependentChain(nodeId: string): Promise<string[]> {
  const visited = new Set<string>();
  const queue = [nodeId];
  while (queue.length) {
    const current = queue.shift()!;
    const deps = await prisma.nodePrerequisite.findMany({
      where: { prerequisiteNodeId: current },
      select: { nodeId: true },
    });
    for (const dep of deps) {
      if (!visited.has(dep.nodeId)) {
        visited.add(dep.nodeId);
        queue.push(dep.nodeId);
      }
    }
  }
  return Array.from(visited);
}

async function maybeNotify(
  userId: string,
  progressId: string,
  nodeId: string,
  enrollmentId: string,
  nodeTitle: string,
  decayNotifiedAt: Date | null,
  severity: 'normal' | 'high',
  now: Date,
): Promise<void> {
  if (decayNotifiedAt && daysSince(decayNotifiedAt) < NOTIFY_COOLDOWN_DAYS) return;

  const isHigh = severity === 'high';
  await createNotification({
    userId,
    type: 'decay_reminder',
    title: isHigh ? `Re-learning required: ${nodeTitle}` : `Time to review: ${nodeTitle}`,
    body: isHigh
      ? `Your mastery of "${nodeTitle}" has significantly decayed. Please re-learn this topic.`
      : `Your mastery of "${nodeTitle}" is fading. Take a quick review quiz!`,
    data: { nodeId, enrollmentId, severity },
  });

  await prisma.learnerNodeProgress.update({
    where: { id: progressId },
    data: { decayNotifiedAt: now },
  });
}

export async function runDecayScan(): Promise<{ transitioned: number; notified: number }> {
  const now = new Date();
  let transitioned = 0;
  let notified = 0;

  // mastered → review_needed
  const mastered = await prisma.learnerNodeProgress.findMany({
    where: { masteryState: 'mastered' },
    select: {
      id: true,
      userId: true,
      nodeId: true,
      enrollmentId: true,
      isMarginalPass: true,
      lastReviewedAt: true,
      decayNotifiedAt: true,
      node: { select: { title: true } },
    },
  });

  for (const p of mastered) {
    if (!p.lastReviewedAt) continue;
    const days = daysSince(p.lastReviewedAt);
    const threshold = p.isMarginalPass ? MARGINAL_PASS_DAYS : STRONG_PASS_DAYS;
    if (days > threshold) {
      await prisma.learnerNodeProgress.update({
        where: { id: p.id },
        data: { masteryState: 'review_needed' },
      });
      transitioned++;
      const before = notified;
      await maybeNotify(p.userId, p.id, p.nodeId, p.enrollmentId, p.node.title, p.decayNotifiedAt, 'normal', now);
      if (notified > before) notified++;
      else notified = notified; // no-op to avoid lint warning
      // count notifications properly
      if (!p.decayNotifiedAt || daysSince(p.decayNotifiedAt) >= NOTIFY_COOLDOWN_DAYS) notified++;
    }
  }

  // review_needed → relearn
  const reviewNeeded = await prisma.learnerNodeProgress.findMany({
    where: { masteryState: 'review_needed' },
    select: {
      id: true,
      userId: true,
      nodeId: true,
      enrollmentId: true,
      lastReviewedAt: true,
      decayNotifiedAt: true,
      node: { select: { title: true } },
    },
  });

  for (const p of reviewNeeded) {
    if (!p.lastReviewedAt) continue;
    if (daysSince(p.lastReviewedAt) > RELEARN_DAYS) {
      await prisma.learnerNodeProgress.update({
        where: { id: p.id },
        data: { masteryState: 'relearn' },
      });
      transitioned++;
      await maybeNotify(p.userId, p.id, p.nodeId, p.enrollmentId, p.node.title, p.decayNotifiedAt, 'high', now);
      if (!p.decayNotifiedAt || daysSince(p.decayNotifiedAt) >= NOTIFY_COOLDOWN_DAYS) notified++;
    }
  }

  return { transitioned, notified };
}

export async function getDecayStatus(enrollmentId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { userId: true },
  });
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  if (enrollment.userId !== userId) throw ApiError.forbidden();

  const nodes = await prisma.learnerNodeProgress.findMany({
    where: {
      enrollmentId,
      masteryState: { in: ['mastered', 'review_needed', 'relearn'] },
    },
    select: {
      nodeId: true,
      masteryState: true,
      isMarginalPass: true,
      lastReviewedAt: true,
      node: { select: { title: true, slug: true } },
    },
  });

  return nodes.map((p) => {
    const days = p.lastReviewedAt ? Math.floor(daysSince(p.lastReviewedAt)) : null;
    const threshold = p.isMarginalPass ? MARGINAL_PASS_DAYS : STRONG_PASS_DAYS;
    return {
      nodeId: p.nodeId,
      title: p.node.title,
      slug: p.node.slug,
      masteryState: p.masteryState,
      daysSinceReview: days,
      decayThresholdDays: threshold,
      daysUntilDecay: days !== null ? Math.max(0, threshold - days) : null,
    };
  });
}

export async function generateMicroQuiz(nodeId: string, userId: string) {
  const progress = await prisma.learnerNodeProgress.findUnique({
    where: { userId_nodeId: { userId, nodeId } },
    select: { masteryState: true },
  });
  if (!progress) throw ApiError.forbidden('Not enrolled for this node');
  if (!['mastered', 'review_needed', 'relearn'].includes(progress.masteryState)) {
    throw ApiError.badRequest('Node is not in a state requiring review');
  }

  const mainQuiz = await prisma.quiz.findFirst({
    where: { nodeId, isMicroQuiz: false },
    include: { questions: { orderBy: { orderIndex: 'asc' } } },
  });
  if (!mainQuiz) throw ApiError.notFound('No quiz found for this node');

  const count = Math.min(mainQuiz.questions.length, 3);
  const selected = [...mainQuiz.questions].sort(() => Math.random() - 0.5).slice(0, count);

  const microQuiz = await prisma.quiz.create({
    data: {
      nodeId,
      isMicroQuiz: true,
      generatedBy: 'decay_engine',
      questions: {
        create: selected.map((q, i) => ({
          questionType: q.questionType,
          questionText: q.questionText,
          options: q.options ?? undefined,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation ?? undefined,
          orderIndex: i,
        })),
      },
    },
    include: {
      questions: {
        select: {
          id: true,
          questionType: true,
          questionText: true,
          options: true,
          orderIndex: true,
          explanation: true,
          // correctAnswer intentionally omitted
        },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  return microQuiz;
}

export interface MicroQuizAnswers {
  enrollmentId: string;
  answers: { questionId: string; answer: string }[];
  startedAt: string;
}

export async function submitMicroQuizAttempt(
  userId: string,
  quizId: string,
  data: MicroQuizAnswers,
) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { select: { id: true, correctAnswer: true } } },
  });
  if (!quiz) throw ApiError.notFound('Quiz not found');
  if (!quiz.isMicroQuiz) throw ApiError.badRequest('Not a micro-quiz');

  const progress = await prisma.learnerNodeProgress.findUnique({
    where: { userId_nodeId: { userId, nodeId: quiz.nodeId } },
    select: { enrollmentId: true, masteryState: true },
  });
  if (!progress) throw ApiError.forbidden('Not enrolled for this node');
  if (progress.enrollmentId !== data.enrollmentId) throw ApiError.forbidden();

  const answerMap = new Map(data.answers.map((a) => [a.questionId, a.answer]));
  let correct = 0;
  for (const q of quiz.questions) {
    if (answerMap.get(q.id) === q.correctAnswer) correct++;
  }
  const total = quiz.questions.length;
  const scorePercent = total > 0 ? parseFloat(((correct / total) * 100).toFixed(2)) : 0;
  const tier = classifyScore(scorePercent);
  const passed = scorePercent >= 80;
  const now = new Date();

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      nodeId: quiz.nodeId,
      scorePercent,
      outcome: tier,
      answers: data.answers,
      startedAt: new Date(data.startedAt),
      completedAt: now,
    },
  });

  if (passed) {
    await prisma.learnerNodeProgress.updateMany({
      where: { userId, nodeId: quiz.nodeId },
      data: { masteryState: 'mastered', lastReviewedAt: now, decayNotifiedAt: null },
    });
  } else {
    await prisma.learnerNodeProgress.updateMany({
      where: { userId, nodeId: quiz.nodeId },
      data: { masteryState: 'in_progress' },
    });

    const dependentNodeIds = await getDependentChain(quiz.nodeId);
    if (dependentNodeIds.length > 0) {
      await prisma.learnerNodeProgress.updateMany({
        where: { userId, nodeId: { in: dependentNodeIds } },
        data: { unlocked: false, masteryState: 'in_progress' },
      });
    }

    await prisma.adaptationEvent.create({
      data: {
        userId,
        nodeId: quiz.nodeId,
        quizAttemptId: attempt.id,
        adaptationType: 'decay_micro_quiz',
        details: { scorePercent, dependentNodesLocked: dependentNodeIds },
      },
    });
  }

  return {
    passed,
    scorePercent,
    tier,
    newMasteryState: passed ? 'mastered' : 'in_progress',
    attemptId: attempt.id,
  };
}
