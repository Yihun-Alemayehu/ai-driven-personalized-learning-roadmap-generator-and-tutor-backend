import 'package:flutter/material.dart';

import '../../../core/models/gamification_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/format.dart';

/// Badge grid (matches web `BadgeGrid` — 2 cols mobile, 4 on wide).
class BadgeGrid extends StatelessWidget {
  const BadgeGrid({required this.badges, super.key});

  final List<BadgeMeta> badges;

  @override
  Widget build(BuildContext context) {
    if (badges.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Text(
          'No badges earned yet — complete your first node to start!',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 13, color: AppColors.textMuted),
        ),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth >= 560 ? 4 : 2;
        const spacing = 12.0;
        final itemWidth =
            (constraints.maxWidth - spacing * (columns - 1)) / columns;

        return Wrap(
          spacing: spacing,
          runSpacing: spacing,
          children: badges
              .map(
                (badge) => SizedBox(
                  width: itemWidth,
                  child: _BadgeTile(badge: badge),
                ),
              )
              .toList(),
        );
      },
    );
  }
}

class _BadgeTile extends StatelessWidget {
  const _BadgeTile({required this.badge});

  final BadgeMeta badge;

  @override
  Widget build(BuildContext context) {
    final earned = badge.isEarned;

    return Opacity(
      opacity: earned ? 1 : 0.5,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: earned
              ? AppColors.accent.withValues(alpha: 0.06)
              : AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: earned ? AppColors.accent : AppColors.border,
          ),
        ),
        child: Column(
          children: <Widget>[
            Container(
              width: 44,
              height: 44,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: earned ? AppColors.accent : AppColors.hover,
                shape: BoxShape.circle,
              ),
              child: earned
                  ? Text(badge.icon, style: const TextStyle(fontSize: 20))
                  : Icon(Icons.lock_outline, size: 16, color: AppColors.textMuted),
            ),
            const SizedBox(height: 10),
            Text(
              badge.label,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: earned ? AppColors.textPrimary : AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              badge.description,
              textAlign: TextAlign.center,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 10,
                height: 1.3,
                fontFamily: 'monospace',
                color: Color(0xFFB0A898),
              ),
            ),
            if (earned && badge.earnedAt != null) ...<Widget>[
              const SizedBox(height: 6),
              Text(
                Format.mediumDate(badge.earnedAt!),
                style: const TextStyle(
                  fontSize: 9,
                  letterSpacing: 0.5,
                  fontFamily: 'monospace',
                  color: AppColors.accent,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
