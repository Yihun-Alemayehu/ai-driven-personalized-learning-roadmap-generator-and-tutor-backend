import 'package:dio/dio.dart';

import '../models/insights_models.dart';

/// API client for insights endpoints
class InsightsApi {
  final Dio _dio;

  InsightsApi(this._dio);

  /// Get personalized insights for enrollment
  Future<InsightsData> getInsights(String enrollmentId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/enrollments/$enrollmentId/insights',
    );
    return InsightsData.fromJson(response.data ?? {});
  }

  /// Get activity heatmap data (last 30 days)
  Future<List<ActivityDay>> getActivity(String enrollmentId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/enrollments/$enrollmentId/activity',
    );
    final days = response.data?['days'] as List<dynamic>? ?? [];
    return days.map((d) => ActivityDay.fromJson(d as Map<String, dynamic>)).toList();
  }

  /// Get progress statistics
  Future<ProgressStats> getProgressStats(String enrollmentId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/enrollments/$enrollmentId/progress-stats',
    );
    return ProgressStats.fromJson(response.data ?? {});
  }

  /// Get timeline events
  Future<List<TimelineEvent>> getTimeline(String enrollmentId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/enrollments/$enrollmentId/timeline',
    );
    final events = response.data?['events'] as List<dynamic>? ?? [];
    return events.map((e) => TimelineEvent.fromJson(e as Map<String, dynamic>)).toList();
  }
}
