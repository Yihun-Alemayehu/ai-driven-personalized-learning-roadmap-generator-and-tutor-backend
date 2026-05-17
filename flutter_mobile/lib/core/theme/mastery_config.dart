import 'package:flutter/material.dart';

enum MasteryState {
  notStarted,
  inProgress,
  mastered,
  reviewNeeded,
  relearn,
  locked,
}

class MasteryConfig {
  const MasteryConfig._();

  static const Map<MasteryState, Color> colors = {
    MasteryState.notStarted: Color(0xFF9A9088),
    MasteryState.inProgress: Color(0xFF4A7FB5),
    MasteryState.mastered: Color(0xFF3D8B5E),
    MasteryState.reviewNeeded: Color(0xFFB8860B),
    MasteryState.relearn: Color(0xFFB85C38),
    MasteryState.locked: Color(0xFFCCC5BC),
  };

  static const Map<MasteryState, String> labels = {
    MasteryState.notStarted: 'Not started',
    MasteryState.inProgress: 'In progress',
    MasteryState.mastered: 'Mastered',
    MasteryState.reviewNeeded: 'Review needed',
    MasteryState.relearn: 'Relearn',
    MasteryState.locked: 'Locked',
  };

  static const Map<MasteryState, IconData> icons = {
    MasteryState.notStarted: Icons.circle_outlined,
    MasteryState.inProgress: Icons.timelapse,
    MasteryState.mastered: Icons.check_circle_outline,
    MasteryState.reviewNeeded: Icons.refresh,
    MasteryState.relearn: Icons.priority_high,
    MasteryState.locked: Icons.lock_outline,
  };

  static MasteryState stateFromApi(String? value) {
    switch (value) {
      case 'not_started':
      case 'notStarted':
        return MasteryState.notStarted;
      case 'in_progress':
      case 'inProgress':
        return MasteryState.inProgress;
      case 'mastered':
        return MasteryState.mastered;
      case 'review_needed':
      case 'reviewNeeded':
        return MasteryState.reviewNeeded;
      case 'relearn':
        return MasteryState.relearn;
      case 'locked':
        return MasteryState.locked;
      default:
        return MasteryState.notStarted;
    }
  }
}
