import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/enrollment.dart';
import '../../../core/providers/insights_provider.dart';
import '../../../core/providers/settings_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../catalog/domain_meta.dart';

class EnrollmentPreferenceCard extends ConsumerWidget {
  const EnrollmentPreferenceCard({required this.enrollment, super.key});

  final Enrollment enrollment;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final meta = domainMetaForSlug(enrollment.domain.slug);
    final statsAsync = ref.watch(insightsProgressStatsProvider(enrollment.id));

    final stats = statsAsync.valueOrNull;
    final completionPct = stats?.completionPercent ?? 0;
    final mastered = stats?.masteredCount ?? enrollment.masteredNodes ?? 0;
    final total = stats?.totalNodes ?? enrollment.totalNodes ?? 0;

    final hasPrefs = enrollment.familiarityLevel != null ||
        enrollment.learningGoal != null ||
        enrollment.weeklyHours != null ||
        (enrollment.aboutSelf != null && enrollment.aboutSelf!.isNotEmpty);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: const BoxDecoration(
              color: Color(0xFFF3EFE7),
              border: Border(bottom: BorderSide(color: Color(0xFFEBE6DB))),
            ),
            child: Row(
              children: <Widget>[
                Container(
                  width: 32,
                  height: 32,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: meta.background,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(meta.icon, style: const TextStyle(fontSize: 16)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    enrollment.domain.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                TextButton(
                  onPressed: () =>
                      context.go('/enrollments/${enrollment.id}/roadmap'),
                  style: TextButton.styleFrom(
                    backgroundColor: AppColors.textPrimary,
                    foregroundColor: AppColors.background,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text(
                    'Roadmap →',
                    style: TextStyle(fontSize: 11, fontFamily: 'monospace'),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
            child: Column(
              children: <Widget>[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    Text(
                      '$mastered / $total nodes mastered',
                      style: const TextStyle(
                        fontSize: 11,
                        fontFamily: 'monospace',
                        color: AppColors.textMuted,
                      ),
                    ),
                    Text(
                      '${completionPct.toStringAsFixed(0)}%',
                      style: const TextStyle(
                        fontSize: 11,
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF2D6A3E),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(999),
                  child: LinearProgressIndicator(
                    value: total > 0 ? (completionPct / 100).clamp(0.0, 1.0) : 0,
                    minHeight: 6,
                    backgroundColor: const Color(0xFFEBE6DB),
                    color: AppColors.accent,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
            child: hasPrefs
                ? Wrap(
                    spacing: 24,
                    runSpacing: 12,
                    children: <Widget>[
                      if (enrollment.familiarityLevel != null)
                        _PrefItem(
                          label: 'Starting level',
                          value: familiarityLabel(enrollment.familiarityLevel!),
                        ),
                      if (enrollment.learningGoal != null)
                        _PrefItem(
                          label: 'Goal',
                          value: learningGoalLabel(enrollment.learningGoal!),
                        ),
                      if (enrollment.weeklyHours != null)
                        _PrefItem(
                          label: 'Weekly hours',
                          value: '${enrollment.weeklyHours}h / week',
                        ),
                      if (enrollment.aboutSelf != null &&
                          enrollment.aboutSelf!.isNotEmpty)
                        SizedBox(
                          width: double.infinity,
                          child: _PrefItem(
                            label: 'About yourself',
                            value: enrollment.aboutSelf!,
                          ),
                        ),
                    ],
                  )
                : const Text(
                    'No preferences recorded at enrollment.',
                    style: TextStyle(
                      fontSize: 13,
                      fontStyle: FontStyle.italic,
                      color: Color(0xFFB0A898),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _PrefItem extends StatelessWidget {
  const _PrefItem({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontSize: 10,
            letterSpacing: 0.8,
            fontFamily: 'monospace',
            color: Color(0xFFB0A898),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(fontSize: 13, color: Color(0xFF3A342E)),
        ),
      ],
    );
  }
}
