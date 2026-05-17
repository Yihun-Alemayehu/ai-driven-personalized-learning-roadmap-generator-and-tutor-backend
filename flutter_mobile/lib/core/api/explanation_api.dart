import 'package:dio/dio.dart';

class ExplanationApi {
  const ExplanationApi(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> explain({
    required String enrollmentId,
    required String nodeId,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/explanations/generate',
      data: <String, dynamic>{'enrollmentId': enrollmentId, 'nodeId': nodeId},
    );

    return response.data ?? <String, dynamic>{};
  }
}
