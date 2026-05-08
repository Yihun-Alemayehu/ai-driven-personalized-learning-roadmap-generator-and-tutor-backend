import { prisma } from '../../lib/prisma';
import type { Prisma } from '@prisma/client';
import { checkAndUnlockNodes } from '../progress/progress.service';
import type { GatekeeperTier, GatekeeperResult } from './gatekeeper.types';

// ── Pure classification ───────────────────────────────────────────────────────

export function classifyScore(scorePercent: number): GatekeeperTier {
  if (scorePercent >= 80) return 'strong_pass';
  if (scorePercent >= 70) return 'marginal_pass';
  if (scorePercent >= 50) return 'fail_low';
  if (scorePercent >= 30) return 'fail_fundamental';
  return 'fail_severe';
}

// ── DB side-effects ───────────────────────────────────────────────────────────

export async function applyGatekeeperOutcome(params: {
  userId: string;
  nodeId: string;
  enrollmentId: string;
  quizAttemptId: string;
  scorePercent: number;
}): Promise<GatekeeperResult> {
  const { userId, nodeId, enrollmentId, quizAttemptId, scorePercent } = params;
  const tier = classifyScore(scorePercent);
  const isPass = tier === 'strong_pass' || tier === 'marginal_pass';
  const isMarginalPass = tier === 'marginal_pass';

  const now = new Date();
  const progressUpdate: Record<string, unknown> = {
    lastReviewedAt: now,
  };

  if (isPass) {
    progressUpdate.masteryState = 'mastered';
    progressUpdate.masteredAt = now;
    progressUpdate.isMarginalPass = isMarginalPass;
  } else {
    progressUpdate.masteryState = 'in_progress';
  }

  await prisma.learnerNodeProgress.updateMany({
    where: { userId, nodeId, enrollmentId },
    data: progressUpdate,
  });

  let adaptationType: GatekeeperResult['adaptationType'];
  let adaptationDetails: Prisma.InputJsonValue = {};

  if (tier === 'fail_low') {
    adaptationType = 'resource_swap';
  } else if (tier === 'fail_fundamental') {
    adaptationType = 'prerequisite_review';
    const prereqs = await prisma.nodePrerequisite.findMany({
      where: { nodeId },
      select: { prerequisiteNodeId: true },
    });
    adaptationDetails = { prerequisiteNodeIds: prereqs.map((p) => p.prerequisiteNodeId) };
  } else if (tier === 'fail_severe') {
    adaptationType = 'instructor_escalation';
  }

  if (adaptationType) {
    await prisma.adaptationEvent.create({
      data: {
        userId,
        nodeId,
        quizAttemptId,
        adaptationType,
        details: adaptationDetails,
      },
    });
  }

  const newlyUnlockedNodes = isPass ? await checkAndUnlockNodes(userId, enrollmentId) : [];

  return {
    tier,
    newMasteryState: isPass ? 'mastered' : 'in_progress',
    isMarginalPass,
    adaptationType,
    newlyUnlockedNodes,
  };
}
