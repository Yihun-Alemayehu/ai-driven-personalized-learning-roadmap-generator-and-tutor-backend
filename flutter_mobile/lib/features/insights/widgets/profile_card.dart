import 'package:flutter/material.dart';

import '../../../core/models/insights_models.dart';
import '../../../core/theme/app_colors.dart';
import 'insights_shared.dart';

const _familiarityLabels = <String, String>{
  'beginner': 'Beginner — new to the field',
  'intermediate': 'Intermediate — some experience',
  'advanced': 'Advanced — solid foundation',
};

const _goalLabels = <String, ({String icon, String label})>{
  'get_job': (icon: '💼', label: 'Get a job'),
  'upskill': (icon: '📈', label: 'Upskill at work'),
  'hobby': (icon: '🎯', label: 'Personal interest'),
  'certification': (icon: '🏆', label: 'Certification'),
};

const _styleLabels = <String, ({String icon, String label})>{
  'visual': (icon: '🖼', label: 'Visual learner'),
  'reading': (icon: '📖', label: 'Reading / text'),
  'hands_on': (icon: '🛠', label: 'Hands-on practice'),
  'video': (icon: '🎬', label: 'Video content'),
};

const _branchLabels = <String, String>{
  'frontend': 'Frontend',
  'backend': 'Backend',
  'data_science': 'Data Science',
};

class ProfileCard extends StatelessWidget {
  const ProfileCard({required this.profile, super.key});

  final LearningProfile profile;

  @override
  Widget build(BuildContext context) {
    final rows = _buildRows();
    if (rows.isEmpty) {
      return const InsightsCard(
        child: Text(
          'No profile information provided at enrollment.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, color: AppColors.textMuted),
        ),
      );
    }

    return InsightsCard(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Column(
        children: rows,
      ),
    );
  }

  List<Widget> _buildRows() {
    final rows = <Widget>[];

    void add(String icon, String label, String value) {
      rows.add(_ProfileRow(icon: icon, label: label, value: value));
    }

    final familiarity = profile.familiarityLevel;
    if (familiarity != null) {
      add(
        '🎓',
        'Experience level',
        _familiarityLabels[familiarity] ?? familiarity,
      );
    }

    final goal = profile.learningGoal;
    if (goal != null) {
      final g = _goalLabels[goal];
      add(g?.icon ?? '🎯', 'Learning goal', g?.label ?? goal);
    }

    if (profile.weeklyHours != null) {
      add('⏱', 'Weekly commitment', '${profile.weeklyHours} hours per week');
    }

    final style = profile.preferredLearningStyle;
    if (style != null) {
      final s = _styleLabels[style];
      add(s?.icon ?? '📚', 'Learning style', s?.label ?? style);
    }

    final branch = profile.selectedBranchPath;
    if (branch != null) {
      add('🌿', 'Selected path', _branchLabels[branch] ?? branch);
    }

    if (profile.priorSkills != null && profile.priorSkills!.isNotEmpty) {
      final skills = profile.priorSkills!
          .split(RegExp(r'[,;]+'))
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty)
          .take(8)
          .join(', ');
      if (skills.isNotEmpty) {
        add('✓', 'Prior skills', skills);
      }
    }

    if (profile.aboutSelf != null && profile.aboutSelf!.isNotEmpty) {
      final about = profile.aboutSelf!;
      add(
        '👤',
        'About',
        about.length > 180 ? '${about.substring(0, 180)}…' : about,
      );
    }

    return rows;
  }
}

class _ProfileRow extends StatelessWidget {
  const _ProfileRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final String icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE8E2D9))),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: 28,
            child: Text(icon, style: const TextStyle(fontSize: 16)),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  label.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 10,
                    letterSpacing: 1,
                    fontFamily: 'monospace',
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 14,
                    height: 1.35,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
