import 'package:dio/dio.dart';

import '../models/roadmap_data.dart';

class ProgressApi {
  const ProgressApi(this._dio);

  final Dio _dio;

  Future<RoadmapData> getRoadmap(String enrollmentId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/enrollments/$enrollmentId/roadmap',
    );
    return RoadmapData.fromJson(response.data ?? <String, dynamic>{});
  }

  Future<ProgressStats> getProgressStats(String enrollmentId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/enrollments/$enrollmentId/progress/stats',
    );
    return ProgressStats.fromApi(response.data ?? <String, dynamic>{});
  }
}
