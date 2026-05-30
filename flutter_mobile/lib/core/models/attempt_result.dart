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
    // API: { attempt: { id, scorePercent, ... }, gatekeeper: { tier, newlyUnlockedNodes, ... } }
    final attempt = json['attempt'] as Map<String, dynamic>? ?? json;
    final gatekeeper = json['gatekeeper'] as Map<String, dynamic>? ?? {};

    return AttemptResult(
      id: (attempt['id'] as String?) ?? '',
      quizId: (json['quizId'] as String?) ?? (attempt['quizId'] as String?) ?? '',
      nodeId: (json['nodeId'] as String?) ?? (attempt['nodeId'] as String?) ?? '',
      scorePercent: (attempt['scorePercent'] as num?)?.toDouble() ?? 0.0,
      outcome: (gatekeeper['tier'] as String?) ?? (json['outcome'] as String?) ?? '',
      newlyUnlockedNodes:
          (gatekeeper['newlyUnlockedNodes'] as List<dynamic>? ??
                  json['newlyUnlockedNodes'] as List<dynamic>? ??
                  <dynamic>[])
              .map((e) => e as String? ?? '')
              .toList(),
      masteryChange: MasteryChange.fromJson(
        json['masteryChange'] as Map<String, dynamic>? ??
            <String, dynamic>{
              'to': gatekeeper['newMasteryState'],
            },
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
