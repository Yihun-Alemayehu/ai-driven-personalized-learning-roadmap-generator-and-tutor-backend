import 'package:dio/dio.dart';

import '../models/user.dart';

class UsersApi {
  const UsersApi(this._dio);

  final Dio _dio;

  Future<User> getMe() async {
    final response = await _dio.get<Map<String, dynamic>>('/users/me');
    return User.fromJson(response.data ?? <String, dynamic>{});
  }

  Future<User> updateMe({
    String? fullName,
    String? avatarUrl,
    String? preferredLanguage,
    bool clearAvatar = false,
  }) async {
    final data = <String, dynamic>{};
    if (fullName != null) data['fullName'] = fullName;
    if (clearAvatar) {
      data['avatarUrl'] = null;
    } else if (avatarUrl != null) {
      data['avatarUrl'] = avatarUrl;
    }
    if (preferredLanguage != null) {
      data['preferredLanguage'] = preferredLanguage;
    }

    final response = await _dio.patch<Map<String, dynamic>>(
      '/users/me',
      data: data,
    );
    return User.fromJson(response.data ?? <String, dynamic>{});
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    await _dio.post<Map<String, dynamic>>(
      '/users/me/change-password',
      data: <String, dynamic>{
        'currentPassword': currentPassword,
        'newPassword': newPassword,
        'confirmPassword': confirmPassword,
      },
    );
  }

  Future<void> deleteAccount() async {
    await _dio.delete('/users/me');
  }
}
