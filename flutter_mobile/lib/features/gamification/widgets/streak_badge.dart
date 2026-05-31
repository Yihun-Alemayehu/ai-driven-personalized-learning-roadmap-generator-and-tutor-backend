import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import 'gamification_shared.dart';

/// Streak display (matches web `StreakBadge` full variant).
class StreakBadge extends StatelessWidget {
  const StreakBadge({required this.current, super.key});

  final int current;

  Color get _color {
    if (current >= 14) return const Color(0xFFB85C38);
    if (current >= 5) return AppColors.accent;
    return AppColors.textMuted;
  }

  @override
  Widget build(BuildContext context) {
    return GamificationCard(
      child: Row(
        children: <Widget>[
          Container(
            width: 36,
            height: 36,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.hover,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(Icons.local_fire_department, size: 18, color: _color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  '$current',
                  style: const TextStyle(
                    fontSize: 28,
                    height: 1,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Text(
                  'DAY STREAK',
                  style: TextStyle(
                    fontSize: 10,
                    letterSpacing: 1,
                    fontFamily: 'monospace',
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          if (current >= 5)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.accent.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                current >= 14 ? 'RELENTLESS' : 'DEDICATED',
                style: TextStyle(
                  fontSize: 9,
                  letterSpacing: 0.8,
                  fontFamily: 'monospace',
                  color: _color,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
