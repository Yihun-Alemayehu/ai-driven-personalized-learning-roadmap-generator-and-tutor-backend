/// Gamification summary response from API
class GamificationSummary {
  final XpInfo xp;
  final StreakInfo streak;
  final BadgesInfo badges;
  final WeeklyGoal weeklyGoal;
  final List<XpEvent> recentXpEvents;

  const GamificationSummary({
    required this.xp,
    required this.streak,
    required this.badges,
    required this.weeklyGoal,
    required this.recentXpEvents,
  });

  factory GamificationSummary.fromJson(Map<String, dynamic> json) {
    return GamificationSummary(
      xp: XpInfo.fromJson(json['xp'] as Map<String, dynamic>? ?? {}),
      streak: StreakInfo.fromJson(json['streak'] as Map<String, dynamic>? ?? {}),
      badges: BadgesInfo.fromJson(json['badges'] as Map<String, dynamic>? ?? {}),
      weeklyGoal: WeeklyGoal.fromJson(json['weeklyGoal'] as Map<String, dynamic>? ?? {}),
      recentXpEvents: (json['recentXpEvents'] as List<dynamic>?)
          ?.map((e) => XpEvent.fromJson(e as Map<String, dynamic>))
          .toList() ??
          [],
    );
  }
}

/// XP and level information
class XpInfo {
  final int total;
  final int level;
  final int xpIntoLevel;
  final int xpForNextLevel;
  final double progressPct;

  const XpInfo({
    required this.total,
    required this.level,
    required this.xpIntoLevel,
    required this.xpForNextLevel,
    required this.progressPct,
  });

  factory XpInfo.fromJson(Map<String, dynamic> json) {
    return XpInfo(
      total: (json['total'] as num?)?.toInt() ?? 0,
      level: (json['level'] as num?)?.toInt() ?? 1,
      xpIntoLevel: (json['xpIntoLevel'] as num?)?.toInt() ?? 0,
      xpForNextLevel: (json['xpForNextLevel'] as num?)?.toInt() ?? 200,
      progressPct: (json['progressPct'] as num?)?.toDouble() ?? 0.0,
    );
  }

  /// Calculate progress as 0.0 to 1.0
  double get progress => xpForNextLevel > 0 ? xpIntoLevel / xpForNextLevel : 1.0;
}

/// Streak information
class StreakInfo {
  final int current;

  const StreakInfo({required this.current});

  factory StreakInfo.fromJson(Map<String, dynamic> json) {
    return StreakInfo(
      current: (json['current'] as num?)?.toInt() ?? 0,
    );
  }

  bool get hasStreak => current > 0;
  bool get isLongStreak => current >= 5;
}

/// Badges container
class BadgesInfo {
  final List<BadgeMeta> earned;
  final List<BadgeMeta> all;

  const BadgesInfo({
    required this.earned,
    required this.all,
  });

  factory BadgesInfo.fromJson(Map<String, dynamic> json) {
    return BadgesInfo(
      earned: (json['earned'] as List<dynamic>?)
          ?.map((e) => BadgeMeta.fromJson(e as Map<String, dynamic>))
          .toList() ??
          [],
      all: (json['all'] as List<dynamic>?)
          ?.map((e) => BadgeMeta.fromJson(e as Map<String, dynamic>))
          .toList() ??
          [],
    );
  }
}

/// Badge metadata
class BadgeMeta {
  final String key;
  final String label;
  final String description;
  final String icon;
  final DateTime? earnedAt;

  const BadgeMeta({
    required this.key,
    required this.label,
    required this.description,
    required this.icon,
    this.earnedAt,
  });

  factory BadgeMeta.fromJson(Map<String, dynamic> json) {
    final earnedAtStr = json['earnedAt'] as String?;
    return BadgeMeta(
      key: (json['key'] as String?) ?? '',
      label: (json['label'] as String?) ?? '',
      description: (json['description'] as String?) ?? '',
      icon: (json['icon'] as String?) ?? 'emoji_events',
      earnedAt: earnedAtStr != null ? DateTime.tryParse(earnedAtStr) : null,
    );
  }

  bool get isEarned => earnedAt != null;
}

/// Weekly learning goal
class WeeklyGoal {
  final int target;
  final int progress;
  final double percentDone;
  final String weekLabel;

  const WeeklyGoal({
    required this.target,
    required this.progress,
    required this.percentDone,
    required this.weekLabel,
  });

  factory WeeklyGoal.fromJson(Map<String, dynamic> json) {
    return WeeklyGoal(
      target: (json['target'] as num?)?.toInt() ?? 100,
      progress: (json['progress'] as num?)?.toInt() ?? 0,
      percentDone: (json['percentDone'] as num?)?.toDouble() ?? 0.0,
      weekLabel: (json['weekLabel'] as String?) ?? 'This Week',
    );
  }

  bool get isComplete => percentDone >= 100;
}

/// Single XP earning event
class XpEvent {
  final String source;
  final int amount;
  final DateTime createdAt;

  const XpEvent({
    required this.source,
    required this.amount,
    required this.createdAt,
  });

  factory XpEvent.fromJson(Map<String, dynamic> json) {
    return XpEvent(
      source: (json['source'] as String?) ?? 'unknown',
      amount: (json['amount'] as num?)?.toInt() ?? 0,
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.now(),
    );
  }

  /// Human-readable label for the source
  String get sourceLabel {
    return switch (source) {
      'node_mastered_strong' || 'node_mastered_marginal' => 'Node mastered',
      'quiz_attempt' => 'Quiz attempt',
      'spaced_review' => 'Spaced review',
      'streak_milestone' => 'Streak milestone',
      'enrollment_complete' => 'Course complete',
      _ => 'Activity',
    };
  }
}

/// Level thresholds from backend
const LEVEL_THRESHOLDS = [0, 200, 500, 900, 1400, 2000, 2700, 3500, 4400, 5400];
