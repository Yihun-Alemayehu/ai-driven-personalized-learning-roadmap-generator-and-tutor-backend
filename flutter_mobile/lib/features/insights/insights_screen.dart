import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/insights_provider.dart';
import '../../widgets/loading_shimmer.dart';
import 'widgets/activity_heatmap.dart';
import 'widgets/profile_card.dart';
import 'widgets/velocity_card.dart';
import 'widgets/weak_areas_panel.dart';

/// Insights dashboard screen for an enrollment
class InsightsScreen extends ConsumerWidget {
  final String enrollmentId;

  const InsightsScreen({required this.enrollmentId, super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final insightsAsync = ref.watch(insightsProvider(enrollmentId));
    final activityAsync = ref.watch(activityProvider(enrollmentId));

    return insightsAsync.when(
      loading: () => const LoadingShimmer(),
      error: (_, __) => _buildErrorState(ref),
      data: (insights) {
        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(insightsProvider(enrollmentId));
            ref.invalidate(activityProvider(enrollmentId));
          },
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Profile Card
                ProfileCard(
                  profile: insights.profile,
                  domainName: 'Learning Progress',
                ),
                const SizedBox(height: 16),

                // Activity Heatmap
                activityAsync.when(
                  loading: () => const Card(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: Center(child: CircularProgressIndicator()),
                    ),
                  ),
                  error: (_, __) => const SizedBox.shrink(),
                  data: (days) => ActivityHeatmap(days: days),
                ),
                const SizedBox(height: 16),

                // Velocity
                VelocityCard(velocity: insights.velocity),
                const SizedBox(height: 16),

                // Weak Areas
                WeakAreasPanel(
                  weakAreas: insights.weakAreas,
                  onNodeTap: (nodeId) {
                    // Navigate to node detail
                    // context.push('/enrollments/$enrollmentId/learn/$nodeId');
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildErrorState(WidgetRef ref) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 48, color: Colors.grey),
          const SizedBox(height: 16),
          const Text('Failed to load insights'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              ref.invalidate(insightsProvider(enrollmentId));
            },
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}
