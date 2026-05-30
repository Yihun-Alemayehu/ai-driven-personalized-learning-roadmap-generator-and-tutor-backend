import 'package:flutter/material.dart';

import '../../../core/models/gamification_models.dart';
import '../../../core/theme/app_colors.dart';
import 'gamification_shared.dart';

/// Weekly nodes-mastered goal (matches web `WeeklyGoalCard` full variant).
class WeeklyGoalCard extends StatelessWidget {
  const WeeklyGoalCard({required this.goal, super.key});

  final WeeklyGoal goal;

  @override
  Widget build(BuildContext context) {
    final done = goal.progress >= goal.target;
    final accent = done ? const Color(0xFFB85C38) : AppColors.accent;
    final progress = (goal.percentDone / 100).clamp(0.0, 1.0);

    return GamificationCard(
      borderColor: done ? AppColors.accent : AppColors.border,
      backgroundColor: done
          ? AppColors.accent.withValues(alpha: 0.06)
          : AppColors.surface,
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    const Text(
                      'WEEKLY GOAL',
                      style: TextStyle(
                        fontSize: 10,
                        letterSpacing: 1,
                        fontFamily: 'monospace',
                        color: AppColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      goal.weekLabel,
                      style: const TextStyle(
                        fontSize: 12,
                        fontFamily: 'monospace',
                        color: Color(0xFFB0A898),
                      ),
                    ),
                  ],
                ),
              ),
              if (done)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.accent,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Icon(Icons.check_circle, size: 10, color: Colors.white),
                      SizedBox(width: 4),
                      Text(
                        'DONE!',
                        style: TextStyle(
                          fontSize: 9,
                          letterSpacing: 0.8,
                          fontFamily: 'monospace',
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: <Widget>[
              Text(
                '${goal.progress}',
                style: TextStyle(
                  fontSize: 36,
                  height: 1,
                  fontWeight: FontWeight.w600,
                  color: accent,
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(bottom: 2, left: 2),
                child: Text(
                  '/ ${goal.target}',
                  style: const TextStyle(
                    fontSize: 18,
                    color: AppColors.textMuted,
                  ),
                ),
              ),
              const Padding(
                padding: EdgeInsets.only(bottom: 4, left: 4),
                child: Text(
                  'nodes mastered',
                  style: TextStyle(
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: AppColors.textMuted,
                  ),
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
              color: accent,
            ),
          ),
          const SizedBox(height: 4),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              '${goal.percentDone.round()}% complete',
              style: const TextStyle(
                fontSize: 10,
                fontFamily: 'monospace',
                color: Color(0xFFB0A898),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
