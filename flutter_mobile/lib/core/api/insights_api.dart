import 'package:dio/dio.dart';

import '../models/insights_models.dart';

class InsightsApi {
  InsightsApi(this._dio);

  final Dio _dio;

  Future<LearningInsights> getInsights(String enrollmentId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/enrollments/$enrollmentId/insights',
    );
    final payload = response.data?['insights'] as Map<String, dynamic>? ??
        response.data ??
        <String, dynamic>{};
    return LearningInsights.fromJson(payload);
  }

  Future<List<ActivityDay>> getActivity(String enrollmentId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/enrollments/$enrollmentId/activity',
    );
    final days = response.data?['days'] as List<dynamic>? ?? [];
    return days
        .map((d) => ActivityDay.fromJson(d as Map<String, dynamic>))
        .toList();
  }

  Future<TimelineEstimate> getTimeline(String enrollmentId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/enrollments/$enrollmentId/timeline',
    );
    final payload = response.data?['timeline'] as Map<String, dynamic>? ??
        response.data ??
        <String, dynamic>{};
    return TimelineEstimate.fromJson(payload);
  }

  Future<List<ActivityDay>> getGlobalActivity() async {
    final response = await _dio.get<Map<String, dynamic>>('/me/activity');
    final days = response.data?['days'] as List<dynamic>? ?? [];
    return days
        .map((d) => ActivityDay.fromJson(d as Map<String, dynamic>))
        .toList();
  }

  Future<GlobalInsights> getGlobalInsights() async {
    final response = await _dio.get<Map<String, dynamic>>('/me/insights');
    final payload = response.data?['insights'] as Map<String, dynamic>? ??
        response.data ??
        <String, dynamic>{};
    return GlobalInsights.fromJson(payload);
  }
}
