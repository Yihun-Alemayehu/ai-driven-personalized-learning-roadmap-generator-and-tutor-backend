import 'package:flutter/material.dart';

import '../../core/models/roadmap_data.dart';
import '../../core/models/roadmap_node.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/mastery_config.dart';

/// Visual and copy helpers for roadmap nodes (warm palette, design layout).
class RoadmapNodePresentation {
  const RoadmapNodePresentation._();

  static String? resolveNextUpNodeId(RoadmapData roadmap) {
    for (final node in roadmap.nodes) {
      if (node.unlocked &&
          node.masteryState == MasteryState.notStarted &&
          !_isElective(node, roadmap)) {
        return node.id;
      }
    }
    return null;
  }

  static bool isElective(RoadmapNode node, RoadmapData roadmap) {
    final path = node.branchPath;
    if (path == null || path.isEmpty) {
      return false;
    }
    final selected = roadmap.selectedBranchPath;
    if (selected == null || selected.isEmpty) {
      return node.isBranchingPoint == false && path.isNotEmpty;
    }
    return path != selected;
  }

  static bool _isElective(RoadmapNode node, RoadmapData roadmap) =>
      isElective(node, roadmap);

  /// Display chip label mapped from API mastery + unlock + next-up + elective.
  static String displayLabel({
    required RoadmapNode node,
    required RoadmapData roadmap,
    required bool isNextUp,
  }) {
    if (!node.unlocked) {
      return 'Locked';
    }
    if (isElective(node, roadmap) &&
        node.masteryState == MasteryState.notStarted) {
      return 'Elective';
    }
    if (isNextUp && node.masteryState == MasteryState.notStarted) {
      return 'Next up';
    }

    switch (node.masteryState) {
      case MasteryState.mastered:
        return 'Mastered';
      case MasteryState.inProgress:
        return 'In progress';
      case MasteryState.notStarted:
        return 'Available';
      case MasteryState.reviewNeeded:
        return 'Review needed';
      case MasteryState.relearn:
        return 'Relearn';
      case MasteryState.locked:
        return 'Locked';
    }
  }

  static IconData displayIcon({
    required RoadmapNode node,
    required RoadmapData roadmap,
    required bool isNextUp,
  }) {
    if (!node.unlocked) {
      return Icons.lock;
    }
    if (isElective(node, roadmap) &&
        node.masteryState == MasteryState.notStarted) {
      return Icons.star_outline;
    }
    if (isNextUp && node.masteryState == MasteryState.notStarted) {
      return Icons.lock_open_outlined;
    }
    return MasteryConfig.icons[node.masteryState] ?? Icons.circle_outlined;
  }

  static Color accentColor(RoadmapNode node, {required bool isNextUp}) {
    if (!node.unlocked) {
      return MasteryConfig.colors[MasteryState.locked]!;
    }
    if (isNextUp && node.masteryState == MasteryState.notStarted) {
      return AppColors.textMuted;
    }
    return MasteryConfig.colors[node.masteryState] ?? AppColors.textMuted;
  }

  static RoadmapNodeCardStyle cardStyle({
    required RoadmapNode node,
    required RoadmapData roadmap,
    required bool isActive,
    required bool isNextUp,
  }) {
    final locked = !node.unlocked;
    final elective = isElective(node, roadmap);

    if (locked) {
      return RoadmapNodeCardStyle(
        backgroundColor: AppColors.hover.withValues(alpha: 0.55),
        borderColor: AppColors.border,
        borderWidth: 1.5,
        dashedBorder: elective,
        dimmed: true,
        showGlow: false,
        scale: 1,
      );
    }

    switch (node.masteryState) {
      case MasteryState.mastered:
        return RoadmapNodeCardStyle(
          backgroundColor: const Color(0xFFE8F4EC),
          borderColor: MasteryConfig.colors[MasteryState.mastered]!,
          borderWidth: 2,
          dimmed: false,
          showGlow: false,
          scale: 1,
        );
      case MasteryState.inProgress:
        return RoadmapNodeCardStyle(
          backgroundColor: AppColors.background,
          borderColor: MasteryConfig.colors[MasteryState.inProgress]!,
          borderWidth: isActive ? 2.5 : 2,
          dimmed: false,
          showGlow: isActive,
          scale: isActive ? 1.06 : 1,
        );
      case MasteryState.reviewNeeded:
        return RoadmapNodeCardStyle(
          backgroundColor: const Color(0xFFFFF8E8),
          borderColor: MasteryConfig.colors[MasteryState.reviewNeeded]!,
          borderWidth: 2,
          dimmed: false,
          showGlow: isActive,
          scale: isActive ? 1.04 : 1,
        );
      case MasteryState.relearn:
        return RoadmapNodeCardStyle(
          backgroundColor: const Color(0xFFFFF0EB),
          borderColor: AppColors.accent,
          borderWidth: 2,
          dimmed: false,
          showGlow: isActive,
          scale: isActive ? 1.04 : 1,
        );
      case MasteryState.notStarted:
        return RoadmapNodeCardStyle(
          backgroundColor: elective
              ? const Color(0xFFFFF8F0)
              : isNextUp
                  ? AppColors.surface
                  : AppColors.surface.withValues(alpha: 0.9),
          borderColor: elective
              ? AppColors.accent
              : isNextUp
                  ? AppColors.textBody
                  : AppColors.border,
          borderWidth: elective || isNextUp ? 2 : 1.5,
          dashedBorder: elective,
          dimmed: false,
          showGlow: isActive && (isNextUp || elective),
          scale: isActive ? 1.04 : 1,
        );
      case MasteryState.locked:
        return RoadmapNodeCardStyle(
          backgroundColor: AppColors.hover.withValues(alpha: 0.55),
          borderColor: AppColors.border,
          borderWidth: 1.5,
          dimmed: true,
          showGlow: false,
          scale: 1,
        );
    }
  }

  /// Inset from the bottom of the roadmap canvas (legend floats inside graph area).
  static double legendBottomInset(BuildContext context) {
    return MediaQuery.paddingOf(context).bottom + 16;
  }
}

class RoadmapNodeCardStyle {
  const RoadmapNodeCardStyle({
    required this.backgroundColor,
    required this.borderColor,
    required this.borderWidth,
    this.dashedBorder = false,
    this.dimmed = false,
    this.showGlow = false,
    this.scale = 1,
  });

  final Color backgroundColor;
  final Color borderColor;
  final double borderWidth;
  final bool dashedBorder;
  final bool dimmed;
  final bool showGlow;
  final double scale;
}
