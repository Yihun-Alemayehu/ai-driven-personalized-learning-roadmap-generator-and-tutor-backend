import 'package:flutter/material.dart';

import '../../widgets/feature_placeholder.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const FeaturePlaceholder(
      title: 'Notifications',
      description:
          'Local reminders, mastery alerts, and backend notifications are listed in chronological order.',
    );
  }
}
