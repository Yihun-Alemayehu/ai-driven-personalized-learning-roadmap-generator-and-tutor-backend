import { describe, it, expect } from 'vitest';
import { buildOAuthUrl } from './components/OAuthButtons';

describe('buildOAuthUrl', () => {
  it('uses the configured gateway base without duplicating /api/v1', () => {
    expect(buildOAuthUrl('google', 'http://localhost:3000/api/v1')).toBe('http://localhost:3000/api/v1/auth/oauth/google');
  });

  it('falls back to the local api path when no gateway is configured', () => {
    expect(buildOAuthUrl('github', '')).toBe('/api/v1/auth/oauth/github');
  });
});
