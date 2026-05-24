import 'package:dio/dio.dart';

class BranchPath {
  final String id;
  final String name;
  final String? description;

  const BranchPath({
    required this.id,
    required this.name,
    this.description,
  });

  factory BranchPath.fromJson(Map<String, dynamic> json) {
    return BranchPath(
      id: (json['id'] as String?) ?? '',
      name: (json['name'] as String?) ?? '',
      description: json['description'] as String?,
    );
  }
}

class BranchingApi {
  const BranchingApi(this._dio);

  final Dio _dio;

  /// Get available branch paths for an enrollment
  Future<List<BranchPath>> getBranches(String enrollmentId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/enrollments/$enrollmentId/branches',
    );
    final data = response.data ?? {};
    final branches = data['branches'] as List<dynamic>? ?? <dynamic>[];
    return branches
        .map((item) => BranchPath.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  /// Select or change branch for an enrollment
  Future<void> selectBranch({
    required String enrollmentId,
    required String branchPath,
  }) async {
    await _dio.post<Map<String, dynamic>>(
      '/enrollments/$enrollmentId/branch',
      data: {'branchPath': branchPath},
    );
  }

  @Deprecated('Use getBranches instead')
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
