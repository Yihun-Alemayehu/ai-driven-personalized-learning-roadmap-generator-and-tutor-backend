import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/insights_api.dart';
import '../models/insights_models.dart';

/// Provider for InsightsApi instance
final insightsApiProvider = Provider<InsightsApi>(
  (ref) => InsightsApi(ref.watch(apiClientProvider).dio),
);

/// Provider for insights data (family by enrollmentId)
final insightsProvider = FutureProvider.family<InsightsData, String>(
  (ref, enrollmentId) async {
    final api = ref.watch(insightsApiProvider);
    return api.getInsights(enrollmentId);
  },
);

/// Provider for activity heatmap
final activityProvider = FutureProvider.family<List<ActivityDay>, String>(
  (ref, enrollmentId) async {
    final api = ref.watch(insightsApiProvider);
    return api.getActivity(enrollmentId);
  },
);

/// Provider for progress stats
final progressStatsProvider = FutureProvider.family<ProgressStats, String>(
  (ref, enrollmentId) async {
    final api = ref.watch(insightsApiProvider);
    return api.getProgressStats(enrollmentId);
  },
);

/// Provider for timeline events
final timelineProvider = FutureProvider.family<List<TimelineEvent>, String>(
  (ref, enrollmentId) async {
    final api = ref.watch(insightsApiProvider);
    return api.getTimeline(enrollmentId);
  },
);
