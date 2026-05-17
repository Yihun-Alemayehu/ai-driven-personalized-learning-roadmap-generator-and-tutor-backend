import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/progress_api.dart';
import '../models/roadmap_data.dart';

class RoadmapBundle {
  const RoadmapBundle({required this.roadmap, required this.stats});

  final RoadmapData roadmap;
  final ProgressStats stats;
}

final progressApiProvider = Provider<ProgressApi>(
  (ref) => ProgressApi(ref.watch(apiClientProvider).dio),
);

final roadmapProvider = FutureProvider.family<RoadmapData, String>(
  (ref, enrollmentId) async {
    final api = ref.watch(progressApiProvider);
    return api.getRoadmap(enrollmentId);
  },
);

final progressStatsProvider = FutureProvider.family<ProgressStats, String>(
  (ref, enrollmentId) async {
    final api = ref.watch(progressApiProvider);
    return api.getProgressStats(enrollmentId);
  },
);

final roadmapBundleProvider = FutureProvider.family<RoadmapBundle, String>(
  (ref, enrollmentId) async {
    final api = ref.watch(progressApiProvider);
    final roadmap = await api.getRoadmap(enrollmentId);
    final stats = await api.getProgressStats(enrollmentId);
    return RoadmapBundle(roadmap: roadmap, stats: stats);
  },
);
