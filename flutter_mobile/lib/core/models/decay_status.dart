class DecayNodeStatus {
  const DecayNodeStatus({
    required this.nodeId,
    required this.title,
    required this.masteryState,
    required this.daysSinceReview,
    required this.decayLevel,
  });

  final String nodeId;
  final String title;
  final String masteryState; // 'review_needed' or 'relearn'
  final int daysSinceReview;
  final double decayLevel; // 0.0 to 1.0

  factory DecayNodeStatus.fromJson(Map<String, dynamic> json) {
    return DecayNodeStatus(
      nodeId: (json['nodeId'] as String?) ?? '',
      title: (json['title'] as String?) ?? '',
      masteryState: (json['masteryState'] as String?) ?? '',
      daysSinceReview: json['daysSinceReview'] as int? ?? 0,
      decayLevel: (json['decayLevel'] as num?)?.toDouble() ?? 0.0,
    );
  }

  bool get needsReview => masteryState == 'review_needed' || masteryState == 'relearn';
}

class DecayStatus {
  const DecayStatus({
    required this.enrollmentId,
    required this.nodes,
    required this.totalDecayCount,
  });

  final String enrollmentId;
  final List<DecayNodeStatus> nodes;
  final int totalDecayCount;

  List<DecayNodeStatus> get reviewNeededNodes =>
      nodes.where((n) => n.masteryState == 'review_needed').toList();

  List<DecayNodeStatus> get relearnNodes =>
      nodes.where((n) => n.masteryState == 'relearn').toList();

  factory DecayStatus.fromJson(Map<String, dynamic> json) {
    return DecayStatus(
      enrollmentId: (json['enrollmentId'] as String?) ?? '',
      nodes: (json['nodes'] as List<dynamic>? ?? [])
          .map((e) => DecayNodeStatus.fromJson(e as Map<String, dynamic>))
          .toList(),
      totalDecayCount: json['totalDecayCount'] as int? ?? 0,
    );
  }
}
