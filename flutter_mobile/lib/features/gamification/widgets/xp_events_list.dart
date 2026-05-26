import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/models/gamification_models.dart';

/// List of recent XP earning events
class XpEventsList extends StatelessWidget {
  final List<XpEvent> events;

  const XpEventsList({required this.events, super.key});

  @override
  Widget build(BuildContext context) {
    if (events.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Text(
            'No XP events yet — take a quiz to start earning!',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey),
          ),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: events.length,
      itemBuilder: (context, index) {
        final event = events[index];
        return _XpEventTile(event: event);
      },
    );
  }
}

class _XpEventTile extends StatelessWidget {
  final XpEvent event;

  const _XpEventTile({required this.event});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.green.withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: const Icon(
          Icons.add,
          color: Colors.green,
          size: 20,
        ),
      ),
      title: Text(event.sourceLabel),
      subtitle: Text(
        _formatTimeAgo(event.createdAt),
        style: theme.textTheme.bodySmall?.copyWith(
          color: Colors.grey[600],
        ),
      ),
      trailing: Text(
        '+${event.amount}',
        style: theme.textTheme.titleMedium?.copyWith(
          color: Colors.green,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 7) {
      return DateFormat('MMM d').format(dateTime);
    } else if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}
