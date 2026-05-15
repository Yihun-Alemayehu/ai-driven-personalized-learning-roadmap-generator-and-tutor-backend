import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '@/store/auth.store';
import { mockUser, mockTokens } from '@/test/mocks';

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
});

describe('ProtectedRoute', () => {
  it('redirects to /login when unauthenticated', () => {
    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="content">Protected</div>
      </ProtectedRoute>,
    );
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    useAuthStore.setState({ user: mockUser, accessToken: mockTokens.accessToken, refreshToken: mockTokens.refreshToken });
    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="content">Protected</div>
      </ProtectedRoute>,
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
