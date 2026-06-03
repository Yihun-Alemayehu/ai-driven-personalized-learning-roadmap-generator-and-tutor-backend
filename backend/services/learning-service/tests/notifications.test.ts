import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockPrisma: any = {
  notification: { create: jest.fn(), findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
};

jest.mock('../src/lib/prisma', () => ({ prisma: mockPrisma }));

import { createNotification, getNotifications, markRead, markAllRead } from '../src/modules/notifications/notifications.service';

describe('notifications.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createNotification persists with data payload', async () => {
    mockPrisma.notification.create.mockResolvedValue({ id: 'n1' });

    const result = await createNotification({
      userId: 'user-1',
      type: 'decay',
      title: 'Review needed',
      body: 'Node is decaying',
      data: { nodeId: 'node-1' },
    });

    expect(mockPrisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        type: 'decay',
        title: 'Review needed',
        body: 'Node is decaying',
        data: { nodeId: 'node-1' },
      },
    });
    expect(result.id).toBe('n1');
  });

  it('getNotifications returns paginated results with total count', async () => {
    const rows = [{ id: 'n1', read: false }, { id: 'n2', read: true }];
    mockPrisma.notification.findMany.mockResolvedValue(rows);
    mockPrisma.notification.count.mockResolvedValue(2);

    const result = await getNotifications('user-1', { read: false, limit: 10, offset: 0 });

    expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', read: false },
      orderBy: [{ read: 'asc' }, { createdAt: 'desc' }],
      take: 10,
      skip: 0,
    });
    expect(result).toEqual({ notifications: rows, total: 2, limit: 10, offset: 0 });
  });

  it('getNotifications defaults limit and offset when no filters given', async () => {
    mockPrisma.notification.findMany.mockResolvedValue([]);
    mockPrisma.notification.count.mockResolvedValue(0);

    const result = await getNotifications('user-1');

    expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: [{ read: 'asc' }, { createdAt: 'desc' }],
      take: 20,
      skip: 0,
    });
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(0);
  });

  it('markRead throws not found when notification missing', async () => {
    mockPrisma.notification.findUnique.mockResolvedValue(null);
    await expect(markRead('nope', 'user-1')).rejects.toThrow('Notification not found');
  });

  it('markRead throws forbidden when userId does not match', async () => {
    mockPrisma.notification.findUnique.mockResolvedValue({ userId: 'other-user' });
    await expect(markRead('n1', 'user-1')).rejects.toThrow('Forbidden');
  });

  it('markRead updates notification to read when authorized', async () => {
    mockPrisma.notification.findUnique.mockResolvedValue({ userId: 'user-1' });
    mockPrisma.notification.update.mockResolvedValue({ id: 'n1', read: true });

    const result = await markRead('n1', 'user-1');

    expect(mockPrisma.notification.update).toHaveBeenCalledWith({ where: { id: 'n1' }, data: { read: true } });
    expect(result.read).toBe(true);
  });

  it('markAllRead sets all unread notifications to read for user', async () => {
    await markAllRead('user-1');

    expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', read: false },
      data: { read: true },
    });
  });
});
