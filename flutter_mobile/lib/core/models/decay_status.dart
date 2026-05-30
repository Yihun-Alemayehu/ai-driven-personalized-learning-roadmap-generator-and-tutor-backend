class DecayNodeStatus {
  const DecayNodeStatus({
    required this.nodeId,
    required this.title,
    required this.masteryState,
    this.slug = '',
    this.daysSinceReview,
    this.decayThresholdDays,
    this.daysUntilDecay,
  });

  final String nodeId;
  final String title;
  final String slug;
  final String masteryState;
  final int? daysSinceReview;
  final int? decayThresholdDays;
  final int? daysUntilDecay;

  bool get isRelearn => masteryState == 'relearn';
  bool get isReviewNeeded => masteryState == 'review_needed';
  bool get isMastered => masteryState == 'mastered';

  factory DecayNodeStatus.fromJson(Map<String, dynamic> json) {
    final daysRaw = json['daysSinceReview'];
    return DecayNodeStatus(
      nodeId: (json['nodeId'] as String?) ?? '',
      title: (json['title'] as String?) ?? '',
      slug: (json['slug'] as String?) ?? '',
      masteryState: (json['masteryState'] as String?) ?? '',
      daysSinceReview: daysRaw is num ? daysRaw.toInt() : null,
      decayThresholdDays: (json['decayThresholdDays'] as num?)?.toInt(),
      daysUntilDecay: (json['daysUntilDecay'] as num?)?.toInt(),
    );
  }
}

/// GET /enrollments/:id/decay-status → `{ decayStatus: DecayNodeStatus[] }`
class DecayStatus {
  const DecayStatus({
    required this.enrollmentId,
    required this.nodes,
  });

  final String enrollmentId;
  final List<DecayNodeStatus> nodes;

  int get totalDecayCount => nodes.length;

  List<DecayNodeStatus> get reviewNeededNodes =>
      nodes.where((n) => n.isReviewNeeded).toList();

  List<DecayNodeStatus> get relearnNodes =>
      nodes.where((n) => n.isRelearn).toList();

  /// Nodes that need attention (matches web DecayStatusPanel list).
  List<DecayNodeStatus> get alertNodes => nodes.where((n) {
        if (n.isReviewNeeded || n.isRelearn) return true;
        if (n.isMastered) return true;
        return false;
      }).toList();

  factory DecayStatus.fromJson(
    Map<String, dynamic> json, {
    String enrollmentId = '',
  }) {
    final raw = json['decayStatus'] as List<dynamic>? ??
        json['nodes'] as List<dynamic>? ??
        <dynamic>[];

    return DecayStatus(
      enrollmentId: (json['enrollmentId'] as String?) ?? enrollmentId,
      nodes: raw
          .map((e) => DecayNodeStatus.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
