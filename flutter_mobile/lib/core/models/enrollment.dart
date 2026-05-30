import 'domain.dart';

enum FamiliarityLevel { beginner, intermediate, advanced }

enum LearningGoal { getJob, upskill, hobby, certification }

enum PreferredLearningStyle { visual, reading, handsOn, video }

FamiliarityLevel? familiarityLevelFromJson(String? value) {
  switch (value) {
    case 'beginner':
      return FamiliarityLevel.beginner;
    case 'intermediate':
      return FamiliarityLevel.intermediate;
    case 'advanced':
      return FamiliarityLevel.advanced;
    default:
      return null;
  }
}

LearningGoal? learningGoalFromJson(String? value) {
  switch (value) {
    case 'get_job':
      return LearningGoal.getJob;
    case 'upskill':
      return LearningGoal.upskill;
    case 'hobby':
      return LearningGoal.hobby;
    case 'certification':
      return LearningGoal.certification;
    default:
      return null;
  }
}

String familiarityLevelToJson(FamiliarityLevel value) {
  switch (value) {
    case FamiliarityLevel.beginner:
      return 'beginner';
    case FamiliarityLevel.intermediate:
      return 'intermediate';
    case FamiliarityLevel.advanced:
      return 'advanced';
  }
}

String learningGoalToJson(LearningGoal value) {
  switch (value) {
    case LearningGoal.getJob:
      return 'get_job';
    case LearningGoal.upskill:
      return 'upskill';
    case LearningGoal.hobby:
      return 'hobby';
    case LearningGoal.certification:
      return 'certification';
  }
}

PreferredLearningStyle? preferredLearningStyleFromJson(String? value) {
  switch (value) {
    case 'visual':
      return PreferredLearningStyle.visual;
    case 'reading':
      return PreferredLearningStyle.reading;
    case 'hands_on':
      return PreferredLearningStyle.handsOn;
    case 'video':
      return PreferredLearningStyle.video;
    default:
      return null;
  }
}

String preferredLearningStyleToJson(PreferredLearningStyle value) {
  switch (value) {
    case PreferredLearningStyle.visual:
      return 'visual';
    case PreferredLearningStyle.reading:
      return 'reading';
    case PreferredLearningStyle.handsOn:
      return 'hands_on';
    case PreferredLearningStyle.video:
      return 'video';
  }
}

/// POST /enrollments response (matches web `EnrollResult`).
class EnrollPersonalization {
  const EnrollPersonalization({
    required this.skippedNodes,
    required this.supplementaryNodes,
    this.unlockAcceleration,
  });

  final int skippedNodes;
  final int supplementaryNodes;
  final String? unlockAcceleration;

  factory EnrollPersonalization.fromJson(Map<String, dynamic> json) {
    return EnrollPersonalization(
      skippedNodes: (json['skippedNodes'] as num?)?.toInt() ?? 0,
      supplementaryNodes: (json['supplementaryNodes'] as num?)?.toInt() ?? 0,
      unlockAcceleration: json['unlockAcceleration'] as String?,
    );
  }

  bool get hasSummary =>
      skippedNodes > 0 ||
      supplementaryNodes > 0 ||
      (unlockAcceleration != null && unlockAcceleration!.isNotEmpty);
}

class EnrollResult {
  const EnrollResult({
    required this.enrollment,
    required this.totalNodes,
    required this.unlockedNodes,
    required this.personalization,
  });

  final Enrollment enrollment;
  final int totalNodes;
  final int unlockedNodes;
  final EnrollPersonalization personalization;

  factory EnrollResult.fromJson(Map<String, dynamic> json) {
    final enrollmentPayload = json['enrollment'] as Map<String, dynamic>? ?? json;
    final enrollment = Enrollment.fromJson(
      Map<String, dynamic>.from(enrollmentPayload),
    );

    return EnrollResult(
      enrollment: enrollment,
      totalNodes: (json['totalNodes'] as num?)?.toInt() ?? 0,
      unlockedNodes: (json['unlockedNodes'] as num?)?.toInt() ?? 0,
      personalization: EnrollPersonalization.fromJson(
        json['personalization'] as Map<String, dynamic>? ?? {},
      ),
    );
  }
}

class Enrollment {
  const Enrollment({
    required this.id,
    required this.domainId,
    required this.domain,
    this.userId,
    this.enrolledAt,
    this.weeklyHours,
    this.familiarityLevel,
    this.learningGoal,
    this.aboutSelf,
    this.ontologyVersionNumber,
    this.totalNodes,
    this.masteredNodes,
    this.lastAccessedAt,
  });

  final String id;
  final String domainId;
  final Domain domain;
  final String? userId;
  final DateTime? enrolledAt;
  final int? weeklyHours;
  final FamiliarityLevel? familiarityLevel;
  final LearningGoal? learningGoal;
  final String? aboutSelf;
  final int? ontologyVersionNumber;
  final int? totalNodes;
  final int? masteredNodes;
  final DateTime? lastAccessedAt;

  String get domainTitle => domain.name;

  double get progressPercent {
    final total = totalNodes;
    if (total == null || total <= 0) {
      return 0;
    }

    return ((masteredNodes ?? 0) / total).clamp(0.0, 1.0);
  }

  factory Enrollment.fromJson(Map<String, dynamic> json) {
    final domainPayload = (json['domain'] as Map<String, dynamic>?) ??
        <String, dynamic>{
          'id': json['domainId'] as String? ?? '',
          'name': json['domainTitle'] as String? ?? 'Untitled domain',
          'slug': json['domainSlug'] as String? ?? '',
        };

    final counts = json['_count'] as Map<String, dynamic>?;
    final progressPayload = json['progress'] as Map<String, dynamic>?;

    return Enrollment(
      id: json['id'] as String,
      domainId: (json['domainId'] as String?) ??
          (domainPayload['id'] as String? ?? ''),
      domain: Domain.fromJson(domainPayload),
      userId: json['userId'] as String?,
      enrolledAt: json['enrolledAt'] == null
          ? null
          : DateTime.tryParse(json['enrolledAt'] as String),
      weeklyHours: (json['weeklyHours'] as num?)?.toInt(),
      familiarityLevel:
          familiarityLevelFromJson(json['familiarityLevel'] as String?),
      learningGoal: learningGoalFromJson(json['learningGoal'] as String?),
      aboutSelf: json['aboutSelf'] as String?,
      ontologyVersionNumber: (json['ontologyVersionNumber'] as num?)?.toInt() ??
          ((json['ontologyVersion'] as Map<String, dynamic>?)?['version']
                  as num?)
              ?.toInt() ??
          ((json['ontologyVersion'] as Map<String, dynamic>?)?['versionNumber']
                  as num?)
              ?.toInt(),
      totalNodes: (json['totalNodes'] as num?)?.toInt() ??
          (progressPayload?['totalNodes'] as num?)?.toInt() ??
          (counts?['nodeProgress'] as num?)?.toInt(),
      masteredNodes: (json['masteredNodes'] as num?)?.toInt() ??
          (progressPayload?['masteredNodes'] as num?)?.toInt() ??
          (progressPayload?['masteredCount'] as num?)?.toInt(),
      lastAccessedAt: json['lastAccessedAt'] == null
          ? null
          : DateTime.tryParse(json['lastAccessedAt'] as String),
    );
  }
}
