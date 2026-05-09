import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: (input.data ?? null) as Prisma.InputJsonValue,
    },
  });
}

export interface NotificationFilters {
  read?: boolean;
  limit?: number;
  offset?: number;
}

export async function getNotifications(userId: string, filters: NotificationFilters = {}) {
  const { read, limit = 20, offset = 0 } = filters;
  const where: Prisma.NotificationWhereInput = { userId };
  if (read !== undefined) where.read = read;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: [{ read: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, total, limit, offset };
}

export async function markRead(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!notification) throw ApiError.notFound('Notification not found');
  if (notification.userId !== userId) throw ApiError.forbidden();

  return prisma.notification.update({ where: { id }, data: { read: true } });
}

export async function markAllRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
