import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';
import { PageSpinner } from '@/components/common/Spinner';
import InstructorLayout from '@/features/instructor/InstructorLayout';
import AdminLayout from '@/features/admin/AdminLayout';

// ── Pages ─────────────────────────────────────────────────────────────────────
import DashboardPage from '@/pages/DashboardPage';
import NotFoundPage from '@/pages/NotFoundPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';

// ── Lazy-loaded ────────────────────────────────────────────────────────────────
const CatalogPage       = lazy(() => import('@/features/catalog/DomainCatalogPage'));
const DomainDetailPage  = lazy(() => import('@/features/catalog/DomainDetailPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage'));

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}

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

  // Protected shell (AppShell layout)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard',  element: <DashboardPage /> },
      { path: 'profile',    element: <ProfilePage /> },
      { path: 'settings',   element: <SettingsPage /> },
      { path: 'catalog',    element: <Lazy><CatalogPage /></Lazy> },
      { path: 'catalog/:slug', element: <Lazy><DomainDetailPage /></Lazy> },
      { path: 'notifications', element: <Lazy><NotificationsPage /></Lazy> },
      {
        path: 'insights',
        lazy: () => import('@/features/insights/GlobalInsightsPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'enrollments/:id/roadmap',
        lazy: () => import('@/features/roadmap/RoadmapPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'enrollments/:id/insights',
        lazy: () => import('@/features/insights/InsightsPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'enrollments/:id/learn/:nodeId',
        lazy: () => import('@/features/learn/LearnPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'quiz/:nodeId',
        lazy: () => import('@/features/quiz/QuizPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'quiz-attempts/:id',
        lazy: () => import('@/features/quiz/AttemptReviewPage').then((m) => ({ Component: m.default })),
      },

    ],
  },

  // Admin layout — has its own sidebar, outside AppShell
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <RoleGuard roles={['admin']}>
          <AdminLayout />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="stats" replace /> },
      {
        path: 'stats',
        lazy: () => import('@/features/admin/SystemStatsPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'users',
        lazy: () => import('@/features/admin/UserManagementPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'domains',
        lazy: () => import('@/features/admin/DomainManagementPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'ontology/:ontologyId',
        lazy: () => import('@/features/admin/OntologyBuilderPage').then((m) => ({ Component: m.default })),
      },
    ],
  },

  // Instructor layout — has its own sidebar, wraps outside AppShell
  {
    path: '/instructor',
    element: (
      <ProtectedRoute>
        <RoleGuard roles={['domain_expert', 'admin']}>
          <InstructorLayout />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="learners" replace /> },
      {
        path: 'learners',
        lazy: () => import('@/features/instructor/LearnerListPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'learners/:userId',
        lazy: () => import('@/features/instructor/LearnerProgressPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'analytics',
        lazy: () => import('@/features/instructor/DomainAnalyticsPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'flagged',
        lazy: () => import('@/features/instructor/FlaggedEventsPage').then((m) => ({ Component: m.default })),
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);
