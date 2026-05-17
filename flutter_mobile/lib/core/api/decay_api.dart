import 'package:dio/dio.dart';

class DecayApi {
  const DecayApi(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> overview() async {
    final response = await _dio.get<Map<String, dynamic>>('/decay/overview');
    return response.data ?? <String, dynamic>{};
  }
}
