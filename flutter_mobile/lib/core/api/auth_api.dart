import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../models/user.dart';
import 'api_client.dart';

class AuthApi {
  const AuthApi({required Dio dio, required ApiClient apiClient})
      : _dio = dio,
        _apiClient = apiClient;

  final Dio _dio;
  final ApiClient _apiClient;

  Future<(User user, AuthTokens tokens)> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/login',
      data: <String, dynamic>{'email': email, 'password': password},
      options: _apiClient.unauthenticatedOptions(),
    );

    final data = response.data ?? <String, dynamic>{};
    return (
      User.fromJson(data['user'] as Map<String, dynamic>),
      AuthTokens.fromJson(data),
    );
  }

  Future<(User user, AuthTokens tokens)> register({
    required String fullName,
    required String email,
    required String password,
  }) async {
    debugPrint('[AUTH_API] Register called with email: $email');
    
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/register',
      data: <String, dynamic>{
        'fullName': fullName,
        'email': email,
        'password': password,
      },
      options: _apiClient.unauthenticatedOptions(),
    );

    debugPrint('[AUTH_API] Register response status: ${response.statusCode}');
    debugPrint('[AUTH_API] Register response data: ${response.data}');

    final data = response.data ?? <String, dynamic>{};
    
    if (data['user'] == null) {
      debugPrint('[AUTH_API] ERROR: user field is null in response');
    }
    if (data['accessToken'] == null) {
      debugPrint('[AUTH_API] ERROR: accessToken field is null in response');
    }
    if (data['refreshToken'] == null) {
      debugPrint('[AUTH_API] ERROR: refreshToken field is null in response');
    }
    
    return (
      User.fromJson(data['user'] as Map<String, dynamic>),
      AuthTokens.fromJson(data),
    );
  }

  Future<AuthTokens> refresh(String refreshToken) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/refresh',
      data: <String, dynamic>{'refreshToken': refreshToken},
      options: _apiClient.unauthenticatedOptions(skipRefresh: true),
    );

    return AuthTokens.fromJson(response.data ?? <String, dynamic>{});
  }

  Future<void> logout(String refreshToken) async {
    await _dio.post<void>(
      '/auth/logout',
      data: <String, dynamic>{'refreshToken': refreshToken},
      options: _apiClient.authenticatedNoRefreshOptions(),
    );
  }

  Future<User> me() async {
    final response = await _dio.get<Map<String, dynamic>>('/users/me');
    final payload = response.data ?? <String, dynamic>{};
    return User.fromJson(payload['user'] as Map<String, dynamic>);
  }
}
