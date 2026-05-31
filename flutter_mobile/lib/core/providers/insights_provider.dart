import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/insights_api.dart';
import '../api/progress_api.dart';
import '../models/insights_models.dart';
import '../models/roadmap_data.dart';

final insightsApiProvider = Provider<InsightsApi>(
  (ref) => InsightsApi(ref.watch(apiClientProvider).dio),
);

final insightsProgressApiProvider = Provider<ProgressApi>(
  (ref) => ProgressApi(ref.watch(apiClientProvider).dio),
);

final insightsProvider = FutureProvider.family<LearningInsights, String>(
  (ref, enrollmentId) async {
    final api = ref.watch(insightsApiProvider);
    return api.getInsights(enrollmentId);
  },
);

final activityProvider = FutureProvider.family<List<ActivityDay>, String>(
  (ref, enrollmentId) async {
    final api = ref.watch(insightsApiProvider);
    return api.getActivity(enrollmentId);
  },
);

final insightsProgressStatsProvider =
    FutureProvider.family<ProgressStats, String>(
  (ref, enrollmentId) async {
    final api = ref.watch(insightsProgressApiProvider);
    return api.getProgressStats(enrollmentId);
  },
);

final timelineEstimateProvider =
    FutureProvider.family<TimelineEstimate, String>(
  (ref, enrollmentId) async {
    final api = ref.watch(insightsApiProvider);
    return api.getTimeline(enrollmentId);
  },
);

final globalInsightsProvider = FutureProvider<GlobalInsights>(
  (ref) async {
    final api = ref.watch(insightsApiProvider);
    return api.getGlobalInsights();
  },
);

final globalActivityProvider = FutureProvider<List<ActivityDay>>(
  (ref) async {
    final api = ref.watch(insightsApiProvider);
    return api.getGlobalActivity();
  },
);
