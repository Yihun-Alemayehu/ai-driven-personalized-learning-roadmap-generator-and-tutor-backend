import 'package:dio/dio.dart';

class InstructorApi {
  const InstructorApi(this._dio);

  final Dio _dio;

  Future<List<Map<String, dynamic>>> learners() async {
    final response = await _dio.get<List<dynamic>>('/instructor/learners');
    final payload = response.data ?? <dynamic>[];
    return payload
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList();
  }
}
