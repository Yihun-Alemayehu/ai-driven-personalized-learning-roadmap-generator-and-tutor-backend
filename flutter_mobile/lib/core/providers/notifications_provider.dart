import 'dart:developer' as developer;

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/notifications_api.dart';
import '../models/notification.dart';

final notificationsApiProvider = Provider<NotificationsApi>(
  (ref) => NotificationsApi(ref.watch(apiClientProvider).dio),
);

final notificationsProvider = FutureProvider<List<AppNotification>>(
  (ref) async {
    try {
      developer.log('Fetching notifications...', name: 'NotificationsProvider');
      final api = ref.watch(notificationsApiProvider);
      final result = await api.list();
      developer.log('Fetched ${result.length} notifications', name: 'NotificationsProvider');
      return result;
    } catch (e, stack) {
      developer.log('Error fetching notifications: $e\n$stack', name: 'NotificationsProvider');
      rethrow;
    }
  },
);

// Provider for unread count (for badge)
final unreadNotificationsCountProvider = Provider<int>(
  (ref) {
    final notificationsAsync = ref.watch(notificationsProvider);
    return notificationsAsync.whenOrNull(
          data: (notifications) =>
              notifications.where((n) => !n.isRead).length,
        ) ??
        0;
  },
);

// Provider for unread notifications only
final unreadNotificationsProvider = Provider<List<AppNotification>>(
  (ref) {
    final notificationsAsync = ref.watch(notificationsProvider);
    return notificationsAsync.whenOrNull(
          data: (notifications) =>
              notifications.where((n) => !n.isRead).toList(),
        ) ??
        [];
  },
);
