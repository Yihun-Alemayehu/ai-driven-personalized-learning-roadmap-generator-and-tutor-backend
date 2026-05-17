import 'package:flutter/material.dart';

import '../../widgets/feature_placeholder.dart';

class UserManagementScreen extends StatelessWidget {
  const UserManagementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const FeaturePlaceholder(
      title: 'User Management',
      description:
          'Create, edit, suspend, and role-assign users from a searchable, paginated table.',
    );
  }
}
