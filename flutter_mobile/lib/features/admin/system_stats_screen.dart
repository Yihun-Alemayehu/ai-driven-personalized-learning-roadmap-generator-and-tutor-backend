import 'package:flutter/material.dart';

import '../../widgets/feature_placeholder.dart';

class SystemStatsScreen extends StatelessWidget {
  const SystemStatsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const FeaturePlaceholder(
      title: 'System Stats',
      description:
          'Global metrics for traffic, enrollments, quiz attempts, and health indicators.',
    );
  }
}
