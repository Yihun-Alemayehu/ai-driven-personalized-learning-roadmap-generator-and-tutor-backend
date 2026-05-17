import 'package:dio/dio.dart';

import '../models/resource.dart';

class ResourcesApi {
  const ResourcesApi(this._dio);

  final Dio _dio;

  Future<List<LearningResource>> listByNode(String nodeId) async {
    final response = await _dio.get<List<dynamic>>(
      '/resources',
      queryParameters: {'nodeId': nodeId},
    );

    final payload = response.data ?? <dynamic>[];
    return payload
        .map((item) => LearningResource.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
