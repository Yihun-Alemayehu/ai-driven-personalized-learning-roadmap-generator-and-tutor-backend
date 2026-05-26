import 'package:dio/dio.dart';

import '../models/gamification_models.dart';

/// API client for gamification endpoints
class GamificationApi {
  final Dio _dio;

  GamificationApi(this._dio);

  /// Get user's full gamification summary
  /// 
  /// Returns: XP, level, streak, badges, weekly goal, recent events
  Future<GamificationSummary> getGamification() async {
    final response = await _dio.get<Map<String, dynamic>>('/me/gamification');
    final data = response.data?['gamification'] as Map<String, dynamic>?;
    return GamificationSummary.fromJson(data ?? {});
  }
}
