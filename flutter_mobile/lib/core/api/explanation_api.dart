import 'dart:async';

import 'package:dio/dio.dart';

import '../utils/sse_parser.dart';

class ExplanationApi {
  const ExplanationApi(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> explain({
    required String nodeId,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/nodes/$nodeId/explanation',
    );

    return response.data ?? <String, dynamic>{};
  }

  Stream<String> explainStream({
    required String nodeId,
  }) async* {
    final response = await _dio.get<ResponseBody>(
      '/nodes/$nodeId/explanation/stream',
      options: Options(
        responseType: ResponseType.stream,
        receiveTimeout: const Duration(minutes: 5),
      ),
    );

    yield* parseSseResponse(response);
  }
}
