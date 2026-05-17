import 'package:flutter/material.dart';

import '../../core/utils/format.dart';

class OutcomeScreen extends StatelessWidget {
  const OutcomeScreen({required this.score, super.key});

  final double score;

  @override
  Widget build(BuildContext context) {
    final passed = score >= 0.7;

    return Scaffold(
      appBar: AppBar(title: const Text('Quiz Outcome')),
      body: Center(
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Icon(
                  passed
                      ? Icons.check_circle_outline
                      : Icons.warning_amber_rounded,
                  size: 32,
                ),
                const SizedBox(height: 10),
                Text(
                  passed ? 'Pass' : 'Needs review',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 6),
                Text('Score: ${Format.percent(score)}'),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
