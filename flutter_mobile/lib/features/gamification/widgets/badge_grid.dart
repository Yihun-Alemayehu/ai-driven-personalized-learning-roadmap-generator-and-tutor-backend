import 'package:flutter/material.dart';

import '../../../core/models/gamification_models.dart';

/// Grid of achievement badges (earned and unearned)
class BadgeGrid extends StatelessWidget {
  final List<BadgeMeta> badges;

  const BadgeGrid({required this.badges, super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        childAspectRatio: 0.75,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: badges.length,
      itemBuilder: (context, index) {
        final badge = badges[index];
        return _BadgeTile(badge: badge);
      },
    );
  }
}

class _BadgeTile extends StatelessWidget {
  final BadgeMeta badge;

  const _BadgeTile({required this.badge});

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: badge.isEarned ? 1.0 : 0.4,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: badge.isEarned 
                ? Colors.amber.withOpacity(0.2) 
                : Colors.grey[200],
              shape: BoxShape.circle,
            ),
            child: Icon(
              _getBadgeIcon(badge.key),
              size: 32,
              color: badge.isEarned ? Colors.amber[700] : Colors.grey,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            badge.label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 11,
              fontWeight: badge.isEarned ? FontWeight.w600 : FontWeight.normal,
              color: badge.isEarned ? Colors.black87 : Colors.grey[600],
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  IconData _getBadgeIcon(String key) {
    if (key.contains('mastery')) return Icons.emoji_events;
    if (key.contains('streak')) return Icons.local_fire_department;
    if (key.contains('quiz')) return Icons.star;
    if (key.contains('speed')) return Icons.bolt;
    if (key.contains('completion')) return Icons.check_circle;
    if (key.contains('consistent')) return Icons.calendar_today;
    if (key.contains('comeback')) return Icons.trending_up;
    return Icons.emoji_events;
  }
}
