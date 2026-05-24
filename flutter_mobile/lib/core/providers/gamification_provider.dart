import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/gamification_api.dart';
import '../models/gamification_models.dart';

/// Provider for GamificationApi instance
final gamificationApiProvider = Provider<GamificationApi>(
  (ref) => GamificationApi(ref.watch(apiClientProvider).dio),
);

/// Provider for gamification summary
final gamificationProvider = FutureProvider<GamificationSummary>(
  (ref) async {
    final api = ref.watch(gamificationApiProvider);
    return api.getGamification();
  },
);

/// Provider for earned badges only
final earnedBadgesProvider = Provider<AsyncValue<List<BadgeMeta>>>(
  (ref) {
    final gamification = ref.watch(gamificationProvider);
    return gamification.when(
      data: (g) => AsyncValue.data(g.badges.earned),
      loading: () => const AsyncValue.loading(),
      error: (e, s) => AsyncValue.error(e, s),
    );
  },
);

/// Provider for all badges (earned + unearned)
final allBadgesProvider = Provider<AsyncValue<List<BadgeMeta>>>(
  (ref) {
    final gamification = ref.watch(gamificationProvider);
    return gamification.when(
      data: (g) => AsyncValue.data(g.badges.all),
      loading: () => const AsyncValue.loading(),
      error: (e, s) => AsyncValue.error(e, s),
    );
  },
);

/// Provider for streak info
final streakProvider = Provider<AsyncValue<StreakInfo>>(
  (ref) {
    final gamification = ref.watch(gamificationProvider);
    return gamification.when(
      data: (g) => AsyncValue.data(g.streak),
      loading: () => const AsyncValue.loading(),
      error: (e, s) => AsyncValue.error(e, s),
    );
  },
);

/// Provider for XP info
final xpProvider = Provider<AsyncValue<XpInfo>>(
  (ref) {
    final gamification = ref.watch(gamificationProvider);
    return gamification.when(
      data: (g) => AsyncValue.data(g.xp),
      loading: () => const AsyncValue.loading(),
      error: (e, s) => AsyncValue.error(e, s),
    );
  },
);

/// Provider for weekly goal
final weeklyGoalProvider = Provider<AsyncValue<WeeklyGoal>>(
  (ref) {
    final gamification = ref.watch(gamificationProvider);
    return gamification.when(
      data: (g) => AsyncValue.data(g.weeklyGoal),
      loading: () => const AsyncValue.loading(),
      error: (e, s) => AsyncValue.error(e, s),
    );
  },
);
