import { apiClient } from './client';
import type { User, AuthTokens, AuthResponse } from '@/types';

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
};
