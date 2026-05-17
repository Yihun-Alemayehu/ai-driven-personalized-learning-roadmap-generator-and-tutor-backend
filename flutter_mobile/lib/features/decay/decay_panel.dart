import 'package:flutter/material.dart';

class DecayPanel extends StatelessWidget {
  const DecayPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text('Decay Alerts', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(
              'Upcoming review tasks and retention risk indicators appear here.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
