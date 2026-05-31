import 'package:dio/dio.dart';

import '../models/decay_status.dart';
import '../models/quiz.dart';

class DecayApi {
  const DecayApi(this._dio);

  final Dio _dio;

  /// Get decay status for an enrollment
  Future<DecayStatus> getDecayStatus(String enrollmentId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/enrollments/$enrollmentId/decay-status',
    );
    return DecayStatus.fromJson(
      response.data ?? <String, dynamic>{},
      enrollmentId: enrollmentId,
    );
  }

  /// Generate a micro-quiz for a decayed node
  Future<Quiz> generateMicroQuiz(String nodeId) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/nodes/$nodeId/micro-quiz',
    );
    final data = response.data ?? <String, dynamic>{};
    // Micro-quiz response is nested under 'quiz' key
    final quizData = data['quiz'] as Map<String, dynamic>? ?? data;
    return Quiz.fromJson(quizData);
  }

  /// Legacy overview endpoint (for dashboard widget)
  Future<Map<String, dynamic>> overview() async {
    final response = await _dio.get<Map<String, dynamic>>('/decay/overview');
    return response.data ?? <String, dynamic>{};
  }
}
