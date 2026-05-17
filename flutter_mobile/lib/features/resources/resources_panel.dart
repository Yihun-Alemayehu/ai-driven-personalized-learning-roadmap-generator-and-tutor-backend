import 'package:flutter/material.dart';

class ResourcesPanel extends StatelessWidget {
  const ResourcesPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text('Resources', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            const ListTile(
              title: Text('Reference article'),
              subtitle: Text('Curated reading for the current node'),
            ),
          ],
        ),
      ),
    );
  }
}
