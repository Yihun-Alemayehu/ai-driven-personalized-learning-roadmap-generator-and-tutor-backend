import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/notification.dart';
import '../../core/providers/notifications_provider.dart';

class NotificationTile extends ConsumerWidget {
  const NotificationTile({
    required this.notification,
    super.key,
  });

  final AppNotification notification;

  IconData _getIconForType(String type) {
    return switch (type) {
      'mastery_alert' => Icons.trending_up,
      'decay_reminder' => Icons.schedule,
      'quiz_result' => Icons.quiz,
      'node_unlocked' => Icons.lock_open,
      'resource_discovered' => Icons.new_releases,
      _ => Icons.notifications,
    };
  }

  Color _getColorForType(String type) {
    return switch (type) {
      'mastery_alert' => Colors.green,
      'decay_reminder' => Colors.orange,
      'quiz_result' => Colors.blue,
      'node_unlocked' => Colors.purple,
      'resource_discovered' => Colors.teal,
      _ => Colors.grey,
    };
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final diff = now.difference(timestamp);

    if (diff.inDays > 7) {
      return '${timestamp.day}/${timestamp.month}/${timestamp.year}';
    } else if (diff.inDays > 0) {
      return '${diff.inDays}d ago';
    } else if (diff.inHours > 0) {
      return '${diff.inHours}h ago';
    } else if (diff.inMinutes > 0) {
      return '${diff.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final color = _getColorForType(notification.type);

    return Dismissible(
      key: ValueKey(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        color: Colors.green,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        child: const Icon(Icons.check, color: Colors.white),
      ),
      onDismissed: (_) async {
        final api = ref.read(notificationsApiProvider);
        await api.markAsRead(notification.id);
        ref.invalidate(notificationsProvider);
      },
      child: Container(
        color: notification.isRead ? null : theme.colorScheme.surfaceContainerHighest?.withAlpha(128),
        child: ListTile(
          leading: CircleAvatar(
            backgroundColor: color.withAlpha(26),
            child: Icon(_getIconForType(notification.type), color: color, size: 20),
          ),
          title: Text(
            notification.title,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: notification.isRead ? null : FontWeight.bold,
            ),
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (notification.body != null)
                Text(
                  notification.body!,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              Text(
                _formatTimestamp(notification.createdAt),
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.textTheme.bodySmall?.color?.withAlpha(179),
                ),
              ),
            ],
          ),
          isThreeLine: notification.body != null,
          onTap: notification.isRead
              ? null
              : () async {
                  final api = ref.read(notificationsApiProvider);
                  await api.markAsRead(notification.id);
                  ref.invalidate(notificationsProvider);
                },
        ),
      ),
    );
  }
}
