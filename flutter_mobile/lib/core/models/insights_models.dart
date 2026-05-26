import 'package:flutter/material.dart';

/// Complete insights data for an enrollment
class InsightsData {
  final ProfileStats profile;
  final List<WeakArea> weakAreas;
  final VelocityStats velocity;
  final List<Achievement> topAchievements;

  const InsightsData({
    required this.profile,
    required this.weakAreas,
    required this.velocity,
    required this.topAchievements,
  });

  factory InsightsData.fromJson(Map<String, dynamic> json) {
    return InsightsData(
      profile: ProfileStats.fromJson(json['profile'] as Map<String, dynamic>? ?? {}),
      weakAreas: (json['weakAreas'] as List<dynamic>?)
          ?.map((e) => WeakArea.fromJson(e as Map<String, dynamic>))
          .toList() ??
          [],
      velocity: VelocityStats.fromJson(json['velocity'] as Map<String, dynamic>? ?? {}),
      topAchievements: (json['topAchievements'] as List<dynamic>?)
          ?.map((e) => Achievement.fromJson(e as Map<String, dynamic>))
          .toList() ??
          [],
    );
  }
}

/// Profile statistics for the enrollment
class ProfileStats {
  final int totalNodes;
  final int masteredNodes;
  final int inProgressNodes;
  final double averageMastery;
  final double completionPercentage;

  const ProfileStats({
    required this.totalNodes,
    required this.masteredNodes,
    required this.inProgressNodes,
    required this.averageMastery,
    required this.completionPercentage,
  });

  factory ProfileStats.fromJson(Map<String, dynamic> json) {
    return ProfileStats(
      totalNodes: (json['totalNodes'] as num?)?.toInt() ?? 0,
      masteredNodes: (json['masteredNodes'] as num?)?.toInt() ?? 0,
      inProgressNodes: (json['inProgressNodes'] as num?)?.toInt() ?? 0,
      averageMastery: (json['averageMastery'] as num?)?.toDouble() ?? 0.0,
      completionPercentage: (json['completionPercentage'] as num?)?.toDouble() ?? 0.0,
    );
  }

  int get notStartedNodes => totalNodes - masteredNodes - inProgressNodes;
}

/// Weak area that needs attention
class WeakArea {
  final String nodeId;
  final String nodeTitle;
  final String masteryState;
  final int failCount;
  final DateTime lastAttemptAt;

  const WeakArea({
    required this.nodeId,
    required this.nodeTitle,
    required this.masteryState,
    required this.failCount,
    required this.lastAttemptAt,
  });

  factory WeakArea.fromJson(Map<String, dynamic> json) {
    final lastAttemptStr = json['lastAttemptAt'] as String?;
    return WeakArea(
      nodeId: (json['nodeId'] as String?) ?? '',
      nodeTitle: (json['nodeTitle'] as String?) ?? 'Unknown',
      masteryState: (json['masteryState'] as String?) ?? 'unknown',
      failCount: (json['failCount'] as num?)?.toInt() ?? 0,
      lastAttemptAt: lastAttemptStr != null 
        ? DateTime.tryParse(lastAttemptStr) ?? DateTime.now()
        : DateTime.now(),
    );
  }

  bool get needsAttention => failCount >= 2 || masteryState == 'relearn';
}

/// Learning velocity statistics
class VelocityStats {
  final double nodesPerWeek;
  final double quizzesPerWeek;
  final String trend; // 'improving', 'stable', 'declining'

  const VelocityStats({
    required this.nodesPerWeek,
    required this.quizzesPerWeek,
    required this.trend,
  });

  factory VelocityStats.fromJson(Map<String, dynamic> json) {
    return VelocityStats(
      nodesPerWeek: (json['nodesPerWeek'] as num?)?.toDouble() ?? 0.0,
      quizzesPerWeek: (json['quizzesPerWeek'] as num?)?.toDouble() ?? 0.0,
      trend: (json['trend'] as String?) ?? 'stable',
    );
  }

  bool get isImproving => trend == 'improving';
  bool get isDeclining => trend == 'declining';
  bool get isStable => trend == 'stable';
}

/// Achievement in insights context
class Achievement {
  final String type;
  final String title;
  final String description;
  final DateTime earnedAt;

  const Achievement({
    required this.type,
    required this.title,
    required this.description,
    required this.earnedAt,
  });

  factory Achievement.fromJson(Map<String, dynamic> json) {
    final earnedAtStr = json['earnedAt'] as String?;
    return Achievement(
      type: (json['type'] as String?) ?? 'unknown',
      title: (json['title'] as String?) ?? '',
      description: (json['description'] as String?) ?? '',
      earnedAt: earnedAtStr != null 
        ? DateTime.tryParse(earnedAtStr) ?? DateTime.now()
        : DateTime.now(),
    );
  }
}

/// Single day of activity data
class ActivityDay {
  final DateTime date;
  final int xpEarned;
  final int nodesStudied;
  final int quizzesTaken;
  final bool hasActivity;

  const ActivityDay({
    required this.date,
    required this.xpEarned,
    required this.nodesStudied,
    required this.quizzesTaken,
    required this.hasActivity,
  });

  factory ActivityDay.fromJson(Map<String, dynamic> json) {
    final dateStr = json['date'] as String?;
    return ActivityDay(
      date: dateStr != null 
        ? DateTime.tryParse(dateStr) ?? DateTime.now()
        : DateTime.now(),
      xpEarned: (json['xpEarned'] as num?)?.toInt() ?? 0,
      nodesStudied: (json['nodesStudied'] as num?)?.toInt() ?? 0,
      quizzesTaken: (json['quizzesTaken'] as num?)?.toInt() ?? 0,
      hasActivity: (json['hasActivity'] as bool?) ?? false,
    );
  }

  /// Color intensity based on XP earned
  Color getIntensityColor() {
    if (!hasActivity) return Colors.grey[100]!;
    if (xpEarned < 50) return Colors.green[100]!;
    if (xpEarned < 100) return Colors.green[300]!;
    if (xpEarned < 200) return Colors.green[500]!;
    return Colors.green[700]!;
  }
}

/// Progress statistics response
class ProgressStats {
  final int totalNodes;
  final Map<String, int> byState;
  final QuizStats quizStats;

  const ProgressStats({
    required this.totalNodes,
    required this.byState,
    required this.quizStats,
  });

  factory ProgressStats.fromJson(Map<String, dynamic> json) {
    final byStateMap = json['byState'] as Map<String, dynamic>?;
    return ProgressStats(
      totalNodes: (json['totalNodes'] as num?)?.toInt() ?? 0,
      byState: {
        'not_started': (byStateMap?['not_started'] as num?)?.toInt() ?? 0,
        'in_progress': (byStateMap?['in_progress'] as num?)?.toInt() ?? 0,
        'mastered': (byStateMap?['mastered'] as num?)?.toInt() ?? 0,
        'review_needed': (byStateMap?['review_needed'] as num?)?.toInt() ?? 0,
      },
      quizStats: QuizStats.fromJson(json['quizStats'] as Map<String, dynamic>? ?? {}),
    );
  }
}

/// Quiz statistics
class QuizStats {
  final int totalAttempts;
  final double avgScore;
  final int strongPasses;
  final int marginalPasses;
  final int fails;

  const QuizStats({
    required this.totalAttempts,
    required this.avgScore,
    required this.strongPasses,
    required this.marginalPasses,
    required this.fails,
  });

  factory QuizStats.fromJson(Map<String, dynamic> json) {
    return QuizStats(
      totalAttempts: (json['totalAttempts'] as num?)?.toInt() ?? 0,
      avgScore: (json['avgScore'] as num?)?.toDouble() ?? 0.0,
      strongPasses: (json['strongPasses'] as num?)?.toInt() ?? 0,
      marginalPasses: (json['marginalPasses'] as num?)?.toInt() ?? 0,
      fails: (json['fails'] as num?)?.toInt() ?? 0,
    );
  }
}

/// Timeline event
class TimelineEvent {
  final String id;
  final String type;
  final String title;
  final String description;
  final DateTime occurredAt;
  final Map<String, dynamic> metadata;

  const TimelineEvent({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.occurredAt,
    required this.metadata,
  });

  factory TimelineEvent.fromJson(Map<String, dynamic> json) {
    final occurredAtStr = json['occurredAt'] as String?;
    return TimelineEvent(
      id: (json['id'] as String?) ?? '',
      type: (json['type'] as String?) ?? 'unknown',
      title: (json['title'] as String?) ?? '',
      description: (json['description'] as String?) ?? '',
      occurredAt: occurredAtStr != null 
        ? DateTime.tryParse(occurredAtStr) ?? DateTime.now()
        : DateTime.now(),
      metadata: json['metadata'] as Map<String, dynamic>? ?? {},
    );
  }
}
