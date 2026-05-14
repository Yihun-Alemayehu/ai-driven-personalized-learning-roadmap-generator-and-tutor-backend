import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';
import { PageSpinner } from '@/components/common/Spinner';

// ── Pages ─────────────────────────────────────────────────────────────────────
import DashboardPage from '@/pages/DashboardPage';
import NotFoundPage from '@/pages/NotFoundPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import ProfilePage from '@/pages/ProfilePage';

// ── Lazy-loaded (added per phase) ─────────────────────────────────────────────
const CatalogPage       = lazy(() => import('@/features/catalog/DomainCatalogPage'));
const DomainDetailPage  = lazy(() => import('@/features/catalog/DomainDetailPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage'));

// ── Route helpers ──────────────────────────────────────────────────────────────
function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}

// ── Router ────────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    lazy: () => import('@/features/auth/LoginPage').then((m) => ({ Component: m.default })),
  },
  {
    path: '/register',
    lazy: () => import('@/features/auth/RegisterPage').then((m) => ({ Component: m.default })),
  },
  {
    path: '/auth/callback',
    lazy: () => import('@/features/auth/OAuthCallbackPage').then((m) => ({ Component: m.default })),
  },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '/404', element: <NotFoundPage /> },

  // Protected shell
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile',   element: <ProfilePage /> },
      { path: 'catalog',   element: <Lazy><CatalogPage /></Lazy> },
      { path: 'catalog/:slug', element: <Lazy><DomainDetailPage /></Lazy> },
      { path: 'notifications', element: <Lazy><NotificationsPage /></Lazy> },

      // Roadmap + quiz (Phase 4 & 5)
      {
        path: 'enrollments/:id/roadmap',
        lazy: () => import('@/features/roadmap/RoadmapPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'quiz/:nodeId',
        lazy: () => import('@/features/quiz/QuizPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'quiz-attempts/:id',
        lazy: () => import('@/features/quiz/AttemptReviewPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'enrollments/:id/learn/:nodeId',
        lazy: () => import('@/features/learn/LearnPage').then((m) => ({ Component: m.default })),
      },

      // Instructor (Phase 8)
      {
        path: 'instructor',
        element: <RoleGuard roles={['instructor', 'admin']}><Suspense fallback={<PageSpinner />}><Navigate to="/instructor/learners" replace /></Suspense></RoleGuard>,
      },
      {
        path: 'instructor/*',
        element: <RoleGuard roles={['instructor', 'admin']}><Lazy><Navigate to="/instructor/learners" replace /></Lazy></RoleGuard>,
      },

      // Admin (Phase 9)
      {
        path: 'admin',
        element: <RoleGuard roles={['admin']}><Navigate to="/admin/stats" replace /></RoleGuard>,
      },
      {
        path: 'admin/*',
        element: <RoleGuard roles={['admin']}><Lazy><Navigate to="/admin/stats" replace /></Lazy></RoleGuard>,
      },

      // Settings placeholder
      { path: 'settings', element: <ProfilePage /> },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);
