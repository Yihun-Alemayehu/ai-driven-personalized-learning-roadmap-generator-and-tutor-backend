import 'package:flutter/material.dart';

import '../../../core/models/insights_models.dart';

/// Profile card showing completion and mastery stats
class ProfileCard extends StatelessWidget {
  final ProfileStats profile;
  final String domainName;

  const ProfileCard({
    required this.profile,
    required this.domainName,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              domainName,
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: profile.completionPercentage / 100,
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation(theme.colorScheme.primary),
                minHeight: 10,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '${profile.completionPercentage.toInt()}% Complete',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _statItem('Mastered', profile.masteredNodes, Colors.green),
                _statItem('In Progress', profile.inProgressNodes, Colors.blue),
                _statItem('Not Started', profile.notStartedNodes, Colors.grey),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _statItem(String label, int value, Color color) {
    return Column(
      children: [
        Text(
          value.toString(),
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 12),
        ),
      ],
    );
  }
}
