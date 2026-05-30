import 'package:dio/dio.dart';

import '../models/explanation.dart';

class InstructorChatApi {
  const InstructorChatApi(this._dio);

  final Dio _dio;

  Future<String?> ask({
    required String nodeId,
    required String question,
    String? enrollmentId,
    Explanation? explanation,
  }) async {
    final body = <String, dynamic>{
      'question': question,
      if (enrollmentId != null) 'enrollmentId': enrollmentId,
    };

    if (explanation != null &&
        (explanation.summary.isNotEmpty ||
            explanation.keyPoints.isNotEmpty)) {
      body['explanation'] = <String, dynamic>{
        'summary': explanation.summary,
        'keyPoints': explanation.keyPoints,
        if (explanation.commonMistakes.isNotEmpty)
          'commonMistakes': explanation.commonMistakes,
      };
    }

    final response = await _dio.post<Map<String, dynamic>>(
      '/nodes/$nodeId/ask',
      data: body,
    );

    final data = response.data;
    if (data == null) {
      return null;
    }
    return data['answer'] as String? ?? data['data']?['answer'] as String?;
  }
}
