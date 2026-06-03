import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/enrollment_with_stats_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/format.dart';
import '../catalog/domain_meta.dart';

class EnrolledDomainCard extends StatelessWidget {
  const EnrolledDomainCard({
    required this.enrollment,
    required this.onTap,
    super.key,
  });

  final EnrollmentWithStats enrollment;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final meta = domainMetaForSlug(enrollment.enrollment.domain.slug);
    final totalNodes = enrollment.totalNodes;
    final enrolledLabel = enrollment.enrollment.enrolledAt != null
        ? 'enrolled ${Format.timeAgo(enrollment.enrollment.enrolledAt!)}'
        : 'enrolled recently';
    final progress = enrollment.progressPercent.clamp(0.0, 1.0);

    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Row(
              children: <Widget>[
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: meta.background,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    meta.icon,
                    style: TextStyle(
                      fontSize: 20,
                      color: meta.accent,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        enrollment.domainTitle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        totalNodes > 0
                            ? '$totalNodes nodes · $enrolledLabel'
                            : enrolledLabel,
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 10),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(999),
                        child: LinearProgressIndicator(
                          value: progress,
                          minHeight: 6,
                          backgroundColor: const Color(0xFFD6CFBF),
                          color: meta.accent,
                        ),
                      ),
                      if (totalNodes > 0) ...<Widget>[
                        const SizedBox(height: 6),
                        Text(
                          '${enrollment.masteredNodes} / $totalNodes mastered · ${Format.percent(progress)}',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Icon(
                  Icons.arrow_forward,
                  size: 16,
                  color: AppColors.textMuted,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class DashboardEmptyState extends StatelessWidget {
  const DashboardEmptyState({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
      decoration: BoxDecoration(
        color: const Color(0xFFF3EFE7),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.border,
          style: BorderStyle.solid,
        ),
      ),
      child: Column(
        children: <Widget>[
          Text(
            'No enrollments yet',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.textBody,
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose a domain to begin your personalised learning journey.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textMuted,
                ),
          ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: () => context.go('/catalog'),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.accent,
              foregroundColor: AppColors.background,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('Browse Domains →'),
          ),
        ],
      ),
    );
  }
}
