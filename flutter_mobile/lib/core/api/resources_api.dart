import 'package:dio/dio.dart';

import '../models/resource.dart';

class ResourcesApi {
  const ResourcesApi(this._dio);

  final Dio _dio;

  Future<List<Resource>> listByNode(String nodeId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/nodes/$nodeId/resources',
    );

    final data = response.data ?? <String, dynamic>{};
    final resources = data['resources'] as List<dynamic>? ?? <dynamic>[];
    return resources
        .map((item) => Resource.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<DiscoverResult> discover(String nodeId) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/nodes/$nodeId/resources/discover',
    );

    final data = response.data ?? <String, dynamic>{};
    return DiscoverResult.fromJson(data);
  }

  Future<void> rateResource({
    required String resourceId,
    required int rating,
    String? comment,
  }) async {
    await _dio.post<Map<String, dynamic>>(
      '/resources/$resourceId/rate',
      data: <String, dynamic>{
        'rating': rating,
        if (comment != null) 'comment': comment,
      },
    );
  }
}
