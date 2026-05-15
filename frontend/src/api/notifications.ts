import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Notification } from '@/types';

interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  limit: number;
  offset: number;
}

export const notificationKeys = {
  all: ['notifications'] as const,
};

export function useNotificationsQuery() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: () =>
      apiClient
        .get<NotificationsResponse>('/notifications?limit=20')
        .then((r) => r.data.notifications),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useUnreadCount() {
  const { data } = useNotificationsQuery();
  return data?.filter((n) => !n.read).length ?? 0;
}

export function useMarkReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.patch(`/notifications/${id}/read`).then((r) => r.data),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: notificationKeys.all });
      const prev = qc.getQueryData<Notification[]>(notificationKeys.all);
      qc.setQueryData<Notification[]>(notificationKeys.all, (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(notificationKeys.all, ctx.prev);
    },
  });
}

export function useMarkAllReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.patch('/notifications/read-all').then((r) => r.data),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: notificationKeys.all });
      const prev = qc.getQueryData<Notification[]>(notificationKeys.all);
      qc.setQueryData<Notification[]>(notificationKeys.all, (old) =>
        old?.map((n) => ({ ...n, read: true })),
      );
      return { prev };
    },
    onError: (_err, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(notificationKeys.all, ctx.prev);
    },
  });
}
