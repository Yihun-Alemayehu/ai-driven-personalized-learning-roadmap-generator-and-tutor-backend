import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client';
import type { User, AuthTokens, AuthResponse } from '@/types';
import { useAuthStore } from '@/store/auth.store';

export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: { fullName: string; email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthTokens>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  getMe: () => apiClient.get<{ user: User }>('/users/me').then((r) => r.data.user),

  updateMe: (data: { fullName?: string; avatarUrl?: string | null; preferredLanguage?: string }) =>
    apiClient.patch<{ user: User }>('/users/me', data).then((r) => r.data.user),

  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    apiClient.post<{ message: string }>('/users/me/change-password', data).then((r) => r.data),

  deleteMe: () => apiClient.delete('/users/me'),
};

export function useUpdateProfileMutation() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  return useMutation({
    mutationFn: (data: { fullName?: string; avatarUrl?: string | null; preferredLanguage?: string }) =>
      authApi.updateMe(data),
    onSuccess: (updatedUser) => {
      if (accessToken && refreshToken) {
        setAuth(updatedUser, accessToken, refreshToken);
      }
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      authApi.changePassword(data),
  });
}

export function useDeleteAccountMutation() {
  return useMutation({
    mutationFn: () => authApi.deleteMe(),
  });
}
