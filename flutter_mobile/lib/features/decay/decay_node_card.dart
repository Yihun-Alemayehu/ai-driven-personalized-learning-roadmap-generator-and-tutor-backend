import 'package:flutter/material.dart';

import '../../core/models/decay_status.dart';

class DecayNodeCard extends StatelessWidget {
  const DecayNodeCard({
    required this.node,
    required this.onReview,
    super.key,
  });

  final DecayNodeStatus node;
  final VoidCallback onReview;

  Color _getStateColor() {
    return switch (node.masteryState) {
      'relearn' => Colors.red,
      'review_needed' => Colors.orange,
      _ => Colors.grey,
    };
  }

  String _getStateLabel() {
    return switch (node.masteryState) {
      'relearn' => 'Relearn needed',
      'review_needed' => 'Review needed',
      _ => node.masteryState,
    };
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final stateColor = _getStateColor();

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    node.title,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: stateColor.withAlpha(26),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _getStateLabel(),
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: stateColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.schedule, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text(
                  '${node.daysSinceReview} days since review',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
                const Spacer(),
                if (node.decayLevel > 0.5)
                  Icon(Icons.trending_down, size: 16, color: stateColor),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: onReview,
                icon: const Icon(Icons.quiz),
                label: const Text('Review now'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: stateColor,
                  foregroundColor: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
