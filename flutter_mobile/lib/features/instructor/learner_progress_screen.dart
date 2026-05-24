import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/instructor_models.dart';
import '../../core/providers/instructor_provider.dart';
import '../../widgets/loading_shimmer.dart';

class LearnerProgressSheet extends ConsumerStatefulWidget {
  const LearnerProgressSheet({
    required this.userId,
    required this.userName,
    super.key,
  });

  final String userId;
  final String userName;

  @override
  ConsumerState<LearnerProgressSheet> createState() => _LearnerProgressSheetState();
}

class _LearnerProgressSheetState extends ConsumerState<LearnerProgressSheet>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DraggableScrollableSheet(
      initialChildSize: 0.8,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return Scaffold(
          backgroundColor: theme.scaffoldBackgroundColor,
          appBar: AppBar(
            title: Text(widget.userName),
            leading: IconButton(
              icon: const Icon(Icons.close),
              onPressed: () => Navigator.of(context).pop(),
            ),
            bottom: TabBar(
              controller: _tabController,
              tabs: const [
                Tab(icon: Icon(Icons.route), text: 'Progress'),
                Tab(icon: Icon(Icons.history), text: 'Quiz History'),
              ],
            ),
          ),
          body: TabBarView(
            controller: _tabController,
            children: [
              _ProgressTab(userId: widget.userId),
              _QuizHistoryTab(userId: widget.userId),
            ],
          ),
        );
      },
    );
  }
}

class _ProgressTab extends ConsumerWidget {
  const _ProgressTab({required this.userId});

  final String userId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progressAsync = ref.watch(learnerProgressProvider(userId));

    return progressAsync.when(
      loading: () => const LoadingShimmer(),
      error: (_, __) => const Center(child: Text('Failed to load progress')),
      data: (enrollments) {
        if (enrollments.isEmpty) {
          return const Center(child: Text('No enrollments found'));
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: enrollments.length,
          itemBuilder: (context, index) {
            final enrollment = enrollments[index];
            return _EnrollmentCard(enrollment: enrollment);
          },
        );
      },
    );
  }
}

class _EnrollmentCard extends StatelessWidget {
  const _EnrollmentCard({required this.enrollment});

  final LearnerProgress enrollment;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ExpansionTile(
        title: Text(enrollment.domainName),
        subtitle: Text('${enrollment.nodeProgress.length} nodes'),
        children: enrollment.nodeProgress.map((node) {
          return ListTile(
            dense: true,
            leading: Icon(
              _getMasteryIcon(node.masteryState),
              color: _getMasteryColor(node.masteryState, theme),
              size: 20,
            ),
            title: Text(node.nodeTitle, style: theme.textTheme.bodyMedium),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (node.bestQuizScore != null)
                  Text(
                    '${node.bestQuizScore!.toInt()}%',
                    style: theme.textTheme.bodySmall,
                  ),
                const SizedBox(width: 8),
                Text(
                  '${node.attemptsCount} attempts',
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  IconData _getMasteryIcon(String state) {
    return switch (state.toLowerCase()) {
      'mastered' => Icons.check_circle,
      'proficient' => Icons.trending_up,
      'familiar' => Icons.lightbulb,
      'novice' => Icons.school,
      _ => Icons.help_outline,
    };
  }

  Color? _getMasteryColor(String state, ThemeData theme) {
    return switch (state.toLowerCase()) {
      'mastered' => Colors.green,
      'proficient' => Colors.blue,
      'familiar' => Colors.orange,
      'novice' => Colors.red,
      _ => theme.colorScheme.onSurface.withOpacity(0.5),
    };
  }
}

class _QuizHistoryTab extends ConsumerWidget {
  const _QuizHistoryTab({required this.userId});

  final String userId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(learnerQuizHistoryProvider(userId));

    return historyAsync.when(
      loading: () => const LoadingShimmer(),
      error: (_, __) => const Center(child: Text('Failed to load history')),
      data: (attempts) {
        if (attempts.isEmpty) {
          return const Center(child: Text('No quiz attempts yet'));
        }

        return SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            columns: const [
              DataColumn(label: Text('Node')),
              DataColumn(label: Text('Score'), numeric: true),
              DataColumn(label: Text('Outcome')),
              DataColumn(label: Text('Date')),
            ],
            rows: attempts.map((attempt) {
              return DataRow(
                cells: [
                  DataCell(Text(attempt.nodeTitle)),
                  DataCell(Text('${attempt.scorePercent.toInt()}%')),
                  DataCell(_OutcomeBadge(outcome: attempt.outcome)),
                  DataCell(Text(
                    _formatDate(attempt.completedAt),
                    style: Theme.of(context).textTheme.bodySmall,
                  )),
                ],
              );
            }).toList(),
          ),
        );
      },
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

class _OutcomeBadge extends StatelessWidget {
  const _OutcomeBadge({required this.outcome});

  final String outcome;

  @override
  Widget build(BuildContext context) {
    final color = switch (outcome.toLowerCase()) {
      'passed' => Colors.green,
      'failed' => Colors.red,
      'incomplete' => Colors.orange,
      _ => Colors.grey,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        outcome,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}

// Router-compatible screen wrapper
class LearnerProgressScreen extends StatelessWidget {
  const LearnerProgressScreen({required this.learnerId, super.key});

  final String learnerId;

  @override
  Widget build(BuildContext context) {
    return LearnerProgressSheet(
      userId: learnerId,
      userName: 'Learner',
    );
  }
}
