import { prisma } from '../../lib/prisma';

export interface LearnerContext {
  familiarityLevel: string | null;
  learningGoal: string | null;
  weeklyHours: number | null;
  aboutSelf: string | null;
  preferredLearningStyle: string | null;
  priorSkills: string | null;

  currentNodeAttempts: number;
  currentNodeBestScore: number | null;
  currentNodeMasteryState: string;

  overallAvgScore: number | null;
  nodesCompleted: number;
  totalNodes: number;
}

export function computeAdaptiveDifficulty(
  nodeStaticDifficulty: number | null | undefined,
  currentNodeBestScore: number | null,
  currentNodeAttempts: number,
  overallAvgScore: number | null,
): number {
  const base = nodeStaticDifficulty ?? 3;

  if (currentNodeAttempts === 0) return base;

  let adjusted = base;

  if (currentNodeBestScore !== null) {
    if (currentNodeBestScore >= 80) adjusted = Math.min(5, base + 1);
    else if (currentNodeBestScore < 70) adjusted = Math.max(1, base - 1);
  }

  if (overallAvgScore !== null) {
    if (overallAvgScore > 85) adjusted = Math.min(5, adjusted + 1);
    else if (overallAvgScore < 50) adjusted = Math.max(1, adjusted - 1);
  }

  return adjusted;
}

interface AnswerEntry {
  questionId: string;
  answer: string;
}

export async function detectWeakAreas(
  userId: string,
  nodeId: string,
): Promise<string[]> {
  const lastAttempt = await prisma.quizAttempt.findFirst({
    where: { userId, nodeId },
    orderBy: { completedAt: 'desc' },
    select: {
      answers: true,
      quiz: {
        select: {
          questions: {
            select: { id: true, correctAnswer: true, questionText: true },
          },
        },
      },
    },
  });

  if (!lastAttempt) return [];

  const submittedAnswers = lastAttempt.answers as unknown as AnswerEntry[];
  const answerMap = new Map(submittedAnswers.map((a) => [a.questionId, a.answer]));

  const weakAreas: string[] = [];
  for (const q of lastAttempt.quiz.questions) {
    const submitted = answerMap.get(q.id);
    if (submitted === undefined || submitted !== q.correctAnswer) {
      weakAreas.push(q.questionText);
    }
  }

  return weakAreas;
}

export async function buildLearnerContext(
  userId: string,
  enrollmentId: string,
  nodeId: string,
): Promise<LearnerContext> {
  const [enrollment, currentProgress, allProgress] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        weeklyHours: true,
        familiarityLevel: true,
        learningGoal: true,
        aboutSelf: true,
        preferredLearningStyle: true,
        priorSkills: true,
      },
    }),
    prisma.learnerNodeProgress.findUnique({
      where: { userId_nodeId: { userId, nodeId } },
      select: {
        attemptsCount: true,
        bestQuizScore: true,
        masteryState: true,
      },
    }),
    prisma.learnerNodeProgress.findMany({
      where: { enrollmentId },
      select: {
        masteryState: true,
        bestQuizScore: true,
      },
    }),
  ]);

  const nodesCompleted = allProgress.filter(
    (p) => p.masteryState === 'mastered' || p.masteryState === 'review_needed',
  ).length;

  const scores = allProgress
    .map((p) => (p.bestQuizScore != null ? Number(p.bestQuizScore) : null))
    .filter((s): s is number => s !== null);

  const overallAvgScore =
    scores.length > 0
      ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
      : null;

  return {
    familiarityLevel: enrollment?.familiarityLevel ?? null,
    learningGoal: enrollment?.learningGoal ?? null,
    weeklyHours: enrollment?.weeklyHours ?? null,
    aboutSelf: enrollment?.aboutSelf ?? null,
    preferredLearningStyle: enrollment?.preferredLearningStyle ?? null,
    priorSkills: enrollment?.priorSkills ?? null,

    currentNodeAttempts: currentProgress?.attemptsCount ?? 0,
    currentNodeBestScore: currentProgress?.bestQuizScore != null
      ? Number(currentProgress.bestQuizScore)
      : null,
    currentNodeMasteryState: currentProgress?.masteryState ?? 'not_started',

    overallAvgScore,
    nodesCompleted,
    totalNodes: allProgress.length,
  };
}
