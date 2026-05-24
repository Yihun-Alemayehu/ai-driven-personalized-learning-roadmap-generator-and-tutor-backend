import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/admin_api.dart';
import '../api/api_client.dart';
import '../models/admin_models.dart';

/// Provider for AdminApi instance
final adminApiProvider = Provider<AdminApi>(
  (ref) => AdminApi(ref.watch(apiClientProvider).dio),
);

/// Provider for system stats (placeholder - endpoint not available)
final systemStatsProvider = FutureProvider<SystemStats>(
  (ref) async => const SystemStats(
    totalUsers: 0,
    totalEnrollments: 0,
    totalQuizAttempts: 0,
    avgQuizScore: 0,
  ),
);

/// Provider for mastery breakdown (placeholder - endpoint not available)
final masteryBreakdownProvider = FutureProvider<MasteryBreakdown>(
  (ref) async => const MasteryBreakdown(
    unknownCount: 0,
    noviceCount: 0,
    familiarCount: 0,
    proficientCount: 0,
    masteredCount: 0,
  ),
);

/// Provider for domain stats (placeholder - endpoint not available)
final domainStatsProvider = FutureProvider<List<DomainStat>>(
  (ref) async => [],
);

/// Provider for admin domains
final adminDomainsProvider = FutureProvider<List<AdminDomain>>(
  (ref) async {
    final api = ref.watch(adminApiProvider);
    return api.getDomains();
  },
);

/// Provider for users list with optional role filter
final adminUsersProvider = FutureProvider.family<List<AdminUser>, String?>(
  (ref, role) async {
    final api = ref.watch(adminApiProvider);
    return api.getUsers(role: role);
  },
);

/// Notifier for managing admin users
class AdminUsersNotifier extends AsyncNotifier<List<AdminUser>> {
  String? _currentRoleFilter;

  @override
  Future<List<AdminUser>> build() async {
    _currentRoleFilter = null;
    final api = ref.read(adminApiProvider);
    return api.getUsers();
  }

  Future<void> setRoleFilter(String? role) async {
    _currentRoleFilter = role;
    state = const AsyncLoading();
    try {
      final api = ref.read(adminApiProvider);
      state = AsyncData(await api.getUsers(role: role));
    } catch (e, stack) {
      state = AsyncError(e, stack);
    }
  }

  Future<void> updateUserRole({
    required String userId,
    required String role,
  }) async {
    try {
      final api = ref.read(adminApiProvider);
      await api.updateUserRole(userId: userId, role: role);
      // Refresh the list
      state = AsyncData(await api.getUsers(role: _currentRoleFilter));
    } catch (e, stack) {
      state = AsyncError(e, stack);
    }
  }

  Future<void> deleteUser(String userId) async {
    try {
      final api = ref.read(adminApiProvider);
      await api.deleteUser(userId);
      // Refresh the list
      state = AsyncData(await api.getUsers(role: _currentRoleFilter));
    } catch (e, stack) {
      state = AsyncError(e, stack);
    }
  }

  void refresh() {
    ref.invalidateSelf();
  }
}

/// Provider for admin users with actions
final adminUsersNotifierProvider =
    AsyncNotifierProvider<AdminUsersNotifier, List<AdminUser>>(
  AdminUsersNotifier.new,
);

/// Notifier for managing domains
class AdminDomainsNotifier extends AsyncNotifier<List<AdminDomain>> {
  @override
  Future<List<AdminDomain>> build() async {
    final api = ref.read(adminApiProvider);
    return api.getDomains();
  }

  Future<void> createDomain({
    required String name,
    required String slug,
    String? description,
  }) async {
    try {
      final api = ref.read(adminApiProvider);
      await api.createDomain(
        name: name,
        slug: slug,
        description: description,
      );
      // Refresh the list
      state = AsyncData(await api.getDomains());
    } catch (e, stack) {
      state = AsyncError(e, stack);
    }
  }

  Future<void> updateDomain({
    required String domainId,
    String? name,
    String? description,
  }) async {
    try {
      final api = ref.read(adminApiProvider);
      await api.updateDomain(
        domainId: domainId,
        name: name,
        description: description,
      );
      // Refresh the list
      state = AsyncData(await api.getDomains());
    } catch (e, stack) {
      state = AsyncError(e, stack);
    }
  }

  void refresh() {
    ref.invalidateSelf();
  }
}

/// Provider for domains with actions
final adminDomainsNotifierProvider =
    AsyncNotifierProvider<AdminDomainsNotifier, List<AdminDomain>>(
  AdminDomainsNotifier.new,
);
