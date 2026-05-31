import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

/// Warm catalog search matching web DomainCatalogPage input styling.
class CatalogSearchField extends StatelessWidget {
  const CatalogSearchField({
    required this.controller,
    required this.onChanged,
    this.onClear,
    super.key,
  });

  final TextEditingController controller;
  final ValueChanged<String> onChanged;
  final VoidCallback? onClear;

  @override
  Widget build(BuildContext context) {
    final hasText = controller.text.isNotEmpty;

    return TextField(
      controller: controller,
      onChanged: onChanged,
      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppColors.textBody,
            fontSize: 15,
          ),
      decoration: InputDecoration(
        hintText: 'Search domains…',
        hintStyle: TextStyle(
          color: AppColors.textMuted.withValues(alpha: 0.9),
          fontSize: 15,
        ),
        prefixIcon: Icon(
          Icons.search,
          size: 20,
          color: AppColors.textMuted,
        ),
        suffixIcon: hasText
            ? IconButton(
                icon: Icon(Icons.close, size: 18, color: AppColors.textMuted),
                onPressed: onClear,
                tooltip: 'Clear search',
              )
            : null,
        filled: true,
        fillColor: AppColors.background,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: AppColors.accent.withValues(alpha: 0.85)),
        ),
      ),
    );
  }
}
