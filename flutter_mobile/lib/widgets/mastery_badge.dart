import 'package:flutter/material.dart';

import '../core/theme/mastery_config.dart';

class MasteryBadge extends StatelessWidget {
  const MasteryBadge({required this.state, super.key});

  final MasteryState state;

  @override
  Widget build(BuildContext context) {
    final color = MasteryConfig.colors[state] ?? Colors.grey;
    final label = MasteryConfig.labels[state] ?? state.name;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}
