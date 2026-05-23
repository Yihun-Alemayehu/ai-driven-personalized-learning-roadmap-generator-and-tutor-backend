class AttemptResult {
  const AttemptResult({
    required this.id,
    required this.quizId,
    required this.nodeId,
    required this.scorePercent,
    required this.outcome,
    required this.newlyUnlockedNodes,
    required this.masteryChange,
  });

  final String id;
  final String quizId;
  final String nodeId;
  final double scorePercent;
  final String outcome;
  final List<String> newlyUnlockedNodes;
  final MasteryChange masteryChange;

  factory AttemptResult.fromJson(Map<String, dynamic> json) {
    return AttemptResult(
      id: json['id'] as String,
      quizId: json['quizId'] as String,
      nodeId: json['nodeId'] as String,
      scorePercent: (json['scorePercent'] as num).toDouble(),
      outcome: json['outcome'] as String,
      newlyUnlockedNodes: (json['newlyUnlockedNodes'] as List<dynamic>? ?? [])
          .map((e) => e as String)
          .toList(),
      masteryChange: MasteryChange.fromJson(
        json['masteryChange'] as Map<String, dynamic>? ?? {},
      ),
    );
  }
}

class MasteryChange {
  const MasteryChange({
    required this.from,
    required this.to,
  });

  final String from;
  final String to;

  factory MasteryChange.fromJson(Map<String, dynamic> json) {
    return MasteryChange(
      from: json['from'] as String? ?? '',
      to: json['to'] as String? ?? '',
    );
  }
}
