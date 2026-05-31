import 'package:flutter/material.dart';

/// GET /enrollments/:id/insights → `{ insights: LearningInsights }`
class LearningInsights {
  const LearningInsights({
    required this.profile,
    required this.weakNodes,
    required this.strugglingNodes,
    required this.topNodes,
    required this.momentum,
    this.avgScore,
  });

  final LearningProfile profile;
  final List<InsightWeakNode> weakNodes;
  final List<StrugglingNode> strugglingNodes;
  final List<TopNode> topNodes;
  final Momentum momentum;
  final double? avgScore;

  factory LearningInsights.fromJson(Map<String, dynamic> json) {
    return LearningInsights(
      profile: LearningProfile.fromJson(
        json['profile'] as Map<String, dynamic>? ?? {},
      ),
      weakNodes: _list(json['weakNodes'], InsightWeakNode.fromJson),
      strugglingNodes: _list(json['strugglingNodes'], StrugglingNode.fromJson),
      topNodes: _list(json['topNodes'], TopNode.fromJson),
      momentum: Momentum.fromJson(
        json['momentum'] as Map<String, dynamic>? ?? {},
      ),
      avgScore: (json['avgScore'] as num?)?.toDouble(),
    );
  }
}

List<T> _list<T>(
  dynamic raw,
  T Function(Map<String, dynamic>) fromJson,
) {
  return (raw as List<dynamic>?)
          ?.map((e) => fromJson(e as Map<String, dynamic>))
          .toList() ??
      [];
}

class LearningProfile {
  const LearningProfile({
    required this.enrolledAt,
    this.familiarityLevel,
    this.learningGoal,
    this.weeklyHours,
    this.aboutSelf,
    this.preferredLearningStyle,
    this.priorSkills,
    this.selectedBranchPath,
    required this.daysSinceEnrollment,
  });

  final DateTime enrolledAt;
  final String? familiarityLevel;
  final String? learningGoal;
  final int? weeklyHours;
  final String? aboutSelf;
  final String? preferredLearningStyle;
  final String? priorSkills;
  final String? selectedBranchPath;
  final int daysSinceEnrollment;

  factory LearningProfile.fromJson(Map<String, dynamic> json) {
    final enrolledRaw = json['enrolledAt'] as String?;
    return LearningProfile(
      enrolledAt: enrolledRaw != null
          ? DateTime.tryParse(enrolledRaw) ?? DateTime.now()
          : DateTime.now(),
      familiarityLevel: json['familiarityLevel'] as String?,
      learningGoal: json['learningGoal'] as String?,
      weeklyHours: (json['weeklyHours'] as num?)?.toInt(),
      aboutSelf: json['aboutSelf'] as String?,
      preferredLearningStyle: json['preferredLearningStyle'] as String?,
      priorSkills: json['priorSkills'] as String?,
      selectedBranchPath: json['selectedBranchPath'] as String?,
      daysSinceEnrollment: (json['daysSinceEnrollment'] as num?)?.toInt() ?? 0,
    );
  }
}

class InsightWeakNode {
  const InsightWeakNode({
    required this.nodeId,
    required this.title,
    required this.masteryState,
    this.lastReviewedAt,
    this.difficultyLevel,
  });

  final String nodeId;
  final String title;
  final String masteryState;
  final DateTime? lastReviewedAt;
  final int? difficultyLevel;

  factory InsightWeakNode.fromJson(Map<String, dynamic> json) {
    final lastRaw = json['lastReviewedAt'] as String?;
    return InsightWeakNode(
      nodeId: (json['nodeId'] as String?) ?? '',
      title: (json['title'] as String?) ?? '',
      masteryState: (json['masteryState'] as String?) ?? '',
      lastReviewedAt:
          lastRaw != null ? DateTime.tryParse(lastRaw) : null,
      difficultyLevel: (json['difficultyLevel'] as num?)?.toInt(),
    );
  }
}

class StrugglingNode {
  const StrugglingNode({
    required this.nodeId,
    required this.title,
    this.bestQuizScore,
    required this.attemptsCount,
    this.difficultyLevel,
  });

  final String nodeId;
  final String title;
  final double? bestQuizScore;
  final int attemptsCount;
  final int? difficultyLevel;

  factory StrugglingNode.fromJson(Map<String, dynamic> json) {
    return StrugglingNode(
      nodeId: (json['nodeId'] as String?) ?? '',
      title: (json['title'] as String?) ?? '',
      bestQuizScore: (json['bestQuizScore'] as num?)?.toDouble(),
      attemptsCount: (json['attemptsCount'] as num?)?.toInt() ?? 0,
      difficultyLevel: (json['difficultyLevel'] as num?)?.toInt(),
    );
  }
}

class TopNode {
  const TopNode({
    required this.nodeId,
    required this.title,
    this.bestQuizScore,
    this.difficultyLevel,
    this.masteredAt,
  });

  final String nodeId;
  final String title;
  final double? bestQuizScore;
  final int? difficultyLevel;
  final DateTime? masteredAt;

  factory TopNode.fromJson(Map<String, dynamic> json) {
    final masteredRaw = json['masteredAt'] as String?;
    return TopNode(
      nodeId: (json['nodeId'] as String?) ?? '',
      title: (json['title'] as String?) ?? '',
      bestQuizScore: (json['bestQuizScore'] as num?)?.toDouble(),
      difficultyLevel: (json['difficultyLevel'] as num?)?.toInt(),
      masteredAt:
          masteredRaw != null ? DateTime.tryParse(masteredRaw) : null,
    );
  }
}

class Momentum {
  const Momentum({
    required this.trend,
    required this.recentMasteries,
    required this.prevMasteries,
  });

  final String trend; // up | down | flat
  final int recentMasteries;
  final int prevMasteries;

  factory Momentum.fromJson(Map<String, dynamic> json) {
    return Momentum(
      trend: (json['trend'] as String?) ?? 'flat',
      recentMasteries: (json['recentMasteries'] as num?)?.toInt() ?? 0,
      prevMasteries: (json['prevMasteries'] as num?)?.toInt() ?? 0,
    );
  }

  bool get isUp => trend == 'up';
  bool get isDown => trend == 'down';
}

class ActivityDay {
  const ActivityDay({
    required this.date,
    required this.count,
    required this.quizzes,
    required this.reviews,
    required this.masteries,
  });

  final String date; // YYYY-MM-DD
  final int count;
  final int quizzes;
  final int reviews;
  final int masteries;

  factory ActivityDay.fromJson(Map<String, dynamic> json) {
    return ActivityDay(
      date: (json['date'] as String?) ?? '',
      count: (json['count'] as num?)?.toInt() ?? 0,
      quizzes: (json['quizzes'] as num?)?.toInt() ?? 0,
      reviews: (json['reviews'] as num?)?.toInt() ?? 0,
      masteries: (json['masteries'] as num?)?.toInt() ?? 0,
    );
  }

  static Color intensityColor(int count) {
    if (count == 0) return const Color(0xFFEBE6DB);
    if (count == 1) return const Color(0xFFB8D4BC);
    if (count == 2) return const Color(0xFF8FB996);
    if (count <= 4) return const Color(0xFF5A9B6A);
    return const Color(0xFF3D7A4E);
  }
}

/// GET /enrollments/:id/timeline → `{ timeline: TimelineEstimate }`
class TimelineEstimate {
  const TimelineEstimate({
    required this.totalHours,
    required this.completedHours,
    required this.remainingHours,
    required this.adjustedRemainingHours,
    required this.weeklyHours,
    this.estimatedWeeksRemaining,
    this.estimatedCompletionDate,
    this.velocityMultiplier,
  });

  final double totalHours;
  final double completedHours;
  final double remainingHours;
  final double adjustedRemainingHours;
  final double weeklyHours;
  final int? estimatedWeeksRemaining;
  final String? estimatedCompletionDate;
  final double? velocityMultiplier;

  factory TimelineEstimate.fromJson(Map<String, dynamic> json) {
    return TimelineEstimate(
      totalHours: (json['totalHours'] as num?)?.toDouble() ?? 0,
      completedHours: (json['completedHours'] as num?)?.toDouble() ?? 0,
      remainingHours: (json['remainingHours'] as num?)?.toDouble() ?? 0,
      adjustedRemainingHours:
          (json['adjustedRemainingHours'] as num?)?.toDouble() ?? 0,
      weeklyHours: (json['weeklyHours'] as num?)?.toDouble() ?? 0,
      estimatedWeeksRemaining:
          (json['estimatedWeeksRemaining'] as num?)?.toInt(),
      estimatedCompletionDate: json['estimatedCompletionDate'] as String?,
      velocityMultiplier: (json['velocityMultiplier'] as num?)?.toDouble(),
    );
  }
}

/// GET /me/insights → `{ insights: GlobalInsights }`
class GlobalInsights {
  const GlobalInsights({
    required this.totalEnrollments,
    required this.enrollmentBreakdowns,
    required this.globalWeakNodes,
    required this.globalTopNodes,
    required this.overallStats,
    required this.momentum,
    required this.streakSummary,
  });

  final int totalEnrollments;
  final List<EnrollmentBreakdown> enrollmentBreakdowns;
  final List<GlobalWeakNode> globalWeakNodes;
  final List<GlobalTopNode> globalTopNodes;
  final OverallStats overallStats;
  final Momentum momentum;
  final StreakSummary streakSummary;

  factory GlobalInsights.fromJson(Map<String, dynamic> json) {
    return GlobalInsights(
      totalEnrollments: (json['totalEnrollments'] as num?)?.toInt() ?? 0,
      enrollmentBreakdowns: _list(
        json['enrollmentBreakdowns'],
        EnrollmentBreakdown.fromJson,
      ),
      globalWeakNodes: _list(
        json['globalWeakNodes'],
        GlobalWeakNode.fromJson,
      ),
      globalTopNodes: _list(json['globalTopNodes'], GlobalTopNode.fromJson),
      overallStats: OverallStats.fromJson(
        json['overallStats'] as Map<String, dynamic>? ?? {},
      ),
      momentum: Momentum.fromJson(
        json['momentum'] as Map<String, dynamic>? ?? {},
      ),
      streakSummary: StreakSummary.fromJson(
        json['streakSummary'] as Map<String, dynamic>? ?? {},
      ),
    );
  }
}

class OverallStats {
  const OverallStats({
    required this.totalNodes,
    required this.masteredNodes,
    required this.completionPercent,
    this.avgScore,
  });

  final int totalNodes;
  final int masteredNodes;
  final double completionPercent;
  final double? avgScore;

  factory OverallStats.fromJson(Map<String, dynamic> json) {
    return OverallStats(
      totalNodes: (json['totalNodes'] as num?)?.toInt() ?? 0,
      masteredNodes: (json['masteredNodes'] as num?)?.toInt() ?? 0,
      completionPercent:
          (json['completionPercent'] as num?)?.toDouble() ?? 0,
      avgScore: (json['avgScore'] as num?)?.toDouble(),
    );
  }
}

class StreakSummary {
  const StreakSummary({required this.currentStreak});

  final int currentStreak;

  factory StreakSummary.fromJson(Map<String, dynamic> json) {
    return StreakSummary(
      currentStreak: (json['currentStreak'] as num?)?.toInt() ?? 0,
    );
  }
}

class EnrollmentBreakdown {
  const EnrollmentBreakdown({
    required this.enrollmentId,
    required this.domainName,
    required this.domainSlug,
    required this.completionPercent,
    required this.masteredNodes,
    required this.totalNodes,
    this.avgScore,
    this.lastActiveAt,
    required this.enrolledAt,
    this.selectedBranchPath,
  });

  final String enrollmentId;
  final String domainName;
  final String domainSlug;
  final double completionPercent;
  final int masteredNodes;
  final int totalNodes;
  final double? avgScore;
  final DateTime? lastActiveAt;
  final DateTime enrolledAt;
  final String? selectedBranchPath;

  factory EnrollmentBreakdown.fromJson(Map<String, dynamic> json) {
    final domain = json['domain'] as Map<String, dynamic>?;
    final lastRaw = json['lastActiveAt'] as String?;
    final enrolledRaw = json['enrolledAt'] as String?;

    return EnrollmentBreakdown(
      enrollmentId: (json['enrollmentId'] as String?) ?? '',
      domainName: (domain?['name'] as String?) ??
          (json['domainName'] as String?) ??
          'Unknown',
      domainSlug: (domain?['slug'] as String?) ??
          (json['domainSlug'] as String?) ??
          '',
      completionPercent:
          (json['completionPercent'] as num?)?.toDouble() ?? 0,
      masteredNodes: (json['masteredNodes'] as num?)?.toInt() ?? 0,
      totalNodes: (json['totalNodes'] as num?)?.toInt() ?? 0,
      avgScore: (json['avgScore'] as num?)?.toDouble(),
      lastActiveAt: lastRaw != null ? DateTime.tryParse(lastRaw) : null,
      enrolledAt: enrolledRaw != null
          ? DateTime.tryParse(enrolledRaw) ?? DateTime.now()
          : DateTime.now(),
      selectedBranchPath: json['selectedBranchPath'] as String?,
    );
  }
}

class GlobalWeakNode {
  const GlobalWeakNode({
    required this.nodeId,
    required this.title,
    required this.enrollmentId,
    required this.domainName,
    required this.masteryState,
    this.difficultyLevel,
  });

  final String nodeId;
  final String title;
  final String enrollmentId;
  final String domainName;
  final String masteryState;
  final int? difficultyLevel;

  factory GlobalWeakNode.fromJson(Map<String, dynamic> json) {
    return GlobalWeakNode(
      nodeId: (json['nodeId'] as String?) ?? '',
      title: (json['title'] as String?) ?? '',
      enrollmentId: (json['enrollmentId'] as String?) ?? '',
      domainName: (json['domainName'] as String?) ?? 'Unknown',
      masteryState: (json['masteryState'] as String?) ?? '',
      difficultyLevel: (json['difficultyLevel'] as num?)?.toInt(),
    );
  }
}

class GlobalTopNode {
  const GlobalTopNode({
    required this.nodeId,
    required this.title,
    this.bestQuizScore,
    this.difficultyLevel,
    this.masteredAt,
  });

  final String nodeId;
  final String title;
  final double? bestQuizScore;
  final int? difficultyLevel;
  final DateTime? masteredAt;

  factory GlobalTopNode.fromJson(Map<String, dynamic> json) {
    final masteredRaw = json['masteredAt'] as String?;
    return GlobalTopNode(
      nodeId: (json['nodeId'] as String?) ?? '',
      title: (json['title'] as String?) ?? '',
      bestQuizScore: (json['bestQuizScore'] as num?)?.toDouble(),
      difficultyLevel: (json['difficultyLevel'] as num?)?.toInt(),
      masteredAt:
          masteredRaw != null ? DateTime.tryParse(masteredRaw) : null,
    );
  }
}
