import 'package:flutter/material.dart';

import '../../core/models/roadmap_node.dart';
import '../../widgets/mastery_badge.dart';

class NodeDetailSheet extends StatelessWidget {
  const NodeDetailSheet({
    required this.enrollmentId,
    required this.node,
    required this.onLearn,
    required this.onQuiz,
    required this.onResources,
    super.key,
  });

  final String enrollmentId;
  final RoadmapNode node;
  final VoidCallback onLearn;
  final VoidCallback onQuiz;
  final VoidCallback onResources;

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.72,
      minChildSize: 0.45,
      maxChildSize: 0.95,
      expand: false,
      builder: (_, controller) {
        return DecoratedBox(
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: ListView(
            controller: controller,
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
            children: <Widget>[
              Text(node.title,
                  style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 8),
              MasteryBadge(state: node.masteryState),
              const SizedBox(height: 12),
              Row(
                children: <Widget>[
                  _MetaInfo(
                    label: 'Difficulty',
                    valueWidget: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: List<Widget>.generate(3, (index) {
                        final filled = index < (node.difficultyLevel ?? 1);
                        return Icon(
                          filled ? Icons.star : Icons.star_border,
                          size: 16,
                        );
                      }),
                    ),
                  ),
                  const SizedBox(width: 10),
                  _MetaInfo(
                    label: 'Estimated',
                    value: node.estimatedHours == null
                        ? '-'
                        : '${node.estimatedHours}h',
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                node.description == null || node.description!.trim().isEmpty
                    ? 'No description available for this topic yet.'
                    : node.description!,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 14),
              Text('Learning outcomes',
                  style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              if (node.learningOutcomes.isEmpty)
                Text(
                  'Outcomes are not published yet for this node.',
                  style: Theme.of(context).textTheme.bodyMedium,
                )
              else
                ...node.learningOutcomes.map(
                  (outcome) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        const Text('- '),
                        Expanded(
                          child: Text(
                            outcome,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: 14),
              _MetaInfo(
                label: 'Attempts',
                value: '${node.attemptsCount}',
              ),
              const SizedBox(height: 8),
              _MetaInfo(
                label: 'Best score',
                value: node.bestQuizScore == null
                    ? 'N/A'
                    : '${node.bestQuizScore!.toStringAsFixed(0)}%',
              ),
              const SizedBox(height: 20),
              FilledButton(
                onPressed: onLearn,
                child: const Text('Learn this topic'),
              ),
              const SizedBox(height: 8),
              OutlinedButton(
                onPressed: node.unlocked ? onQuiz : null,
                child: const Text('Take quiz'),
              ),
              TextButton(
                onPressed: onResources,
                child: const Text('Resources'),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _MetaInfo extends StatelessWidget {
  const _MetaInfo({
    required this.label,
    this.value,
    this.valueWidget,
  }) : assert(value != null || valueWidget != null);

  final String label;
  final String? value;
  final Widget? valueWidget;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(label, style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 2),
          valueWidget ??
              Text(value!, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}
