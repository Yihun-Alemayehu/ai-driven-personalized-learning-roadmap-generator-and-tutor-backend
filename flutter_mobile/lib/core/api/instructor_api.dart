import 'package:dio/dio.dart';

import '../models/instructor_models.dart';

class InstructorApi {
  const InstructorApi(this._dio);

  final Dio _dio;

  /// List all enrolled learners (optionally filtered by domain)
  Future<List<InstructorEnrollment>> learners({String? domainId}) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/instructor/learners',
      queryParameters: domainId != null ? {'domainId': domainId} : null,
    );
    final data = response.data ?? {};
    final learners = data['learners'] as List<dynamic>? ?? <dynamic>[];
    return learners
        .map((item) => InstructorEnrollment.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  /// Get learner progress for a specific user
  Future<List<LearnerProgress>> getLearnerProgress(String userId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/instructor/learners/$userId/progress',
    );
    final data = response.data ?? {};
    final enrollments = data['enrollments'] as List<dynamic>? ?? <dynamic>[];
    return enrollments
        .map((item) => LearnerProgress.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  /// Get quiz attempt history for a user
  Future<List<QuizAttemptHistory>> getQuizHistory(
    String userId, {
    int limit = 50,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/instructor/learners/$userId/quiz-history',
      queryParameters: {'limit': limit},
    );
    final data = response.data ?? {};
    final attempts = data['attempts'] as List<dynamic>? ?? <dynamic>[];
    return attempts
        .map((item) => QuizAttemptHistory.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  /// Get domain analytics
  Future<DomainAnalytics> getDomainAnalytics(String domainId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/instructor/domains/$domainId/analytics',
    );
    return DomainAnalytics.fromJson(response.data ?? {});
  }

  /// Get flagged events queue
  Future<List<FlaggedEvent>> getFlaggedEvents() async {
    final response = await _dio.get<Map<String, dynamic>>('/instructor/flagged');
    final data = response.data ?? {};
    final events = data['events'] as List<dynamic>? ?? <dynamic>[];
    return events
        .map((item) => FlaggedEvent.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  /// Resolve a flagged event
  Future<void> resolveFlaggedEvent({
    required String eventId,
    required String resolutionNotes,
  }) async {
    await _dio.patch<Map<String, dynamic>>(
      '/instructor/flagged/$eventId/resolve',
      data: {'resolutionNotes': resolutionNotes},
    );
  }
}
