import 'package:flutter/material.dart';

import '../../widgets/feature_placeholder.dart';

class QuizScreen extends StatelessWidget {
  const QuizScreen({required this.nodeId, super.key});

  final String nodeId;

  @override
  Widget build(BuildContext context) {
    return FeaturePlaceholder(
      title: 'Quiz',
      description:
          'Node $nodeId. Full-screen MCQ flow with timer, progress bar, and adaptive gatekeeper result.',
    );
  }
}
