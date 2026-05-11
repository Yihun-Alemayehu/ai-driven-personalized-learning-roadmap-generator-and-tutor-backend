import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);

  return {
    user,
    isAuthenticated: Boolean(accessToken),
    isAdmin: user?.role === 'admin',
    isInstructor: user?.role === 'instructor' || user?.role === 'admin',
    isDomainExpert: user?.role === 'domain_expert' || user?.role === 'admin',
    logout,
  };
}
