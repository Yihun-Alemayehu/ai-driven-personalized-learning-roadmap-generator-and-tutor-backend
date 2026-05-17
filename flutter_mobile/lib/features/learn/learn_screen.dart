import 'package:flutter/material.dart';

import '../../widgets/feature_placeholder.dart';

class LearnScreen extends StatelessWidget {
  const LearnScreen({
    required this.enrollmentId,
    required this.nodeId,
    super.key,
  });

  final String enrollmentId;
  final String nodeId;

  @override
  Widget build(BuildContext context) {
    return FeaturePlaceholder(
      title: 'Learning Workspace',
      description:
          'Enrollment $enrollmentId, node $nodeId. Combines content, AI explanation panel, and resource tabs.',
    );
  }
}
