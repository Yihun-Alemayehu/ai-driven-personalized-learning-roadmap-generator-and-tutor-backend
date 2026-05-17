import 'package:dio/dio.dart';

class AdminApi {
  const AdminApi(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> systemStats() async {
    final response = await _dio.get<Map<String, dynamic>>('/admin/stats');
    return response.data ?? <String, dynamic>{};
  }
}
