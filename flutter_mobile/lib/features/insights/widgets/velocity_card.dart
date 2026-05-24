import 'package:flutter/material.dart';

import '../../../core/models/insights_models.dart';

/// Card showing learning velocity and trend
class VelocityCard extends StatelessWidget {
  final VelocityStats velocity;

  const VelocityCard({required this.velocity, super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.speed, size: 20, color: Colors.grey[600]),
                const SizedBox(width: 8),
                Text(
                  'Learning Velocity',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _velocityItem(
                    'Nodes/week',
                    velocity.nodesPerWeek.toStringAsFixed(1),
                    Icons.account_tree,
                  ),
                ),
                Expanded(
                  child: _velocityItem(
                    'Quizzes/week',
                    velocity.quizzesPerWeek.toStringAsFixed(1),
                    Icons.quiz,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _trendIndicator(velocity.trend),
          ],
        ),
      ),
    );
  }

  Widget _velocityItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, size: 32, color: Colors.blue),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _trendIndicator(String trend) {
    final (icon, color, text) = switch (trend) {
      'improving' => (Icons.trending_up, Colors.green, 'Improving'),
      'declining' => (Icons.trending_down, Colors.red, 'Declining'),
      _ => (Icons.trending_flat, Colors.orange, 'Stable'),
    };

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 8),
          Text(
            text,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
