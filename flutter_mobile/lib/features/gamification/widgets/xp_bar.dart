import 'package:flutter/material.dart';

import '../../../core/models/gamification_models.dart';
import '../../../core/theme/app_colors.dart';

/// XP progress (matches web `XpBar` full variant).
class XpBar extends StatelessWidget {
  const XpBar({required this.xp, super.key});

  final XpInfo xp;

  String _formatTotal(int value) {
    if (value >= 1000) {
      return '${(value / 1000).toStringAsFixed(value % 1000 == 0 ? 0 : 1)}k';
    }
    return value.toString();
  }

  @override
  Widget build(BuildContext context) {
    final progress = (xp.progressPct / 100).clamp(0.0, 1.0);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: <Widget>[
            Container(
              width: 36,
              height: 36,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppColors.accent,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '${xp.level}',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    'LEVEL ${xp.level}',
                    style: const TextStyle(
                      fontSize: 11,
                      letterSpacing: 1,
                      fontFamily: 'monospace',
                      color: AppColors.textMuted,
                    ),
                  ),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: <Widget>[
                      Text(
                        _formatTotal(xp.total),
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Text(
                        'XP',
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Text(
              '${xp.xpIntoLevel} / ${xp.xpForNextLevel}',
              style: const TextStyle(
                fontSize: 11,
                fontFamily: 'monospace',
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 8,
            backgroundColor: AppColors.hover,
            color: AppColors.accent,
          ),
        ),
        const SizedBox(height: 4),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            Text(
              '${xp.xpIntoLevel} XP',
              style: const TextStyle(
                fontSize: 9,
                fontFamily: 'monospace',
                color: Color(0xFFB0A898),
              ),
            ),
            Text(
              '${xp.progressPct.round()}%',
              style: const TextStyle(
                fontSize: 9,
                fontFamily: 'monospace',
                color: Color(0xFFB0A898),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
