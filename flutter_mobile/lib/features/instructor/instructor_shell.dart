import 'package:flutter/material.dart';

import '../../widgets/feature_placeholder.dart';

class InstructorShell extends StatelessWidget {
  const InstructorShell({super.key});

  @override
  Widget build(BuildContext context) {
    return const FeaturePlaceholder(
      title: 'Instructor Workspace',
      description:
          'Container for learner list, analytics, and flagged-events tabs for cohort oversight.',
    );
  }
}
