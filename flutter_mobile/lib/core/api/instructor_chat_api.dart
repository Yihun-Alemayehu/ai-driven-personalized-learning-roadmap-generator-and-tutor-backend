import 'dart:async';

import 'package:dio/dio.dart';

import '../models/explanation.dart';
import '../utils/sse_parser.dart';

class InstructorChatApi {
  const InstructorChatApi(this._dio);

  final Dio _dio;

  Future<String?> ask({
    required String nodeId,
    required String question,
    String? enrollmentId,
    Explanation? explanation,
  }) async {
    final body = _buildBody(question, enrollmentId, explanation);

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

  Stream<String> askStream({
    required String nodeId,
    required String question,
    String? enrollmentId,
    Explanation? explanation,
    CancelToken? cancelToken,
  }) async* {
    final body = _buildBody(question, enrollmentId, explanation);

    final response = await _dio.post<ResponseBody>(
      '/nodes/$nodeId/ask/stream',
      data: body,
      options: Options(
        responseType: ResponseType.stream,
        receiveTimeout: const Duration(minutes: 5),
      ),
      cancelToken: cancelToken,
    );

    yield* parseSseResponse(response);
  }

  Map<String, dynamic> _buildBody(
    String question,
    String? enrollmentId,
    Explanation? explanation,
  ) {
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

    return body;
  }
}
