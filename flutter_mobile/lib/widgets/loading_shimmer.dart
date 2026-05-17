import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../core/theme/app_colors.dart';

class LoadingShimmer extends StatelessWidget {
  const LoadingShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemBuilder: (_, __) {
        return Shimmer.fromColors(
          baseColor: AppColors.surface,
          highlightColor: AppColors.hover,
          child: Container(
            height: 88,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        );
      },
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemCount: 6,
    );
  }
}
