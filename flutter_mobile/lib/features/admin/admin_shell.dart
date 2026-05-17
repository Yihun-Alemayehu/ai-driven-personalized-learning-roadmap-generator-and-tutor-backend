import 'package:flutter/material.dart';

import '../../widgets/feature_placeholder.dart';

class AdminShell extends StatelessWidget {
  const AdminShell({super.key});

  @override
  Widget build(BuildContext context) {
    return const FeaturePlaceholder(
      title: 'Admin Console',
      description:
          'Administrative workspace for user, domain, and system-level management tasks.',
    );
  }
}
