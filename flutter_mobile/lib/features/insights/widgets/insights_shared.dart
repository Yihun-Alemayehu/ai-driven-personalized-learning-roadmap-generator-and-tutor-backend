import 'package:flutter/material.dart';

import '../../../core/models/insights_models.dart';
import '../../../core/theme/app_colors.dart';

class InsightsSectionTitle extends StatelessWidget {
  const InsightsSectionTitle(this.label, {super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        label.toUpperCase(),
        style: const TextStyle(
          fontSize: 13,
          letterSpacing: 1.4,
          fontFamily: 'monospace',
          color: AppColors.textMuted,
        ),
      ),
    );
  }
}

class InsightsCard extends StatelessWidget {
  const InsightsCard({
    required this.child,
    this.padding = const EdgeInsets.all(16),
    super.key,
  });

  final Widget child;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: child,
    );
  }
}

class InsightsStatBox extends StatelessWidget {
  const InsightsStatBox({
    required this.value,
    required this.label,
    this.accent,
    this.sub,
    super.key,
  });

  final String value;
  final String label;
  final Color? accent;
  final String? sub;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            value,
            style: TextStyle(
              fontSize: 32,
              height: 1,
              fontWeight: FontWeight.w600,
              color: accent ?? AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 11,
              letterSpacing: 0.8,
              fontFamily: 'monospace',
              color: AppColors.textMuted,
            ),
          ),
          if (sub != null) ...<Widget>[
            const SizedBox(height: 4),
            Text(
              sub!,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF6E645A),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// 2×2 on phones, 4-across on wider screens (matches web grid-cols-2 / sm:grid-cols-4).
class InsightsStatGrid extends StatelessWidget {
  const InsightsStatGrid({required this.children, super.key});

  final List<Widget> children;

  static const _spacing = 10.0;
  static const _wideBreakpoint = 560.0;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final maxWidth = constraints.maxWidth.isFinite
            ? constraints.maxWidth
            : MediaQuery.sizeOf(context).width;
        final columns = maxWidth >= _wideBreakpoint ? 4 : 2;
        final itemWidth =
            (maxWidth - _spacing * (columns - 1)) / columns;

        return Wrap(
          spacing: _spacing,
          runSpacing: _spacing,
          alignment: WrapAlignment.start,
          children: children
              .map(
                (child) => SizedBox(width: itemWidth, child: child),
              )
              .toList(),
        );
      },
    );
  }
}

class InsightsMomentumBanner extends StatelessWidget {
  const InsightsMomentumBanner({
    required this.momentum,
    this.compact = false,
    super.key,
  });

  final Momentum momentum;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final trend = momentum.trend;
    final recent = momentum.recentMasteries;
    final prev = momentum.prevMasteries;

    final (icon, color, label) = switch (trend) {
      'up' => (
          '↑',
          const Color(0xFF5A9B6A),
          compact
              ? '$recent masteries this week — up from $prev last week'
              : 'More active than last week',
        ),
      'down' => (
          '↓',
          AppColors.accent,
          compact
              ? '$recent masteries this week — down from $prev last week'
              : 'Less active than last week',
        ),
      _ => (
          '→',
          AppColors.textMuted,
          compact
              ? '$recent masteries this week — steady pace'
              : 'Same pace as last week',
        ),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(icon, style: TextStyle(fontSize: 20, color: color)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                if (!compact) ...<Widget>[
                  const SizedBox(height: 2),
                  Text(
                    '$recent nodes mastered this week'
                        '${prev > 0 ? ' (vs $prev last week)' : ''}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontFamily: 'monospace',
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class DifficultyDots extends StatelessWidget {
  const DifficultyDots({this.level, super.key});

  final int? level;

  @override
  Widget build(BuildContext context) {
    if (level == null) return const SizedBox.shrink();
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List<Widget>.generate(5, (i) {
        return Container(
          width: 6,
          height: 6,
          margin: EdgeInsets.only(left: i == 0 ? 0 : 2),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: i < level! ? AppColors.accent : AppColors.border,
          ),
        );
      }),
    );
  }
}
