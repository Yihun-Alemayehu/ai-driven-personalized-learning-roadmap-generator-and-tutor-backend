import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/progress_api.dart';
import '../models/roadmap_data.dart';
import '../models/roadmap_node.dart';

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

// Provider to get a specific node by enrollmentId and nodeId
class NodeLookupParams {
  const NodeLookupParams({required this.enrollmentId, required this.nodeId});

  final String enrollmentId;
  final String nodeId;

  @override
  bool operator ==(Object other) =>
      other is NodeLookupParams &&
      other.enrollmentId == enrollmentId &&
      other.nodeId == nodeId;

  @override
  int get hashCode => Object.hash(enrollmentId, nodeId);
}

final nodeByIdProvider = FutureProvider.family<RoadmapNode?, NodeLookupParams>(
  (ref, params) async {
    debugPrint('[NODE_PROVIDER] Looking up node: ${params.nodeId} in enrollment: ${params.enrollmentId}');

    try {
      final roadmap = await ref.read(roadmapProvider(params.enrollmentId).future);
      final node = roadmap.nodes.firstWhere((n) => n.id == params.nodeId);
      debugPrint('[NODE_PROVIDER] Found node ${node.id}');
      return node;
    } on StateError {
      debugPrint('[NODE_PROVIDER] Node ${params.nodeId} not found in roadmap');
      return null;
    } catch (e) {
      debugPrint('[NODE_PROVIDER] Error looking up node: $e');
      return null;
    }
  },
);

// Provider to track node completion status
final nodeProgressProvider = AsyncNotifierProvider.family<NodeProgressNotifier, Map<String, bool>, String>(
  NodeProgressNotifier.new,
);

class NodeProgressNotifier extends FamilyAsyncNotifier<Map<String, bool>, String> {
  @override
  Future<Map<String, bool>> build(String enrollmentId) async {
    // Load completed nodes from API/storage
    return <String, bool>{};
  }

  Future<void> toggleComplete(String nodeId) async {
    final current = state.valueOrNull ?? <String, bool>{};
    final isCompleted = current[nodeId] ?? false;

    final updated = Map<String, bool>.from(current);
    updated[nodeId] = !isCompleted;

    state = AsyncData(updated);

    // Call API to update progress
    try {
      final api = ref.read(progressApiProvider);
      if (!isCompleted) {
        await api.completeNode(arg, nodeId);
      } else {
        await api.resetNode(arg, nodeId);
      }
    } catch (e) {
      // Revert on error
      final reverted = Map<String, bool>.from(current);
      state = AsyncData(reverted);
      debugPrint('[NODE_PROGRESS] Error toggling completion: $e');
    }
  }
}
