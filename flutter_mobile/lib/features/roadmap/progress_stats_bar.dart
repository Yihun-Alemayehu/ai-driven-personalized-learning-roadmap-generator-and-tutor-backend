import 'package:flutter/material.dart';

import '../../core/models/roadmap_data.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/mastery_config.dart';

class ProgressStatsBar extends StatelessWidget {
  const ProgressStatsBar({
    required this.stats,
    this.pathLabel,
    super.key,
  });

  final ProgressStats stats;
  final String? pathLabel;

  @override
  Widget build(BuildContext context) {
    final mastered = stats.masteredCount;
    final total = stats.totalNodes;
    final progress = total == 0 ? 0.0 : mastered / total;
    final percent = stats.completionPercent;
    final theme = Theme.of(context);

    return Container(
      height: 52,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.background.withValues(alpha: 0.92),
        border: Border(
          bottom: BorderSide(color: AppColors.border.withValues(alpha: 0.85)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Row(
            children: <Widget>[
              Expanded(
                child: Text(
                  pathLabel ?? 'Learning path',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: AppColors.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Text(
                '$mastered / $total mastered ($percent%)',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: MasteryConfig.colors[MasteryState.inProgress],
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(99),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: AppColors.hover,
              valueColor: AlwaysStoppedAnimation<Color>(
                MasteryConfig.colors[MasteryState.mastered]!,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
