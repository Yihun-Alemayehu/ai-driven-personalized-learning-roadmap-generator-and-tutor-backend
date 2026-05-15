import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import RoleGuard from './RoleGuard';
import { useAuthStore } from '@/store/auth.store';
import { mockUser, mockAdmin } from '@/test/mocks';

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
});

describe('RoleGuard', () => {
  it('redirects when user has insufficient role', () => {
    useAuthStore.setState({ user: mockUser, accessToken: 'token', refreshToken: 'rt' });
    renderWithProviders(
      <RoleGuard roles={['admin']}>
        <div data-testid="admin-content">Admin Area</div>
      </RoleGuard>,
    );
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  it('renders children when user has required role', () => {
    useAuthStore.setState({ user: mockAdmin, accessToken: 'token', refreshToken: 'rt' });
    renderWithProviders(
      <RoleGuard roles={['admin']}>
        <div data-testid="admin-content">Admin Area</div>
      </RoleGuard>,
    );
    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  });

  it('renders children when user matches one of multiple allowed roles', () => {
    useAuthStore.setState({ user: mockUser, accessToken: 'token', refreshToken: 'rt' });
    renderWithProviders(
      <RoleGuard roles={['learner', 'instructor']}>
        <div data-testid="content">Content</div>
      </RoleGuard>,
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('redirects when no user is set', () => {
    renderWithProviders(
      <RoleGuard roles={['admin']}>
        <div data-testid="admin-content">Admin Area</div>
      </RoleGuard>,
    );
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });
});
