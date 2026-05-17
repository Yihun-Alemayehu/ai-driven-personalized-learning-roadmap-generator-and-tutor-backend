import 'package:flutter/material.dart';

import '../../widgets/feature_placeholder.dart';

class DomainManagementScreen extends StatelessWidget {
  const DomainManagementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const FeaturePlaceholder(
      title: 'Domain Management',
      description:
          'Manage domain metadata, ontology links, and publishing workflows for learning paths.',
    );
  }
}
