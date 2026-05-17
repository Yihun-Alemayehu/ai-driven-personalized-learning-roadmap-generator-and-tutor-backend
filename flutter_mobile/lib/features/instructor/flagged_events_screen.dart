import 'package:flutter/material.dart';

import '../../widgets/feature_placeholder.dart';

class FlaggedEventsScreen extends StatelessWidget {
  const FlaggedEventsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const FeaturePlaceholder(
      title: 'Flagged Events',
      description:
          'Review and resolve anomalies such as repeated failures, stalled progress, and suspicious attempts.',
    );
  }
}
