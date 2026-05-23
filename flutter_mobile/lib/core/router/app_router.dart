import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/admin/admin_shell.dart';
import '../../features/admin/domain_management_screen.dart';
import '../../features/admin/system_stats_screen.dart';
import '../../features/admin/user_management_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/register_screen.dart';
import '../../features/catalog/catalog_screen.dart';
import '../../features/catalog/domain_detail_screen.dart';
import '../../features/dashboard/dashboard_screen.dart';
import '../../features/instructor/analytics_screen.dart';
import '../../features/instructor/flagged_events_screen.dart';
import '../../features/instructor/instructor_shell.dart';
import '../../features/instructor/learner_list_screen.dart';
import '../../features/instructor/learner_progress_screen.dart';
import '../../features/learn/learn_screen.dart';
import '../../features/notifications/notifications_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/quiz/attempt_review_screen.dart';
import '../../features/quiz/quiz_screen.dart';
import '../../features/roadmap/roadmap_screen.dart';
import '../../features/settings/settings_screen.dart';
import '../../widgets/app_shell.dart';
import '../models/user.dart';
import '../providers/auth_provider.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authAsync = ref.watch(authProvider);
  final auth = authAsync.valueOrNull;

  return GoRouter(
    initialLocation: '/dashboard',
    redirect: (context, state) {
      final location = state.matchedLocation;
      final isAuthRoute = location == '/login' || location == '/register';
      final isAuthenticated = auth?.isAuthenticated ?? false;

      if (authAsync.isLoading) {
        return null;
      }

      if (!isAuthenticated && !isAuthRoute) {
        return '/login';
      }

      if (isAuthenticated && isAuthRoute) {
        return '/dashboard';
      }

      final role = auth?.user?.role ?? UserRole.learner;

      if (location.startsWith('/instructor') &&
          role != UserRole.instructor &&
          role != UserRole.admin) {
        return '/dashboard';
      }

      if (location.startsWith('/admin') && role != UserRole.admin) {
        return '/dashboard';
      }

      return null;
    },
    routes: <RouteBase>[
      GoRoute(
        path: '/',
        redirect: (_, __) =>
            auth?.isAuthenticated == true ? '/dashboard' : '/login',
      ),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      ShellRoute(
        builder: (_, __, child) {
          return AppShell(userRole: auth?.user?.role, child: child);
        },
        routes: <RouteBase>[
          GoRoute(
            path: '/dashboard',
            builder: (_, __) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/catalog',
            builder: (_, __) => const CatalogScreen(),
            routes: <RouteBase>[
              GoRoute(
                path: ':slug',
                builder: (_, state) => DomainDetailScreen(
                  slug: state.pathParameters['slug'] ?? '',
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/enrollments/:id/roadmap',
            builder: (_, state) =>
                RoadmapScreen(enrollmentId: state.pathParameters['id'] ?? ''),
          ),
          GoRoute(
            path: '/enrollments/:id/learn/:nodeId',
            builder: (_, state) => LearnScreen(
              enrollmentId: state.pathParameters['id'] ?? '',
              nodeId: state.pathParameters['nodeId'] ?? '',
            ),
          ),
          GoRoute(
            path: '/enrollments/:id/quiz/:nodeId',
            builder: (_, state) => QuizScreen(
              enrollmentId: state.pathParameters['id'] ?? '',
              nodeId: state.pathParameters['nodeId'] ?? '',
            ),
          ),
          GoRoute(
            path: '/quiz-attempts/:id',
            builder: (_, state) => AttemptReviewScreen(
              attemptId: state.pathParameters['id'] ?? '',
            ),
          ),
          GoRoute(
            path: '/notifications',
            builder: (_, __) => const NotificationsScreen(),
          ),
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
          GoRoute(
            path: '/settings',
            builder: (_, __) => const SettingsScreen(),
          ),
          GoRoute(
            path: '/instructor',
            builder: (_, __) => const InstructorShell(),
          ),
          GoRoute(
            path: '/instructor/learners',
            builder: (_, __) => const LearnerListScreen(),
          ),
          GoRoute(
            path: '/instructor/learners/:id',
            builder: (_, state) => LearnerProgressScreen(
              learnerId: state.pathParameters['id'] ?? '',
            ),
          ),
          GoRoute(
            path: '/instructor/analytics',
            builder: (_, __) => const AnalyticsScreen(),
          ),
          GoRoute(
            path: '/instructor/flagged',
            builder: (_, __) => const FlaggedEventsScreen(),
          ),
          GoRoute(path: '/admin', builder: (_, __) => const AdminShell()),
          GoRoute(
            path: '/admin/users',
            builder: (_, __) => const UserManagementScreen(),
          ),
          GoRoute(
            path: '/admin/domains',
            builder: (_, __) => const DomainManagementScreen(),
          ),
          GoRoute(
            path: '/admin/stats',
            builder: (_, __) => const SystemStatsScreen(),
          ),
        ],
      ),
    ],
  );
});
