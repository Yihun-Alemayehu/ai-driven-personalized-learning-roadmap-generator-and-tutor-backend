import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import type { MasteryState } from '@prisma/client';

const COMPLETED_STATES: MasteryState[] = ['mastered', 'review_needed'];

/** Crockford-ish base32 (no I, L, O, U) for human-readable, unambiguous codes. */
const CODE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function generatePublicId(): string {
  const bytes = crypto.randomBytes(8);
  let raw = '';
  for (let i = 0; i < 8; i += 1) raw += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return `ATL-${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

interface CompletionSummary {
  totalNodes: number;
  completedNodes: number;
  completionPercent: number;
  completedHours: number;
  averageScore: number | null;
  lastCompletedAt: Date | null;
}

/** Compute completion metrics for an enrollment from its node-progress rows. */
async function computeCompletion(enrollmentId: string): Promise<CompletionSummary> {
  const rows = await prisma.learnerNodeProgress.findMany({
    where: { enrollmentId },
    select: {
      masteryState: true,
      bestQuizScore: true,
      masteredAt: true,
      node: { select: { estimatedHours: true } },
    },
  });

  const totalNodes = rows.length;
  const completed = rows.filter((r) => COMPLETED_STATES.includes(r.masteryState));
  const completedNodes = completed.length;
  const completionPercent = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  const completedHours = completed.reduce(
    (sum, r) => sum + (r.node.estimatedHours ? Number(r.node.estimatedHours) : 0),
    0,
  );

  const scores = rows
    .map((r) => (r.bestQuizScore !== null ? Number(r.bestQuizScore) : null))
    .filter((s): s is number => s !== null && !Number.isNaN(s));
  const averageScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const completedDates = completed
    .map((r) => r.masteredAt)
    .filter((d): d is Date => d !== null);
  const lastCompletedAt =
    completedDates.length > 0
      ? new Date(Math.max(...completedDates.map((d) => d.getTime())))
      : null;

  return {
    totalNodes,
    completedNodes,
    completionPercent,
    completedHours: parseFloat(completedHours.toFixed(1)),
    averageScore,
    lastCompletedAt,
  };
}

function serializeCertificate(c: {
  publicId: string;
  recipientName: string;
  courseName: string;
  hoursInvested: unknown;
  averageScore: unknown;
  completedAt: Date;
  issuedAt: Date;
}) {
  return {
    publicId: c.publicId,
    recipientName: c.recipientName,
    courseName: c.courseName,
    hoursInvested: c.hoursInvested !== null ? Number(c.hoursInvested) : null,
    averageScore: c.averageScore !== null ? Number(c.averageScore) : null,
    completedAt: c.completedAt.toISOString(),
    issuedAt: c.issuedAt.toISOString(),
  };
}

/**
 * Get the current user's certificate state for an enrollment.
 * Returns the issued certificate (if any) plus eligibility so the UI can
 * decide whether to show a "Claim certificate" button.
 */
export async function getMyCertificate(enrollmentId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { userId: true },
  });
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  if (enrollment.userId !== userId) throw ApiError.forbidden();

  const existing = await prisma.certificate.findUnique({ where: { enrollmentId } });
  const completion = await computeCompletion(enrollmentId);

  return {
    certificate: existing ? serializeCertificate(existing) : null,
    eligible: completion.completionPercent === 100 && completion.totalNodes > 0,
    completionPercent: completion.completionPercent,
  };
}

/**
 * Claim (issue) a certificate for a fully-completed enrollment.
 * Idempotent — returns the existing certificate if one was already issued.
 */
export async function claimCertificate(enrollmentId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      userId: true,
      domainId: true,
      user: { select: { fullName: true } },
      domain: { select: { name: true } },
    },
  });
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  if (enrollment.userId !== userId) throw ApiError.forbidden();

  // Idempotent: return the existing certificate if already claimed
  const existing = await prisma.certificate.findUnique({ where: { enrollmentId } });
  if (existing) return serializeCertificate(existing);

  const completion = await computeCompletion(enrollmentId);
  if (completion.totalNodes === 0 || completion.completionPercent < 100) {
    throw ApiError.forbidden(
      `Roadmap is ${completion.completionPercent}% complete — master every node to claim your certificate.`,
    );
  }

  // Generate a unique public id (retry a few times on the rare collision)
  let created = null;
  for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
    try {
      created = await prisma.certificate.create({
        data: {
          publicId: generatePublicId(),
          userId,
          enrollmentId,
          domainId: enrollment.domainId,
          recipientName: enrollment.user.fullName,
          courseName: enrollment.domain.name,
          hoursInvested: completion.completedHours,
          averageScore: completion.averageScore,
          completedAt: completion.lastCompletedAt ?? new Date(),
        },
      });
    } catch (err) {
      // Unique violation on publicId → retry; unique on enrollmentId → race, fetch existing
      const race = await prisma.certificate.findUnique({ where: { enrollmentId } });
      if (race) return serializeCertificate(race);
      if (attempt === 4) throw err;
    }
  }

  return serializeCertificate(created!);
}

/** Public (no-auth) verification lookup by the printed public id. */
export async function getPublicCertificate(publicId: string) {
  const cert = await prisma.certificate.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      recipientName: true,
      courseName: true,
      hoursInvested: true,
      averageScore: true,
      completedAt: true,
      issuedAt: true,
    },
  });
  if (!cert) throw ApiError.notFound('Certificate not found');
  return { verified: true, certificate: serializeCertificate(cert) };
}
