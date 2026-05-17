import 'package:dio/dio.dart';

import '../models/domain.dart';

class DomainsApi {
  const DomainsApi(this._dio);

  final Dio _dio;

  Future<List<Domain>> listDomains() async {
    final response = await _dio.get<Map<String, dynamic>>('/domains');
    final payload =
        (response.data?['domains'] as List<dynamic>?) ?? <dynamic>[];
    return payload
        .map((item) => Domain.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<Domain> getDomainBySlug(String slug) async {
    final response = await _dio.get<Map<String, dynamic>>('/domains/$slug');
    final payload = response.data?['domain'] as Map<String, dynamic>?;
    return Domain.fromJson(payload ?? <String, dynamic>{});
  }
}
