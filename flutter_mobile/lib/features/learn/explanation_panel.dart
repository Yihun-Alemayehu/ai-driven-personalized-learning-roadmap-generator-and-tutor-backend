import 'package:flutter/material.dart';

class ExplanationPanel extends StatelessWidget {
  const ExplanationPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Text(
          'AI explanation output appears here with summary, analogies, and examples.',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      ),
    );
  }
}
