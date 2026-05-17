import 'package:flutter/material.dart';

import '../../widgets/feature_placeholder.dart';

class LearnerListScreen extends StatelessWidget {
  const LearnerListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const FeaturePlaceholder(
      title: 'Learners',
      description:
          'Instructor cohort list with enrollment snapshots, mastery status, and review-needed indicators.',
    );
  }
}
