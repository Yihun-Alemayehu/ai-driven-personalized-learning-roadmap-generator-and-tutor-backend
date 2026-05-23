import 'package:dio/dio.dart';

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
}
