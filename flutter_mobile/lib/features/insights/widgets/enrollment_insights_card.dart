import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/insights_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/format.dart';
import '../../catalog/domain_meta.dart';

class EnrollmentInsightsCard extends StatelessWidget {
  const EnrollmentInsightsCard({
    required this.breakdown,
    required this.onTap,
    super.key,
  });

  final EnrollmentBreakdown breakdown;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final meta = domainMetaForSlug(breakdown.domainSlug);
    final completion = breakdown.completionPercent.clamp(0, 100);
    final barColor = completion >= 80
        ? const Color(0xFF5A9B6A)
        : completion >= 40
            ? AppColors.accent
            : const Color(0xFFB0A898);

    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(13),
                ),
                child: LinearProgressIndicator(
                  value: completion / 100,
                  minHeight: 5,
                  backgroundColor: AppColors.hover,
                  color: barColor,
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: meta.background,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            meta.icon,
                            style: TextStyle(
                              fontSize: 16,
                              color: meta.accent,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            breakdown.domainName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ),
                        Text(
                          '${completion.round()}%',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w600,
                            color: AppColors.accent,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${breakdown.masteredNodes} / ${breakdown.totalNodes} mastered',
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF6E645A),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 12,
                      children: <Widget>[
                        if (breakdown.avgScore != null)
                          Text(
                            'avg ${breakdown.avgScore!.round()}% quiz',
                            style: const TextStyle(
                              fontSize: 11,
                              fontFamily: 'monospace',
                              color: Color(0xFF5A9B6A),
                            ),
                          ),
                        if (breakdown.lastActiveAt != null)
                          Text(
                            Format.timeAgo(breakdown.lastActiveAt!),
                            style: const TextStyle(
                              fontSize: 11,
                              fontFamily: 'monospace',
                              color: AppColors.textMuted,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class InsightsPageHeader extends StatelessWidget {
  const InsightsPageHeader({
    required this.eyebrow,
    required this.title,
    this.subtitle,
    this.action,
    super.key,
  });

  final String eyebrow;
  final String title;
  final String? subtitle;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(bottom: BorderSide(color: Color(0xFFE8E2D9))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          if (action != null) ...<Widget>[
            Align(alignment: Alignment.centerRight, child: action!),
            const SizedBox(height: 4),
          ],
          Text(
            eyebrow.toUpperCase(),
            style: const TextStyle(
              fontSize: 11,
              letterSpacing: 1.2,
              fontFamily: 'monospace',
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: const TextStyle(
              fontSize: 30,
              height: 1.15,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          if (subtitle != null) ...<Widget>[
            const SizedBox(height: 6),
            Text(
              subtitle!,
              style: const TextStyle(fontSize: 14, color: Color(0xFF6E645A)),
            ),
          ],
        ],
      ),
    );
  }
}

/// Back-to-roadmap pill used on enrollment insights.
class BackToRoadmapButton extends StatelessWidget {
  const BackToRoadmapButton({required this.enrollmentId, super.key});

  final String enrollmentId;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: () => context.go('/enrollments/$enrollmentId/roadmap'),
      style: OutlinedButton.styleFrom(
        foregroundColor: const Color(0xFF6E645A),
        side: const BorderSide(color: Color(0xFFC2B9A6)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      ),
      child: const Text('← Back to roadmap', style: TextStyle(fontSize: 13)),
    );
  }
}
