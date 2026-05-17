import 'roadmap_edge.dart';
import 'roadmap_node.dart';

class RoadmapData {
  const RoadmapData({
    required this.nodes,
    required this.edges,
    required this.selectedBranchPath,
  });

  final List<RoadmapNode> nodes;
  final List<RoadmapEdge> edges;
  final String? selectedBranchPath;

  factory RoadmapData.fromJson(Map<String, dynamic> json) {
    return RoadmapData(
      nodes: (json['nodes'] as List<dynamic>? ?? <dynamic>[])
          .map((item) => RoadmapNode.fromJson(item as Map<String, dynamic>))
          .toList(),
      edges: (json['edges'] as List<dynamic>? ?? <dynamic>[])
          .map((item) => RoadmapEdge.fromJson(item as Map<String, dynamic>))
          .toList(),
      selectedBranchPath: json['selectedBranchPath'] as String?,
    );
  }
}

class ProgressStats {
  const ProgressStats({
    required this.masteredCount,
    required this.inProgressCount,
    required this.reviewNeededCount,
    required this.notStartedCount,
    required this.relearnCount,
    required this.lockedCount,
    required this.totalNodes,
    required this.completionPercent,
    required this.unlockedNodes,
    required this.avgQuizScore,
  });

  final int masteredCount;
  final int inProgressCount;
  final int reviewNeededCount;
  final int notStartedCount;
  final int relearnCount;
  final int lockedCount;
  final int totalNodes;
  final int completionPercent;
  final int unlockedNodes;
  final double? avgQuizScore;

  factory ProgressStats.fromApi(Map<String, dynamic> json) {
    final stats = (json['stats'] as Map<String, dynamic>?) ?? json;
    final byState =
        (stats['byState'] as Map<String, dynamic>?) ?? <String, dynamic>{};

    final totalNodes = (stats['totalNodes'] as num?)?.toInt() ?? 0;
    final notStarted = (byState['not_started'] as num?)?.toInt() ?? 0;
    final inProgress = (byState['in_progress'] as num?)?.toInt() ?? 0;
    final mastered = (byState['mastered'] as num?)?.toInt() ?? 0;
    final reviewNeeded = (byState['review_needed'] as num?)?.toInt() ?? 0;
    final relearn = (byState['relearn'] as num?)?.toInt() ?? 0;
    final counted = notStarted + inProgress + mastered + reviewNeeded + relearn;

    return ProgressStats(
      masteredCount: mastered,
      inProgressCount: inProgress,
      reviewNeededCount: reviewNeeded,
      notStartedCount: notStarted,
      relearnCount: relearn,
      lockedCount: (totalNodes - counted).clamp(0, totalNodes),
      totalNodes: totalNodes,
      completionPercent: (stats['completionPercent'] as num?)?.toInt() ?? 0,
      unlockedNodes: (stats['unlockedNodes'] as num?)?.toInt() ?? 0,
      avgQuizScore: (stats['avgQuizScore'] as num?)?.toDouble(),
    );
  }
}
