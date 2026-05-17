import 'package:dio/dio.dart';

class BranchingApi {
  const BranchingApi(this._dio);

  final Dio _dio;

  Future<List<Map<String, dynamic>>> options(String nodeId) async {
    final response = await _dio.get<List<dynamic>>(
      '/branching/$nodeId/options',
    );
    final payload = response.data ?? <dynamic>[];
    return payload
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList();
  }
}
