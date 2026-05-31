import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../models/quiz.dart';
import '../models/attempt_result.dart';

/// Quiz generation may call AI twice (explanation + questions); allow extra time.
const Duration _quizReceiveTimeout = Duration(seconds: 180);

class QuizzesApi {
  const QuizzesApi(this._dio);

  final Dio _dio;

  Future<Quiz> getQuizByNode(String nodeId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/nodes/$nodeId/quiz',
      options: Options(receiveTimeout: _quizReceiveTimeout),
    );
    final data = response.data ?? <String, dynamic>{};
    debugPrint('[QUIZZES_API] Response keys: ${data.keys}');
    final quizData = data['quiz'] as Map<String, dynamic>? ?? data;
    debugPrint('[QUIZZES_API] Quiz keys: ${quizData.keys}');
    return Quiz.fromJson(quizData);
  }

  Future<AttemptResult> submitAttempt({
    required String quizId,
    required String enrollmentId,
    required List<AttemptAnswer> answers,
    required DateTime startedAt,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/quizzes/$quizId/attempt',
      data: <String, dynamic>{
        'enrollmentId': enrollmentId,
        'answers': answers.map((a) => <String, dynamic>{
          'questionId': a.questionId,
          'answer': a.answer,
        }).toList(),
        'startedAt': startedAt.toIso8601String(),
      },
    );

    final data = response.data ?? <String, dynamic>{};
    debugPrint('[QUIZZES_API] Submit response keys: ${data.keys}');
    return AttemptResult.fromJson(data);
  }
}

class AttemptAnswer {
  const AttemptAnswer({required this.questionId, required this.answer});

  final String questionId;
  final String answer;
}
