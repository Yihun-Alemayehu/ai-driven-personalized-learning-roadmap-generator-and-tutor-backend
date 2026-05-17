import 'package:flutter/material.dart';

import '../../widgets/feature_placeholder.dart';

class AttemptReviewScreen extends StatelessWidget {
  const AttemptReviewScreen({required this.attemptId, super.key});

  final String attemptId;

  @override
  Widget build(BuildContext context) {
    return FeaturePlaceholder(
      title: 'Attempt Review',
      description:
          'Attempt $attemptId. Displays per-question correctness and remediation hints.',
    );
  }
}
