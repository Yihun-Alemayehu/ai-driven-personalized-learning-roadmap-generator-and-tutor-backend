import 'package:flutter/material.dart';

import '../../../core/models/insights_models.dart';
import '../../../core/theme/app_colors.dart';
import 'insights_shared.dart';

class VelocityCard extends StatelessWidget {
  const VelocityCard({this.timeline, super.key});

  final TimelineEstimate? timeline;

  @override
  Widget build(BuildContext context) {
    if (timeline == null) {
      return const InsightsCard(
        child: Text(
          'Complete a few quizzes to see velocity data.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, color: AppColors.textMuted),
        ),
      );
    }

    final t = timeline!;
    final multiplier = t.velocityMultiplier;
    final velocityLabel = multiplier == null
        ? 'No data yet'
        : multiplier < 0.8
            ? '${((1 - multiplier) * 100).round()}% faster than estimated'
            : multiplier > 1.2
                ? '${((multiplier - 1) * 100).round()}% slower than estimated'
                : 'On track with estimates';

    final velocityColor = multiplier == null
        ? AppColors.textMuted
        : multiplier < 0.9
            ? const Color(0xFF5A9B6A)
            : multiplier > 1.2
                ? AppColors.accent
                : AppColors.textPrimary;

    final gaugePercent = multiplier != null
        ? (((2 - multiplier) / 2).clamp(0.0, 1.0) * 100).round()
        : 50;

    final hoursProgress = t.totalHours > 0
        ? (t.completedHours / t.totalHours).clamp(0.0, 1.0)
        : 0.0;

    return InsightsCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              const Text(
                'LEARNING VELOCITY',
                style: TextStyle(
                  fontSize: 11,
                  letterSpacing: 0.8,
                  fontFamily: 'monospace',
                  color: AppColors.textMuted,
                ),
              ),
              if (multiplier != null)
                Text(
                  '${multiplier.toStringAsFixed(2)}×',
                  style: TextStyle(
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w600,
                    color: velocityColor,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: gaugePercent / 100,
              minHeight: 8,
              backgroundColor: AppColors.hover,
              color: velocityColor,
            ),
          ),
          const SizedBox(height: 4),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              Text('2× slower', style: _gaugeLabel),
              Text('on track', style: _gaugeLabel),
              Text('2× faster', style: _gaugeLabel),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            velocityLabel,
            style: TextStyle(fontSize: 14, color: velocityColor),
          ),
          const SizedBox(height: 12),
          _Row(label: 'Remaining (raw)', value: '${t.remainingHours.round()}h'),
          _Row(
            label: 'Adjusted remaining',
            value: '${t.adjustedRemainingHours.round()}h',
            accent: velocityColor,
          ),
          _Row(label: 'Weekly commitment', value: '${t.weeklyHours.round()}h/week'),
          if (t.estimatedWeeksRemaining != null)
            _Row(
              label: 'Estimated weeks left',
              value: '~${t.estimatedWeeksRemaining}w',
            ),
          if (t.estimatedCompletionDate != null)
            _Row(
              label: 'Target date',
              value: t.estimatedCompletionDate!,
              accent: const Color(0xFF5A9B6A),
            ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              const Text('HOURS COMPLETED', style: _gaugeLabel),
              Text(
                '${t.completedHours.round()}h / ${t.totalHours.round()}h',
                style: _gaugeLabel,
              ),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: hoursProgress,
              minHeight: 6,
              backgroundColor: AppColors.hover,
              color: const Color(0xFF5A9B6A),
            ),
          ),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({
    required this.label,
    required this.value,
    this.accent,
  });

  final String label;
  final String value;
  final Color? accent;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE8E2D9))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[
          Text(label, style: const TextStyle(fontSize: 14, color: Color(0xFF3A342E))),
          Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontFamily: 'monospace',
              fontWeight: FontWeight.w600,
              color: accent ?? AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

const _gaugeLabel = TextStyle(
  fontSize: 9,
  fontFamily: 'monospace',
  color: Color(0xFFC2B9A6),
);
