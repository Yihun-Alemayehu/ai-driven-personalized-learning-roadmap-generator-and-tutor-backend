import 'package:flutter/material.dart';

import '../../../core/models/insights_models.dart';

/// Panel showing weak areas that need practice
class WeakAreasPanel extends StatelessWidget {
  final List<WeakArea> weakAreas;
  final Function(String nodeId) onNodeTap;

  const WeakAreasPanel({
    required this.weakAreas,
    required this.onNodeTap,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (weakAreas.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Icon(Icons.celebration, size: 48, color: Colors.green[300]),
              const SizedBox(height: 16),
              Text(
                'No weak areas - you\'re doing great!',
                style: theme.textTheme.titleMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            leading: Icon(Icons.warning_amber, color: Colors.orange[700]),
            title: Text(
              'Focus Areas',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            subtitle: const Text('Topics that need more practice'),
          ),
          const Divider(height: 1),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: weakAreas.take(5).length,
            itemBuilder: (context, index) {
              final area = weakAreas[index];
              return ListTile(
                leading: Icon(
                  Icons.warning,
                  color: area.needsAttention ? Colors.red : Colors.orange,
                ),
                title: Text(area.nodeTitle),
                subtitle: Text(
                  '${area.failCount} failed attempt${area.failCount > 1 ? 's' : ''}',
                  style: TextStyle(
                    color: area.needsAttention ? Colors.red[300] : Colors.orange[300],
                  ),
                ),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => onNodeTap(area.nodeId),
              );
            },
          ),
        ],
      ),
    );
  }
}
