import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/mastery_config.dart';

/// Floating mastery legend; parent must position (e.g. [Align] in a [Stack]).
class MasteryLegend extends StatefulWidget {
  const MasteryLegend({super.key});

  @override
  State<MasteryLegend> createState() => _MasteryLegendState();
}

class _MasteryLegendState extends State<MasteryLegend> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        if (_isExpanded) ...<Widget>[
          _LegendPanel(
            onClose: () => setState(() => _isExpanded = false),
          ),
          const SizedBox(height: 10),
        ],
        Material(
          elevation: 4,
          shadowColor: Colors.black.withValues(alpha: 0.12),
          color: AppColors.accent,
          shape: const CircleBorder(),
          child: InkWell(
            onTap: () => setState(() => _isExpanded = !_isExpanded),
            customBorder: const CircleBorder(),
            child: SizedBox(
              width: 52,
              height: 52,
              child: Icon(
                _isExpanded ? Icons.close : Icons.info_outline,
                color: Colors.white,
                size: 26,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _LegendPanel extends StatelessWidget {
  const _LegendPanel({required this.onClose});

  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      elevation: 8,
      shadowColor: Colors.black.withValues(alpha: 0.1),
      color: AppColors.background,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 240),
        padding: const EdgeInsets.fromLTRB(16, 14, 12, 14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Row(
              children: <Widget>[
                Text(
                  'Mastery legend',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const Spacer(),
                IconButton(
                  visualDensity: VisualDensity.compact,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  icon: Icon(
                    Icons.expand_more,
                    size: 20,
                    color: AppColors.textMuted,
                  ),
                  onPressed: onClose,
                ),
              ],
            ),
            const SizedBox(height: 8),
            _LegendRow(
              color: MasteryConfig.colors[MasteryState.mastered]!,
              label: 'Mastered',
            ),
            _LegendRow(
              color: MasteryConfig.colors[MasteryState.inProgress]!,
              label: 'In progress',
            ),
            _LegendRow(
              color: AppColors.textMuted,
              label: 'Next up / Available',
            ),
            _LegendRow(
              color: MasteryConfig.colors[MasteryState.reviewNeeded]!,
              label: 'Review needed',
            ),
            _LegendRow(
              color: AppColors.accent,
              label: 'Relearn',
            ),
            _LegendRow(
              color: MasteryConfig.colors[MasteryState.locked]!,
              label: 'Locked',
            ),
          ],
        ),
      ),
    );
  }
}

class _LegendRow extends StatelessWidget {
  const _LegendRow({required this.color, required this.label});

  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 10),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.textBody,
                ),
          ),
        ],
      ),
    );
  }
}
