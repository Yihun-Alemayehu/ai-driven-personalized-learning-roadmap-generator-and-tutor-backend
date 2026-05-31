import 'package:flutter/material.dart';

import '../../../core/models/gamification_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/format.dart';
import 'gamification_shared.dart';

/// Recent XP feed (matches web `XpFeed`).
class XpEventsList extends StatelessWidget {
  const XpEventsList({required this.events, super.key});

  final List<XpEvent> events;

  @override
  Widget build(BuildContext context) {
    if (events.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Text(
          'No XP events yet — take a quiz to start earning!',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 13, color: AppColors.textMuted),
        ),
      );
    }

    return GamificationCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: events.asMap().entries.map((entry) {
          final i = entry.key;
          final event = entry.value;
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: i.isEven ? AppColors.background : AppColors.surface,
              border: i < events.length - 1
                  ? const Border(
                      bottom: BorderSide(color: Color(0xFFE8E2D9)),
                    )
                  : null,
            ),
            child: Row(
              children: <Widget>[
                Icon(Icons.bolt, size: 14, color: AppColors.accent),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    event.sourceLabel,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF3A342E),
                    ),
                  ),
                ),
                Text(
                  '+${event.amount} XP',
                  style: const TextStyle(
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w600,
                    color: AppColors.accent,
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  Format.shortMonthDay(event.createdAt),
                  style: const TextStyle(
                    fontSize: 10,
                    fontFamily: 'monospace',
                    color: Color(0xFFB0A898),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}
