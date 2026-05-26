import 'package:flutter/material.dart';

import '../../../core/models/insights_models.dart';

/// 30-day activity heatmap grid
class ActivityHeatmap extends StatelessWidget {
  final List<ActivityDay> days;

  const ActivityHeatmap({required this.days, super.key});

  @override
  Widget build(BuildContext context) {
    // Show last 30 days
    final displayDays = days.take(30).toList();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.calendar_view_week, size: 20, color: Colors.grey[600]),
                const SizedBox(width: 8),
                Text(
                  'Activity',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 4,
              runSpacing: 4,
              children: displayDays.map((day) {
                return Tooltip(
                  message: '${_formatDate(day.date)}: ${day.xpEarned} XP',
                  child: Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: day.getIntensityColor(),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 12),
            // Legend
            Row(
              children: [
                _legendItem(Colors.grey[100]!, 'None'),
                _legendItem(Colors.green[100]!, 'Light'),
                _legendItem(Colors.green[300]!, 'Medium'),
                _legendItem(Colors.green[500]!, 'High'),
                _legendItem(Colors.green[700]!, 'Intense'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _legendItem(Color color, String label) {
    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 11)),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.month}/${date.day}';
  }
}
