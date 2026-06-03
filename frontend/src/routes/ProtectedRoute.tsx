import { lazy, Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { PageSpinner } from '@/components/common/Spinner';

const LandingPage = lazy(() => import('@/features/landing/LandingPage'));

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { pathname } = useLocation();

  // Root is always the public landing page — logged in or not
  if (pathname === '/') {
    return (
      <Suspense fallback={<PageSpinner />}>
        <LandingPage />
      </Suspense>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
