import 'package:flutter/material.dart';

import '../../core/models/roadmap_data.dart';
import '../../core/theme/app_colors.dart';

class ProgressStatsBar extends StatelessWidget {
  const ProgressStatsBar({required this.stats, super.key});

  final ProgressStats stats;

  @override
  Widget build(BuildContext context) {
    final mastered = stats.masteredCount;
    final total = stats.totalNodes;
    final progress = total == 0 ? 0.0 : mastered / total;

    return Container(
      height: 52,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          bottom: BorderSide(color: AppColors.border.withValues(alpha: 0.85)),
        ),
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 8,
              borderRadius: BorderRadius.circular(99),
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.accent),
            ),
          ),
          const SizedBox(width: 10),
          Text(
            '$mastered / $total mastered',
            style: Theme.of(context).textTheme.labelSmall,
          ),
          const SizedBox(width: 10),
          Text(
            '${stats.completionPercent}%',
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ],
      ),
    );
  }
}
