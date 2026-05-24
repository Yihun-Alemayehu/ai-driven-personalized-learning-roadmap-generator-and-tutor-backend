import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/gamification_provider.dart';
import '../../widgets/loading_shimmer.dart';
import 'widgets/badge_grid.dart';
import 'widgets/streak_badge.dart';
import 'widgets/weekly_goal_card.dart';
import 'widgets/xp_bar.dart';
import 'widgets/xp_events_list.dart';

/// Main achievements/gamification screen
class AchievementsScreen extends ConsumerWidget {
  const AchievementsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final gamificationAsync = ref.watch(gamificationProvider);

    return gamificationAsync.when(
      loading: () => const LoadingShimmer(),
      error: (_, __) => _buildErrorState(ref),
      data: (gamification) {
        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(gamificationProvider);
          },
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // XP Bar
                XpBar(xp: gamification.xp),
                const SizedBox(height: 20),

                // Streak
                StreakBadge(streak: gamification.streak.current),
                const SizedBox(height: 20),

                // Weekly Goal
                WeeklyGoalCard(goal: gamification.weeklyGoal),
                const SizedBox(height: 24),

                // Badges Section
                _buildSectionHeader(context, 'Badges'),
                const SizedBox(height: 16),
                BadgeGrid(badges: gamification.badges.all),
                const SizedBox(height: 24),

                // Recent Activity Section
                _buildSectionHeader(context, 'Recent Activity'),
                const SizedBox(height: 16),
                XpEventsList(events: gamification.recentXpEvents),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleLarge?.copyWith(
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildErrorState(WidgetRef ref) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 48, color: Colors.grey),
          const SizedBox(height: 16),
          const Text('Failed to load achievements'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              ref.invalidate(gamificationProvider);
            },
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}
