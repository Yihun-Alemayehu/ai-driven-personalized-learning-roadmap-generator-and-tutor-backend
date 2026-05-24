import 'package:flutter/material.dart';

import '../../../core/models/gamification_models.dart';

/// XP progress bar showing level and progress to next level
class XpBar extends StatelessWidget {
  final XpInfo xp;

  const XpBar({required this.xp, super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Level ${xp.level}',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${xp.xpIntoLevel}/${xp.xpForNextLevel} XP',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: xp.progress,
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation(
                  theme.colorScheme.primary,
                ),
                minHeight: 12,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '${(xp.progress * 100).toInt()}% to Level ${xp.level + 1}',
              style: theme.textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
