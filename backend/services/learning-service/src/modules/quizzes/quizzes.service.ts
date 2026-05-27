import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { classifyScore, applyGatekeeperOutcome } from '../gatekeeper/gatekeeper.service';
import { getAdaptedResources } from '../adaptation/adaptation.service';
import { buildLearnerContext, computeAdaptiveDifficulty, detectWeakAreas } from '../progress/learner-context.service';
import { requestAiQuiz, requestAiExplanation, requestAiAsk, invalidateRemedialQuizCache } from '../../lib/aiClient';
import type { AiAskPayload } from '../../lib/aiClient';
import type { SubmitAttemptInput, AttemptFilters } from './quizzes.types';

const AI_QUIZ_STALE_DAYS = 7;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function assertNodeUnlocked(nodeId: string, userId: string) {
  const progress = await prisma.learnerNodeProgress.findUnique({
    where: { userId_nodeId: { userId, nodeId } },
    select: { unlocked: true, enrollmentId: true },
  });
  if (!progress) throw ApiError.forbidden('Not enrolled in the domain containing this node');
  if (!progress.unlocked) throw ApiError.forbidden('Node is locked — complete prerequisites first');
  return progress;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getQuizForNode(nodeId: string, userId: string) {
  const progress = await assertNodeUnlocked(nodeId, userId);

  const learnerContext = await buildLearnerContext(userId, progress.enrollmentId, nodeId);
  const isReAttempt = learnerContext.currentNodeAttempts > 0;

  // On re-attempts, always generate a fresh adaptive/remedial quiz — skip staleness cache
  if (!isReAttempt) {
    const freshAiQuiz = await prisma.quiz.findFirst({
      where: {
        nodeId,
        isMicroQuiz: false,
        generatedBy: 'ai_tutor',
        createdAt: { gte: new Date(Date.now() - AI_QUIZ_STALE_DAYS * 86_400_000) },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        questions: {
          select: { id: true, questionType: true, questionText: true, options: true, explanation: true, orderIndex: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
    if (freshAiQuiz) return freshAiQuiz;
  }

  const node = await prisma.learningNode.findUnique({
    where: { id: nodeId },
    select: { title: true, description: true, learningOutcomes: true, difficultyLevel: true },
  });

  if (node) {
    const outcomes = Array.isArray(node.learningOutcomes) ? (node.learningOutcomes as string[]) : [];

    // Compute adapted difficulty based on learner performance
    const adaptedDifficulty = computeAdaptiveDifficulty(
      node.difficultyLevel,
      learnerContext.currentNodeBestScore,
      learnerContext.currentNodeAttempts,
      learnerContext.overallAvgScore,
    );

    // Detect weak areas from the most recent failed attempt
    const weakAreas = isReAttempt ? await detectWeakAreas(userId, nodeId) : [];

    // Fetch the learner's personalized explanation to ground the quiz
    const explanationResponse = await requestAiExplanation({
      nodeId,
      nodeTitle: node.title,
      description: node.description ?? undefined,
      learningOutcomes: outcomes,
      weakAreas: weakAreas.length > 0 ? weakAreas : undefined,
      learnerContext,
    });
    const personalizedExplanation = explanationResponse?.explanation ?? undefined;

    const aiResponse = await requestAiQuiz({
      nodeId,
      nodeTitle: node.title,
      description: node.description ?? undefined,
      learningOutcomes: outcomes,
      difficultyLevel: node.difficultyLevel ?? undefined,
      adaptedDifficulty,
      questionCount: 4,
      explanation: personalizedExplanation,
      weakAreas: weakAreas.length > 0 ? weakAreas : undefined,
      learnerContext,
    });

    if (aiResponse?.quiz?.questions?.length) {
      const created = await prisma.quiz.create({
        data: {
          nodeId,
          isMicroQuiz: false,
          generatedBy: 'ai_tutor',
          questions: {
            create: aiResponse.quiz.questions.map((q, i) => ({
              questionType: 'multiple_choice' as const,
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              orderIndex: i,
            })),
          },
        },
        include: {
          questions: {
            select: { id: true, questionType: true, questionText: true, options: true, explanation: true, orderIndex: true },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });
      return created;
    }
  }

  // Fallback to any existing static quiz
  const staticQuiz = await prisma.quiz.findFirst({
    where: { nodeId, isMicroQuiz: false },
    orderBy: { createdAt: 'desc' },
    include: {
      questions: {
        select: { id: true, questionType: true, questionText: true, options: true, explanation: true, orderIndex: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });
  if (!staticQuiz) throw ApiError.notFound('No quiz found for this node');
  return staticQuiz;
}

export async function getNodeExplanation(nodeId: string, userId: string) {
  const progress = await assertNodeUnlocked(nodeId, userId);

  const node = await prisma.learningNode.findUnique({
    where: { id: nodeId },
    select: { title: true, description: true, learningOutcomes: true },
  });
  if (!node) throw ApiError.notFound('Node not found');

  const outcomes = Array.isArray(node.learningOutcomes) ? (node.learningOutcomes as string[]) : [];
  const learnerContext = await buildLearnerContext(userId, progress.enrollmentId, nodeId);

  // Detect weak areas if the learner has prior attempts
  const weakAreas = learnerContext.currentNodeAttempts > 0
    ? await detectWeakAreas(userId, nodeId)
    : [];

  const aiResponse = await requestAiExplanation({
    nodeId,
    nodeTitle: node.title,
    description: node.description ?? undefined,
    learningOutcomes: outcomes,
    weakAreas: weakAreas.length > 0 ? weakAreas : undefined,
    learnerContext,
  });

  return {
    nodeId,
    nodeTitle: node.title,
    explanation: aiResponse?.explanation ?? null,
    weakAreas: weakAreas.length > 0 ? weakAreas : null,
    fallback: !aiResponse?.explanation
      ? { description: node.description, learningOutcomes: outcomes }
      : null,
  };
}

/**
 * Build the AI context needed for the streaming explanation endpoint.
 * Does NOT call the AI service — the controller pipes the stream directly.
 */
export async function buildExplanationStreamContext(nodeId: string, userId: string) {
  const progress = await assertNodeUnlocked(nodeId, userId);

  const node = await prisma.learningNode.findUnique({
    where: { id: nodeId },
    select: { title: true, description: true, learningOutcomes: true },
  });
  if (!node) throw ApiError.notFound('Node not found');

  const outcomes = Array.isArray(node.learningOutcomes) ? (node.learningOutcomes as string[]) : [];
  const learnerContext = await buildLearnerContext(userId, progress.enrollmentId, nodeId);
  const weakAreas = learnerContext.currentNodeAttempts > 0
    ? await detectWeakAreas(userId, nodeId)
    : [];

  return {
    nodeId,
    nodeTitle: node.title,
    description: node.description ?? undefined,
    learningOutcomes: outcomes,
    weakAreas: weakAreas.length > 0 ? weakAreas : undefined,
    learnerContext,
  };
}

/** Build the AI ask payload without calling AI — used by the streaming controller. */
export async function buildAskStreamContext(
  nodeId: string,
  userId: string,
  question: string,
  explanation: AiAskPayload['explanation'],
  enrollmentId?: string,
): Promise<AiAskPayload> {
  const progress = await assertNodeUnlocked(nodeId, userId);

  const node = await prisma.learningNode.findUnique({
    where: { id: nodeId },
    select: { title: true, description: true, learningOutcomes: true },
  });
  if (!node) throw ApiError.notFound('Node not found');

  const outcomes = Array.isArray(node.learningOutcomes) ? (node.learningOutcomes as string[]) : [];
  const learnerContext = await buildLearnerContext(
    userId,
    enrollmentId ?? progress.enrollmentId,
    nodeId,
  );

  return {
    nodeId,
    nodeTitle: node.title,
    question,
    description: node.description ?? undefined,
    learningOutcomes: outcomes,
    explanation,
    learnerContext,
  };
}

export async function askNodeQuestion(
  nodeId: string,
  userId: string,
  question: string,
  explanation: AiAskPayload['explanation'],
  enrollmentId?: string,
) {
  const progress = await assertNodeUnlocked(nodeId, userId);

  const node = await prisma.learningNode.findUnique({
    where: { id: nodeId },
    select: { title: true, description: true, learningOutcomes: true },
  });
  if (!node) throw ApiError.notFound('Node not found');

  const outcomes = Array.isArray(node.learningOutcomes) ? (node.learningOutcomes as string[]) : [];
  const learnerContext = await buildLearnerContext(
    userId,
    enrollmentId ?? progress.enrollmentId,
    nodeId,
  );
  const result = await requestAiAsk({
    nodeId,
    nodeTitle: node.title,
    question,
    description: node.description ?? undefined,
    learningOutcomes: outcomes,
    explanation,
    learnerContext,
  });

  return { answer: result?.answer ?? null };
}

export async function submitAttempt(
  userId: string,
  quizId: string,
  data: SubmitAttemptInput,
) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        select: { id: true, correctAnswer: true },
      },
    },
  });
  if (!quiz) throw ApiError.notFound('Quiz not found');

  const progress = await prisma.learnerNodeProgress.findUnique({
    where: { userId_nodeId: { userId, nodeId: quiz.nodeId } },
    select: { unlocked: true, enrollmentId: true, attemptsCount: true, bestQuizScore: true },
  });
  if (!progress) throw ApiError.forbidden('Not enrolled in the domain containing this node');
  if (!progress.unlocked) throw ApiError.forbidden('Node is locked — complete prerequisites first');
  if (progress.enrollmentId !== data.enrollmentId) throw ApiError.forbidden();

  // Score answers
  const answerMap = new Map(data.answers.map((a) => [a.questionId, a.answer]));
  let correct = 0;
  for (const q of quiz.questions) {
    const submitted = answerMap.get(q.id);
    if (submitted !== undefined && submitted === q.correctAnswer) {
      correct++;
    }
  }
  const total = quiz.questions.length;
  const scorePercent = total > 0 ? parseFloat(((correct / total) * 100).toFixed(2)) : 0;
  const tier = classifyScore(scorePercent);
  const outcome = tier as string;

  const completedAt = new Date();

  // Create attempt record
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      nodeId: quiz.nodeId,
      scorePercent,
      outcome: outcome as never,
      answers: data.answers,
      startedAt: new Date(data.startedAt),
      completedAt,
    },
  });

  // Update progress: attemptsCount and bestQuizScore
  const prevBest = progress.bestQuizScore ? Number(progress.bestQuizScore) : null;
  const newBest = prevBest === null || scorePercent > prevBest ? scorePercent : prevBest;

  await prisma.learnerNodeProgress.updateMany({
    where: { userId, nodeId: quiz.nodeId, enrollmentId: data.enrollmentId },
    data: {
      attemptsCount: { increment: 1 },
      bestQuizScore: newBest,
    },
  });

  // Apply gatekeeper (mastery state, adaptation events, unlock)
  const gatekeeperResult = await applyGatekeeperOutcome({
    userId,
    nodeId: quiz.nodeId,
    enrollmentId: data.enrollmentId,
    quizAttemptId: attempt.id,
    scorePercent,
  });

  // Invalidate remedial quiz cache on pass (best-effort, non-blocking)
  if (tier === 'strong_pass' || tier === 'marginal_pass') {
    invalidateRemedialQuizCache(quiz.nodeId).catch(() => {});
  }

  // Attach challenge project if strong pass
  let challengeProject = null;
  if (tier === 'strong_pass') {
    challengeProject = await prisma.challengeProject.findFirst({
      where: { nodeId: quiz.nodeId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Attach adapted resource recommendations for fail_low
  let adaptedResources = null;
  if (tier === 'fail_low') {
    adaptedResources = await getAdaptedResources(quiz.nodeId);
  }

  return {
    attempt: {
      id: attempt.id,
      scorePercent,
      correctAnswers: correct,
      totalQuestions: total,
      completedAt,
    },
    gatekeeper: gatekeeperResult,
    challengeProject,
    adaptedResources,
  };
}

export async function listAttempts(userId: string, filters: AttemptFilters) {
  const { nodeId, limit = 20, offset = 0 } = filters;
  return prisma.quizAttempt.findMany({
    where: { userId, ...(nodeId ? { nodeId } : {}) },
    orderBy: { completedAt: 'desc' },
    skip: offset,
    take: limit,
    select: {
      id: true,
      quizId: true,
      nodeId: true,
      scorePercent: true,
      outcome: true,
      startedAt: true,
      completedAt: true,
      node: { select: { title: true, slug: true } },
    },
  });
}

export async function getAttempt(attemptId: string, userId: string) {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      node: { select: { id: true, title: true, slug: true } },
      adaptationEvents: {
        select: { adaptationType: true, details: true, createdAt: true },
      },
      quiz: {
        include: {
          questions: {
            select: { id: true, questionText: true, options: true, correctAnswer: true, explanation: true, orderIndex: true },
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
    },
  });
  if (!attempt) throw ApiError.notFound('Attempt not found');
  if (attempt.userId !== userId) throw ApiError.forbidden();
  return attempt;
}

export async function getChallengeProject(nodeId: string, userId: string) {
  const progress = await prisma.learnerNodeProgress.findUnique({
    where: { userId_nodeId: { userId, nodeId } },
    select: { masteryState: true },
  });
  if (!progress) throw ApiError.forbidden('Not enrolled in the domain containing this node');
  if (progress.masteryState !== 'mastered') {
    throw ApiError.forbidden('Must master this node before accessing the challenge project');
  }

  const project = await prisma.challengeProject.findFirst({
    where: { nodeId },
    orderBy: { createdAt: 'asc' },
  });
  if (!project) throw ApiError.notFound('No challenge project found for this node');
  return project;
}
