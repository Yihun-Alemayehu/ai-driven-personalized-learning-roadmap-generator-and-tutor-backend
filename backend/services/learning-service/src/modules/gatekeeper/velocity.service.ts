import { prisma } from '../../lib/prisma';

export async function recordVelocity(params: {
  userId: string;
  enrollmentId: string;
  nodeId: string;
  completedAt: Date;
}): Promise<void> {
  const { userId, enrollmentId, nodeId, completedAt } = params;

  const firstAttempt = await prisma.quizAttempt.findFirst({
    where: { userId, nodeId },
    orderBy: { startedAt: 'asc' },
    select: { startedAt: true },
  });

  if (!firstAttempt) return;

  const startedAt = firstAttempt.startedAt;
  const diffMs = completedAt.getTime() - startedAt.getTime();
  const actualHours = Math.max(0.01, diffMs / 3_600_000);

  const node = await prisma.learningNode.findUnique({
    where: { id: nodeId },
    select: { estimatedHours: true },
  });

  const estimatedHours = node?.estimatedHours ? Number(node.estimatedHours) : null;
  const velocityRatio = estimatedHours && estimatedHours > 0
    ? parseFloat((actualHours / estimatedHours).toFixed(2))
    : 1.0;

  await prisma.learnerVelocity.upsert({
    where: { userId_nodeId: { userId, nodeId } },
    create: {
      userId,
      enrollmentId,
      nodeId,
      estimatedHours: estimatedHours ?? undefined,
      actualHours,
      startedAt,
      completedAt,
      velocityRatio,
    },
    update: {
      actualHours,
      completedAt,
      velocityRatio,
    },
  });
}

export async function getAverageVelocity(enrollmentId: string): Promise<number | null> {
  const records = await prisma.learnerVelocity.findMany({
    where: { enrollmentId },
    select: { velocityRatio: true },
  });

  if (records.length === 0) return null;

  const sum = records.reduce((acc, r) => acc + Number(r.velocityRatio), 0);
  return parseFloat((sum / records.length).toFixed(2));
}
