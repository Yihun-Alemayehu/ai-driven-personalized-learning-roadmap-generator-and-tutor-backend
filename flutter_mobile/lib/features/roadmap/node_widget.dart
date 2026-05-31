import 'package:flutter/material.dart';

import '../../core/models/roadmap_data.dart';
import '../../core/models/roadmap_node.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/mastery_config.dart';
import 'roadmap_node_presentation.dart';

class RoadmapNodeWidget extends StatelessWidget {
  const RoadmapNodeWidget({
    required this.node,
    required this.roadmap,
    required this.isActive,
    required this.isNextUp,
    required this.onTap,
    super.key,
  });

  final RoadmapNode node;
  final RoadmapData roadmap;
  final bool isActive;
  final bool isNextUp;
  final VoidCallback? onTap;

  static const double cardWidth = 220;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final style = RoadmapNodePresentation.cardStyle(
      node: node,
      roadmap: roadmap,
      isActive: isActive,
      isNextUp: isNextUp,
    );
    final label = RoadmapNodePresentation.displayLabel(
      node: node,
      roadmap: roadmap,
      isNextUp: isNextUp,
    );
    final icon = RoadmapNodePresentation.displayIcon(
      node: node,
      roadmap: roadmap,
      isNextUp: isNextUp,
    );
    final accent = RoadmapNodePresentation.accentColor(
      node,
      isNextUp: isNextUp,
    );

    final content = AnimatedScale(
      duration: const Duration(milliseconds: 180),
      scale: style.scale,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        width: cardWidth,
        constraints: const BoxConstraints(minHeight: 96),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: style.backgroundColor,
          border: Border.all(
            color: style.borderColor,
            width: style.borderWidth,
          ),
          boxShadow: style.showGlow
              ? <BoxShadow>[
                  BoxShadow(
                    color: style.borderColor.withValues(alpha: 0.22),
                    blurRadius: 20,
                    spreadRadius: 0,
                  ),
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : style.dimmed
                  ? null
                  : <BoxShadow>[
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Icon(icon, color: accent, size: 22),
                const Spacer(),
                _StatusChip(label: label, color: accent),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              node.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: node.unlocked && !style.dimmed
                    ? AppColors.textPrimary
                    : AppColors.textMuted,
                height: 1.2,
              ),
            ),
            if (node.masteryState == MasteryState.inProgress &&
                node.bestQuizScore != null) ...<Widget>[
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(99),
                child: LinearProgressIndicator(
                  value: (node.bestQuizScore! / 100).clamp(0.0, 1.0),
                  minHeight: 4,
                  backgroundColor: AppColors.hover,
                  valueColor: AlwaysStoppedAnimation<Color>(accent),
                ),
              ),
            ],
            if (node.description != null &&
                node.description!.trim().isNotEmpty) ...<Widget>[
              const SizedBox(height: 6),
              Text(
                node.description!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: AppColors.textMuted,
                  height: 1.25,
                ),
              ),
            ],
          ],
        ),
      ),
    );

    final locked = !node.unlocked;

    return IgnorePointer(
      ignoring: locked,
      child: Opacity(
        opacity: style.dimmed ? 0.42 : 1,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(12),
            child: content,
          ),
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(99),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
              fontSize: 11,
            ),
      ),
    );
  }
}
