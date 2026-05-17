import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';

class FeaturePlaceholder extends StatelessWidget {
  const FeaturePlaceholder({
    required this.title,
    required this.description,
    this.action,
    super.key,
  });

  final String title;
  final String description;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: <Widget>[
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(title, style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 8),
                Text(description, style: Theme.of(context).textTheme.bodyLarge),
                if (action != null) ...<Widget>[
                  const SizedBox(height: 16),
                  action!,
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Text(
            'Phase 0 scaffold placeholder wired to router, providers, and theme.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),
      ],
    );
  }
}
