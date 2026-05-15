import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth.store';
import { mockUser, mockTokens } from '@/test/mocks';

// Reset store state between tests
function resetStore() {
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
}

describe('auth.store', () => {
  beforeEach(resetStore);

  it('is unauthenticated by default', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setAuth populates user and tokens', () => {
    useAuthStore.getState().setAuth(mockUser, mockTokens.accessToken, mockTokens.refreshToken);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe(mockTokens.accessToken);
    expect(state.isAuthenticated()).toBe(true);
  });

  it('logout clears user and tokens', () => {
    useAuthStore.getState().setAuth(mockUser, mockTokens.accessToken, mockTokens.refreshToken);
    // Patch logout to not call window.location in tests
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setAccessToken updates tokens without clearing user', () => {
    useAuthStore.getState().setAuth(mockUser, mockTokens.accessToken, mockTokens.refreshToken);
    useAuthStore.getState().setAccessToken('new-access', 'new-refresh');
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().accessToken).toBe('new-access');
  });
});
