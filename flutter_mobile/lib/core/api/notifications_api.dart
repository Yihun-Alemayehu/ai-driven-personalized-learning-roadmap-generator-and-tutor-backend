import 'package:dio/dio.dart';

import '../models/notification.dart';

class NotificationsApi {
  const NotificationsApi(this._dio);

  final Dio _dio;

  Future<List<AppNotification>> list() async {
    final response = await _dio.get<List<dynamic>>('/notifications');
    final payload = response.data ?? <dynamic>[];
    return payload
        .map((item) => AppNotification.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
