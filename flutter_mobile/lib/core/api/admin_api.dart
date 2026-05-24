import 'package:dio/dio.dart';

import '../models/admin_models.dart';

class AdminApi {
  const AdminApi(this._dio);

  final Dio _dio;

  /// Get all users with optional filtering
  Future<List<AdminUser>> getUsers({
    String? role,
    int page = 1,
    int limit = 50,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/admin/users',
      queryParameters: {
        if (role != null) 'role': role,
        'page': page,
        'limit': limit,
      },
    );
    final data = response.data ?? {};
    final users = data['users'] as List<dynamic>? ?? <dynamic>[];
    return users
        .map((item) => AdminUser.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  /// Update user role
  Future<void> updateUserRole({
    required String userId,
    required String role,
  }) async {
    await _dio.patch<Map<String, dynamic>>(
      '/admin/users/$userId/role',
      data: {'role': role},
    );
  }

  /// Delete user
  Future<void> deleteUser(String userId) async {
    await _dio.delete('/admin/users/$userId');
  }

  /// Get system-wide stats
  Future<SystemStats> getSystemStats() async {
    final response = await _dio.get<Map<String, dynamic>>('/admin/stats');
    final data = response.data ?? {};
    final stats = data['stats'] as Map<String, dynamic>? ?? {};
    return SystemStats.fromJson(stats);
  }

  /// Get mastery breakdown
  Future<MasteryBreakdown> getMasteryBreakdown() async {
    final response = await _dio.get<Map<String, dynamic>>('/admin/stats');
    final data = response.data ?? {};
    final breakdown = data['masteryBreakdown'] as Map<String, dynamic>? ?? {};
    return MasteryBreakdown.fromJson(breakdown);
  }

  /// Get per-domain stats
  Future<List<DomainStat>> getDomainStats() async {
    final response = await _dio.get<Map<String, dynamic>>('/admin/stats/domains');
    final data = response.data ?? {};
    final domains = data['domains'] as List<dynamic>? ?? <dynamic>[];
    return domains
        .map((item) => DomainStat.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  /// Get all domains (uses public /domains endpoint)
  Future<List<AdminDomain>> getDomains() async {
    final response = await _dio.get<Map<String, dynamic>>('/domains');
    final data = response.data ?? {};
    final domains = data['domains'] as List<dynamic>? ?? <dynamic>[];
    return domains
        .map((item) => AdminDomain.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  /// Note: Domain create/update not available in current backend
  /// Placeholder for future implementation
  Future<AdminDomain> createDomain({
    required String name,
    required String slug,
    String? description,
  }) async {
    throw UnimplementedError('Domain creation not yet available');
  }

  Future<AdminDomain> updateDomain({
    required String domainId,
    String? name,
    String? description,
  }) async {
    throw UnimplementedError('Domain update not yet available');
  }
}
