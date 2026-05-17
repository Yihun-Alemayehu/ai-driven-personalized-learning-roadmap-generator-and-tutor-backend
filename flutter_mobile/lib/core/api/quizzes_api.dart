import 'package:dio/dio.dart';

import '../models/quiz.dart';

class QuizzesApi {
  const QuizzesApi(this._dio);

  final Dio _dio;

  Future<Quiz> getQuizByNode(String nodeId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/quizzes/node/$nodeId',
    );
    return Quiz.fromJson(response.data ?? <String, dynamic>{});
  }
}
