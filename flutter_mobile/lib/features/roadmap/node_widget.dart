import 'package:flutter/material.dart';

import '../../core/models/roadmap_node.dart';
import '../../core/theme/mastery_config.dart';

class RoadmapNodeWidget extends StatelessWidget {
  const RoadmapNodeWidget({
    required this.node,
    required this.isActive,
    required this.onTap,
    super.key,
  });

  final RoadmapNode node;
  final bool isActive;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final color = MasteryConfig.colors[node.masteryState] ?? Colors.grey;
    final icon =
        MasteryConfig.icons[node.masteryState] ?? Icons.circle_outlined;
    final content = AnimatedScale(
      duration: const Duration(milliseconds: 160),
      scale: isActive ? 1.03 : 1,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        width: 176,
        constraints: const BoxConstraints(minHeight: 88),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          color: color.withValues(alpha: 0.1),
          border: Border.all(
            color: color,
            width: isActive ? 2.2 : 1.4,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Text(
                    node.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    MasteryConfig.labels[node.masteryState] ?? 'Unknown',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: color,
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                ],
              ),
            ),
            Icon(icon, color: color, size: 18),
          ],
        ),
      ),
    );

    final locked = !node.unlocked;

    return IgnorePointer(
      ignoring: locked,
      child: Opacity(
        opacity: locked ? 0.45 : 1,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(10),
          child: content,
        ),
      ),
    );
  }
}
