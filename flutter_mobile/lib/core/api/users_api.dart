import 'package:dio/dio.dart';

import '../models/user.dart';

class UsersApi {
  const UsersApi(this._dio);

  final Dio _dio;

  /// Get current user profile
  Future<User> getMe() async {
    final response = await _dio.get<Map<String, dynamic>>('/users/me');
    return User.fromJson(response.data ?? {});
  }

  /// Update current user profile
  Future<User> updateMe({
    String? fullName,
    String? avatarUrl,
    String? preferredLanguage,
  }) async {
    final response = await _dio.patch<Map<String, dynamic>>(
      '/users/me',
      data: {
        if (fullName != null) 'fullName': fullName,
        if (avatarUrl != null) 'avatarUrl': avatarUrl,
        if (preferredLanguage != null) 'preferredLanguage': preferredLanguage,
      },
    );
    return User.fromJson(response.data ?? {});
  }

  /// Change password
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _dio.post<Map<String, dynamic>>(
      '/users/me/change-password',
      data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      },
    );
  }

  /// Delete account
  Future<void> deleteAccount() async {
    await _dio.delete('/users/me');
  }
}
