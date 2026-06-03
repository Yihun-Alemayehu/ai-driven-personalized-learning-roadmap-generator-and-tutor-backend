import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockPrisma: any = {
  enrollment: { findUnique: jest.fn() },
  certificate: { findUnique: jest.fn(), create: jest.fn() },
  learnerNodeProgress: { findMany: jest.fn() },
};

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }));

import {
  claimCertificate,
  getMyCertificate,
  getPublicCertificate,
} from '../src/modules/certificates/certificates.service';

describe('certificates.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('claims a certificate for a fully completed enrollment', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue({
      userId: 'user-1',
      domainId: 'domain-1',
      user: { fullName: 'Alice Doe' },
      domain: { name: 'Frontend Engineering' },
    });
    mockPrisma.certificate.findUnique.mockResolvedValue(null);
    mockPrisma.learnerNodeProgress.findMany.mockResolvedValue([
      {
        masteryState: 'mastered',
        bestQuizScore: 90,
        masteredAt: new Date('2026-01-10T10:00:00.000Z'),
        node: { estimatedHours: 2 },
      },
      {
        masteryState: 'review_needed',
        bestQuizScore: 80,
        masteredAt: new Date('2026-01-12T10:00:00.000Z'),
        node: { estimatedHours: 1.5 },
      },
    ]);
    mockPrisma.certificate.create.mockImplementation(async ({ data }: any) => ({
      ...data,
      issuedAt: new Date('2026-01-15T10:00:00.000Z'),
    }));

    const cert = await claimCertificate('enr-1', 'user-1');

    expect(cert.publicId).toMatch(/^ATL-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    expect(cert.recipientName).toBe('Alice Doe');
    expect(cert.courseName).toBe('Frontend Engineering');
    expect(cert.hoursInvested).toBe(3.5);
    expect(cert.averageScore).toBe(85);
    expect(mockPrisma.certificate.create).toHaveBeenCalledTimes(1);
  });

  it('returns existing certificate on repeated claim (idempotent)', async () => {
    const existing = {
      publicId: 'ATL-AB12-CD34',
      recipientName: 'Alice Doe',
      courseName: 'Frontend Engineering',
      hoursInvested: 12.5,
      averageScore: 88,
      completedAt: new Date('2026-01-20T10:00:00.000Z'),
      issuedAt: new Date('2026-01-21T10:00:00.000Z'),
    };

    mockPrisma.enrollment.findUnique.mockResolvedValue({
      userId: 'user-1',
      domainId: 'domain-1',
      user: { fullName: 'Alice Doe' },
      domain: { name: 'Frontend Engineering' },
    });
    mockPrisma.certificate.findUnique.mockResolvedValue(existing);

    const cert = await claimCertificate('enr-1', 'user-1');

    expect(cert.publicId).toBe(existing.publicId);
    expect(mockPrisma.certificate.create).not.toHaveBeenCalled();
    expect(mockPrisma.learnerNodeProgress.findMany).not.toHaveBeenCalled();
  });

  it('blocks claim when enrollment is not fully complete', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue({
      userId: 'user-1',
      domainId: 'domain-1',
      user: { fullName: 'Alice Doe' },
      domain: { name: 'Frontend Engineering' },
    });
    mockPrisma.certificate.findUnique.mockResolvedValue(null);
    mockPrisma.learnerNodeProgress.findMany.mockResolvedValue([
      {
        masteryState: 'mastered',
        bestQuizScore: 90,
        masteredAt: new Date('2026-01-10T10:00:00.000Z'),
        node: { estimatedHours: 2 },
      },
      {
        masteryState: 'in_progress',
        bestQuizScore: 55,
        masteredAt: null,
        node: { estimatedHours: 2 },
      },
    ]);

    await expect(claimCertificate('enr-1', 'user-1')).rejects.toMatchObject({
      statusCode: 403,
    });
    await expect(claimCertificate('enr-1', 'user-1')).rejects.toThrow('Roadmap is 50% complete');
  });

  it('verifies a public certificate by publicId', async () => {
    mockPrisma.certificate.findUnique.mockResolvedValue({
      publicId: 'ATL-K7X2-P9Q3',
      recipientName: 'Alice Doe',
      courseName: 'Frontend Engineering',
      hoursInvested: 14,
      averageScore: 92,
      completedAt: new Date('2026-02-01T08:00:00.000Z'),
      issuedAt: new Date('2026-02-02T08:00:00.000Z'),
    });

    const result = await getPublicCertificate('ATL-K7X2-P9Q3');

    expect(result.verified).toBe(true);
    expect(result.certificate.publicId).toBe('ATL-K7X2-P9Q3');
    expect(result.certificate.recipientName).toBe('Alice Doe');
  });

  it('forbids reading certificate state for another user enrollment', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue({ userId: 'user-2' });

    await expect(getMyCertificate('enr-1', 'user-1')).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});
