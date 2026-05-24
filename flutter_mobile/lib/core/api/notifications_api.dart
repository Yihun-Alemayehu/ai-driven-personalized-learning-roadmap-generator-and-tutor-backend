import 'dart:developer' as developer;

import 'package:dio/dio.dart';

import '../models/notification.dart';

class NotificationsApi {
  const NotificationsApi(this._dio);

  final Dio _dio;

  Future<List<AppNotification>> list({int limit = 20, int offset = 0}) async {
    developer.log('Fetching notifications from API...', name: 'NotificationsApi');
    final response = await _dio.get<Map<String, dynamic>>(
      '/notifications',
      queryParameters: {'limit': limit, 'offset': offset},
    );
    developer.log('Response status: ${response.statusCode}', name: 'NotificationsApi');
    
    // Handle wrapped response: { notifications: [...] }
    final data = response.data ?? {};
    final notifications = data['notifications'] as List<dynamic>? ?? <dynamic>[];
    developer.log('Notifications count: ${notifications.length}', name: 'NotificationsApi');
    
    return notifications
        .map((item) => AppNotification.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> markAsRead(String notificationId) async {
    await _dio.patch<Map<String, dynamic>>(
      '/notifications/$notificationId/read',
    );
  }

  Future<void> markAllAsRead() async {
    await _dio.patch<Map<String, dynamic>>(
      '/notifications/read-all',
    );
  }
}
