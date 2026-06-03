import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';

export const FREE_CREDITS = 30;

// Credit cost per action
export const CREDIT_COSTS = {
  explanation: 2,
  quiz: 2,
  ask: 1,
  microQuiz: 1,
} as const;

type CreditAction = keyof typeof CREDIT_COSTS;

/** Get or create a subscription row for a user. */
export async function getOrCreateSubscription(userId: string) {
  let sub = await prisma.userSubscription.findUnique({ where: { userId } });
  if (!sub) {
    sub = await prisma.userSubscription.create({
      data: {
        userId,
        tier: 'free',
        creditsRemaining: FREE_CREDITS,
        creditsResetAt: nextResetDate(),
      },
    });
  }
  return sub;
}

/** Returns true if this user has unlimited access (pro tier, admin, or domain_expert). */
export async function isUnlimited(userId: string, userRole: string): Promise<boolean> {
  if (userRole === 'admin' || userRole === 'domain_expert') return true;
  const sub = await getOrCreateSubscription(userId);
  return sub.tier === 'pro';
}

/**
 * Check credits and deduct `amount` for a free user.
 * - Admins and pro users: no-op (unlimited).
 * - Free users: apply rolling monthly reset if due, then check and deduct.
 * Throws 402 if insufficient credits.
 */
export async function consumeCredits(
  userId: string,
  userRole: string,
  action: CreditAction,
): Promise<void> {
  if (await isUnlimited(userId, userRole)) return;

  const amount = CREDIT_COSTS[action];
  const sub = await getOrCreateSubscription(userId);

  // Rolling 30-day reset
  const now = new Date();
  let { creditsRemaining } = sub;
  if (sub.creditsResetAt <= now) {
    creditsRemaining = FREE_CREDITS;
    await prisma.userSubscription.update({
      where: { userId },
      data: { creditsRemaining: FREE_CREDITS, creditsResetAt: nextResetDate() },
    });
  }

  if (creditsRemaining < amount) {
    throw ApiError.paymentRequired(
      `You need ${amount} credit${amount > 1 ? 's' : ''} but only have ${creditsRemaining} remaining. ` +
        'Upgrade to Scholar for unlimited AI access.',
    );
  }

  await prisma.userSubscription.update({
    where: { userId },
    data: {
      creditsRemaining: { decrement: amount },
      updatedAt: now,
    },
  });
}

/** Upgrade a user to Pro tier. */
export async function upgradeToPro(userId: string) {
  await getOrCreateSubscription(userId);
  return prisma.userSubscription.update({
    where: { userId },
    data: { tier: 'pro', updatedAt: new Date() },
  });
}

/** Downgrade a user back to Free. */
export async function downgradeToFree(userId: string) {
  await getOrCreateSubscription(userId);
  return prisma.userSubscription.update({
    where: { userId },
    data: { tier: 'free', creditsRemaining: FREE_CREDITS, creditsResetAt: nextResetDate() },
  });
}

/** Return the public credit status for a user. */
export async function getCreditStatus(userId: string, userRole: string) {
  if (userRole === 'admin' || userRole === 'domain_expert') {
    return { tier: 'pro' as const, unlimited: true, creditsRemaining: null, creditsResetAt: null };
  }
  const sub = await getOrCreateSubscription(userId);
  const now = new Date();
  // Auto-reset stale credits before returning status
  if (sub.creditsResetAt <= now) {
    const updated = await prisma.userSubscription.update({
      where: { userId },
      data: { creditsRemaining: FREE_CREDITS, creditsResetAt: nextResetDate() },
    });
    return {
      tier: updated.tier,
      unlimited: updated.tier === 'pro',
      creditsRemaining: updated.tier === 'pro' ? null : updated.creditsRemaining,
      creditsResetAt: updated.tier === 'free' ? updated.creditsResetAt.toISOString() : null,
    };
  }
  return {
    tier: sub.tier,
    unlimited: sub.tier === 'pro',
    creditsRemaining: sub.tier === 'pro' ? null : sub.creditsRemaining,
    creditsResetAt: sub.tier === 'free' ? sub.creditsResetAt.toISOString() : null,
  };
}

function nextResetDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}
