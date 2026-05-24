/// Instructor enrollment with learner info
class InstructorEnrollment {
  final String id;
  final String userId;
  final String fullName;
  final String email;
  final String domainName;
  final int nodeProgressCount;

  const InstructorEnrollment({
    required this.id,
    required this.userId,
    required this.fullName,
    required this.email,
    required this.domainName,
    required this.nodeProgressCount,
  });

  factory InstructorEnrollment.fromJson(Map<String, dynamic> json) {
    // Parse nested user and domain objects from API
    final user = json['user'] as Map<String, dynamic>?;
    final domain = json['domain'] as Map<String, dynamic>?;
    final count = json['_count'] as Map<String, dynamic>?;

    return InstructorEnrollment(
      id: (json['id'] as String?) ?? '',
      userId: (user?['id'] as String?) ?? '',
      fullName: (user?['fullName'] as String?) ?? '',
      email: (user?['email'] as String?) ?? '',
      domainName: (domain?['name'] as String?) ?? '',
      nodeProgressCount: (count?['nodeProgress'] as num?)?.toInt() ?? 0,
    );
  }
}

/// Analytics for a specific node
class NodeAnalytic {
  final String nodeId;
  final String nodeTitle;
  final double masteryRate;
  final int enrollmentCount;

  const NodeAnalytic({
    required this.nodeId,
    required this.nodeTitle,
    required this.masteryRate,
    required this.enrollmentCount,
  });

  factory NodeAnalytic.fromJson(Map<String, dynamic> json) {
    return NodeAnalytic(
      nodeId: (json['nodeId'] as String?) ?? '',
      nodeTitle: (json['nodeTitle'] as String?) ?? '',
      masteryRate: ((json['masteryRate'] as num?) ?? 0).toDouble(),
      enrollmentCount: (json['enrollmentCount'] as num?)?.toInt() ?? 0,
    );
  }
}

/// Domain analytics response
class DomainAnalytics {
  final List<NodeAnalytic> nodes;
  final double overallMasteryRate;
  final int enrollmentCount;

  const DomainAnalytics({
    required this.nodes,
    required this.overallMasteryRate,
    required this.enrollmentCount,
  });

  factory DomainAnalytics.fromJson(Map<String, dynamic> json) {
    final nodes = (json['nodes'] as List<dynamic>?)
            ?.map((e) => NodeAnalytic.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    return DomainAnalytics(
      nodes: nodes,
      overallMasteryRate: ((json['masteryRate'] as num?) ?? 0).toDouble(),
      enrollmentCount: (json['enrollmentCount'] as num?)?.toInt() ?? 0,
    );
  }
}

/// Flagged event for learner struggle
class FlaggedEvent {
  final String id;
  final String userId;
  final String userName;
  final String nodeTitle;
  final String adaptationType;
  final int failCount;
  final DateTime createdAt;
  final bool isResolved;
  final String? resolutionNotes;

  const FlaggedEvent({
    required this.id,
    required this.userId,
    required this.userName,
    required this.nodeTitle,
    required this.adaptationType,
    required this.failCount,
    required this.createdAt,
    required this.isResolved,
    this.resolutionNotes,
  });

  factory FlaggedEvent.fromJson(Map<String, dynamic> json) {
    // Parse from nested objects
    final user = json['user'] as Map<String, dynamic>?;
    final node = json['node'] as Map<String, dynamic>?;
    final details = json['details'] as Map<String, dynamic>?;

    return FlaggedEvent(
      id: (json['id'] as String?) ?? '',
      userId: (json['userId'] as String?) ?? '',
      userName: (user?['fullName'] as String?) ?? '',
      nodeTitle: (node?['title'] as String?) ?? '',
      adaptationType: (json['adaptationType'] as String?) ?? '',
      failCount: (details?['failCount'] as num?)?.toInt() ?? 0,
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
      isResolved: (details?['resolved'] as bool?) ?? false,
      resolutionNotes: details?['resolutionNotes'] as String?,
    );
  }
}

/// Learner progress detail (single enrollment)
class LearnerProgress {
  final String enrollmentId;
  final String domainId;
  final String domainName;
  final List<NodeProgressDetail> nodeProgress;

  const LearnerProgress({
    required this.enrollmentId,
    required this.domainId,
    required this.domainName,
    required this.nodeProgress,
  });

  factory LearnerProgress.fromJson(Map<String, dynamic> json) {
    final domain = json['domain'] as Map<String, dynamic>?;
    final progressList = (json['nodeProgress'] as List<dynamic>?)
            ?.map((e) => NodeProgressDetail.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    return LearnerProgress(
      enrollmentId: (json['id'] as String?) ?? '',
      domainId: (domain?['id'] as String?) ?? '',
      domainName: (domain?['name'] as String?) ?? '',
      nodeProgress: progressList,
    );
  }
}

/// Node progress detail for a learner
class NodeProgressDetail {
  final String nodeId;
  final String nodeTitle;
  final String masteryState;
  final double? bestQuizScore;
  final int attemptsCount;

  const NodeProgressDetail({
    required this.nodeId,
    required this.nodeTitle,
    required this.masteryState,
    this.bestQuizScore,
    required this.attemptsCount,
  });

  factory NodeProgressDetail.fromJson(Map<String, dynamic> json) {
    // Parse from nested node object
    final node = json['node'] as Map<String, dynamic>?;
    // Handle bestQuizScore as string from API
    final scoreStr = json['bestQuizScore'] as String?;

    return NodeProgressDetail(
      nodeId: (node?['id'] as String?) ?? '',
      nodeTitle: (node?['title'] as String?) ?? '',
      masteryState: (json['masteryState'] as String?) ?? '',
      bestQuizScore: scoreStr != null ? double.tryParse(scoreStr) : null,
      attemptsCount: (json['attemptsCount'] as num?)?.toInt() ?? 0,
    );
  }
}

/// Quiz attempt history row
class QuizAttemptHistory {
  final String attemptId;
  final String nodeTitle;
  final double scorePercent;
  final String outcome;
  final DateTime completedAt;

  const QuizAttemptHistory({
    required this.attemptId,
    required this.nodeTitle,
    required this.scorePercent,
    required this.outcome,
    required this.completedAt,
  });

  factory QuizAttemptHistory.fromJson(Map<String, dynamic> json) {
    // Parse from nested node object
    final node = json['node'] as Map<String, dynamic>?;
    // Handle scorePercent as string from API
    final scoreStr = json['scorePercent'] as String?;

    return QuizAttemptHistory(
      attemptId: (json['id'] as String?) ?? '',
      nodeTitle: (node?['title'] as String?) ?? '',
      scorePercent: double.tryParse(scoreStr ?? '0') ?? 0.0,
      outcome: (json['outcome'] as String?) ?? '',
      completedAt: DateTime.tryParse(json['completedAt'] as String? ?? '') ??
          DateTime.now(),
    );
  }
}
