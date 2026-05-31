import 'package:dio/dio.dart';

import '../models/enrollment.dart';

class EnrollPayload {
  const EnrollPayload({
    required this.domainId,
    this.weeklyHours,
    this.familiarityLevel,
    this.learningGoal,
    this.aboutSelf,
    this.preferredLearningStyle,
    this.priorSkills,
  });

  final String domainId;
  final int? weeklyHours;
  final FamiliarityLevel? familiarityLevel;
  final LearningGoal? learningGoal;
  final String? aboutSelf;
  final PreferredLearningStyle? preferredLearningStyle;
  final String? priorSkills;

  Map<String, dynamic> toJson() {
    return {
      'domainId': domainId,
      if (weeklyHours != null) 'weeklyHours': weeklyHours,
      if (familiarityLevel != null)
        'familiarityLevel': familiarityLevelToJson(familiarityLevel!),
      if (learningGoal != null)
        'learningGoal': learningGoalToJson(learningGoal!),
      if (aboutSelf != null && aboutSelf!.trim().isNotEmpty)
        'aboutSelf': aboutSelf!.trim(),
      if (preferredLearningStyle != null)
        'preferredLearningStyle':
            preferredLearningStyleToJson(preferredLearningStyle!),
      if (priorSkills != null && priorSkills!.trim().isNotEmpty)
        'priorSkills': priorSkills!.trim(),
    };
  }
}

class EnrollmentsApi {
  const EnrollmentsApi(this._dio);

  final Dio _dio;

  Future<List<Enrollment>> myEnrollments() async {
    final response = await _dio.get<Map<String, dynamic>>('/enrollments');
    final payload =
        (response.data?['enrollments'] as List<dynamic>?) ?? <dynamic>[];
    return payload
        .map((item) => Enrollment.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<Enrollment> getEnrollmentById(String enrollmentId) async {
    final response =
        await _dio.get<Map<String, dynamic>>('/enrollments/$enrollmentId');
    final payload = response.data?['enrollment'] as Map<String, dynamic>?;
    return Enrollment.fromJson(payload ?? <String, dynamic>{});
  }

  Future<EnrollResult> enroll(EnrollPayload payload) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/enrollments',
      data: payload.toJson(),
    );

    return EnrollResult.fromJson(response.data ?? <String, dynamic>{});
  }

  Future<void> unenroll(String enrollmentId) async {
    await _dio.delete<void>('/enrollments/$enrollmentId');
  }
}
