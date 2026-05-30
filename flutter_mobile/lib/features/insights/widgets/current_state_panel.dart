import 'package:flutter/material.dart';

import '../../../core/models/insights_models.dart';
import '../../../core/models/roadmap_data.dart';
import '../../../core/theme/app_colors.dart';
import 'insights_shared.dart';

class CurrentStatePanel extends StatelessWidget {
  const CurrentStatePanel({
    required this.insights,
    this.stats,
    this.timeline,
    super.key,
  });

  final LearningInsights insights;
  final ProgressStats? stats;
  final TimelineEstimate? timeline;

  @override
  Widget build(BuildContext context) {
    final completion = stats?.completionPercent ?? 0;
    final mastered = stats?.masteredCount ?? 0;
    final total = stats?.totalNodes ?? 0;
    final streak = stats?.currentStreak ?? 0;
    final avgScore = insights.avgScore;

    String avgSub;
    Color avgColor;
    if (avgScore == null) {
      avgSub = 'No attempts yet';
      avgColor = AppColors.textMuted;
    } else if (avgScore >= 80) {
      avgSub = 'Excellent';
      avgColor = const Color(0xFF5A9B6A);
    } else if (avgScore >= 60) {
      avgSub = 'Good';
      avgColor = AppColors.textPrimary;
    } else {
      avgSub = 'Needs improvement';
      avgColor = AppColors.accent;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        InsightsStatGrid(
          children: <Widget>[
            InsightsStatBox(
              value: '$completion%',
              label: 'Completed',
              accent: AppColors.accent,
              sub: '$mastered of $total nodes',
            ),
            InsightsStatBox(
              value: '$streak',
              label: 'Day streak',
              accent: streak >= 7
                  ? const Color(0xFF5A9B6A)
                  : AppColors.textPrimary,
              sub: streak >= 7
                  ? 'Keep it up!'
                  : streak > 0
                      ? 'Active today'
                      : 'Start a streak',
            ),
            InsightsStatBox(
              value: avgScore != null ? '${avgScore.round()}%' : '—',
              label: 'Avg quiz score',
              accent: avgColor,
              sub: avgSub,
            ),
            InsightsStatBox(
              value: '${insights.profile.daysSinceEnrollment}',
              label: 'Days enrolled',
              sub: timeline?.estimatedCompletionDate != null
                  ? 'Target: ${timeline!.estimatedCompletionDate}'
                  : null,
            ),
          ],
        ),
        const SizedBox(height: 14),
        InsightsMomentumBanner(momentum: insights.momentum),
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            const Text(
              'OVERALL COMPLETION',
              style: TextStyle(
                fontSize: 11,
                fontFamily: 'monospace',
                color: AppColors.textMuted,
              ),
            ),
            Text(
              '$mastered / $total',
              style: const TextStyle(
                fontSize: 11,
                fontFamily: 'monospace',
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: LinearProgressIndicator(
            value: total > 0 ? completion / 100 : 0,
            minHeight: 8,
            backgroundColor: AppColors.hover,
            color: AppColors.accent,
          ),
        ),
        if (stats != null) ...<Widget>[
          const SizedBox(height: 10),
          Wrap(
            spacing: 12,
            runSpacing: 6,
            children: <Widget>[
              _legendDot(
                const Color(0xFF5A9B6A),
                '${stats!.masteredCount} Mastered',
              ),
              _legendDot(
                const Color(0xFF6B8FCC),
                '${stats!.inProgressCount} In progress',
              ),
              _legendDot(
                const Color(0xFFD97706),
                '${stats!.reviewNeededCount} Review needed',
              ),
              _legendDot(
                AppColors.border,
                '${stats!.lockedCount} Locked',
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _legendDot(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontFamily: 'monospace',
            color: Color(0xFF6E645A),
          ),
        ),
      ],
    );
  }
}
