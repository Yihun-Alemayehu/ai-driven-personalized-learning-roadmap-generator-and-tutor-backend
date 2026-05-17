import 'package:flutter/material.dart';

import '../../widgets/feature_placeholder.dart';

class LearnerProgressScreen extends StatelessWidget {
  const LearnerProgressScreen({required this.learnerId, super.key});

  final String learnerId;

  @override
  Widget build(BuildContext context) {
    return FeaturePlaceholder(
      title: 'Learner Progress',
      description:
          'Learner $learnerId. Includes roadmap mastery states, quiz history, and flags.',
    );
  }
}
