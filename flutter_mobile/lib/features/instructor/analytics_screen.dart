import 'package:flutter/material.dart';

import '../../widgets/feature_placeholder.dart';

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const FeaturePlaceholder(
      title: 'Analytics',
      description:
          'Instructor analytics charts for completion trends, score distribution, and decay risk.',
    );
  }
}
