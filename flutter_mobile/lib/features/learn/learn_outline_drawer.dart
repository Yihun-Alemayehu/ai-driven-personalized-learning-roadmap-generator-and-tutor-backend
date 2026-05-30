import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/models/enrollment.dart';
import '../../core/models/roadmap_node.dart';
import '../../core/providers/enrollments_provider.dart';
import '../../core/providers/my_learning_provider.dart';
import '../../core/providers/roadmap_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/mastery_config.dart';
import 'learn_outline_sections.dart';

class LearnOutlineDrawer extends ConsumerStatefulWidget {
  const LearnOutlineDrawer({
    required this.enrollmentId,
    required this.activeNodeId,
    super.key,
  });

  final String enrollmentId;
  final String activeNodeId;

  @override
  ConsumerState<LearnOutlineDrawer> createState() => _LearnOutlineDrawerState();
}

class _LearnOutlineDrawerState extends ConsumerState<LearnOutlineDrawer> {
  final Map<String, bool> _collapsedSections = <String, bool>{};
  bool _myLearningOpen = true;

  void _goToTopic(String nodeId) {
    Navigator.of(context).pop();
    if (nodeId == widget.activeNodeId) {
      return;
    }
    context.go('/enrollments/${widget.enrollmentId}/learn/$nodeId');
  }

  @override
  Widget build(BuildContext context) {
    final roadmapAsync = ref.watch(roadmapProvider(widget.enrollmentId));
    final enrollmentsAsync = ref.watch(enrollmentsProvider);
    final myLearning = ref.watch(myLearningProvider).valueOrNull;

    return ColoredBox(
      color: AppColors.surface,
      child: SafeArea(
        child: roadmapAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => const Center(child: Text('Could not load outline')),
          data: (roadmap) {
            final nodes = roadmap.nodes;
            final sections = groupNodesForOutline(nodes);
            final mastered =
                nodes.where((n) => n.masteryState == MasteryState.mastered).length;
            final total = nodes.length;

            final enrollmentTitles = <String, String>{
              for (final Enrollment e
                  in enrollmentsAsync.valueOrNull ?? <Enrollment>[])
                e.id: e.domainTitle,
            };

            final myLearningEntries = myLearning?.enrollmentToNode.entries
                    .toList() ??
                <MapEntry<String, String>>[];

            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                if (myLearningEntries.isNotEmpty) ...<Widget>[
                  InkWell(
                    onTap: () =>
                        setState(() => _myLearningOpen = !_myLearningOpen),
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                      child: Row(
                        children: <Widget>[
                          Text(
                            'MY LEARNING',
                            style: Theme.of(context).textTheme.labelSmall,
                          ),
                          const Spacer(),
                          Icon(
                            _myLearningOpen
                                ? Icons.expand_more
                                : Icons.chevron_right,
                            size: 20,
                            color: AppColors.textMuted,
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (_myLearningOpen)
                    ...myLearningEntries.map((entry) {
                      final isActive = entry.key == widget.enrollmentId;
                      final title =
                          enrollmentTitles[entry.key] ?? 'Course';
                      return ListTile(
                        dense: true,
                        selected: isActive,
                        title: Text(
                          title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        onTap: () {
                          Navigator.of(context).pop();
                          context.go(
                            '/enrollments/${entry.key}/learn/${entry.value}',
                          );
                        },
                        trailing: IconButton(
                          icon: const Icon(Icons.close, size: 18),
                          tooltip: 'Remove',
                          onPressed: () {
                            ref
                                .read(myLearningProvider.notifier)
                                .removeEnrollment(entry.key);
                          },
                        ),
                      );
                    }),
                  const Divider(height: 1),
                ],
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        'COURSE OUTLINE',
                        style: Theme.of(context).textTheme.labelSmall,
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: <Widget>[
                          Expanded(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(99),
                              child: LinearProgressIndicator(
                                value: total == 0 ? 0 : mastered / total,
                                minHeight: 6,
                                backgroundColor: AppColors.border,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  MasteryConfig
                                      .colors[MasteryState.mastered]!,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '$mastered/$total',
                            style: Theme.of(context).textTheme.labelSmall,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    children: <Widget>[
                      for (final section in sections) ...<Widget>[
                        if (sections.length > 1)
                          InkWell(
                            onTap: () {
                              setState(() {
                                _collapsedSections[section.label] =
                                    !(_collapsedSections[section.label] ??
                                        false);
                              });
                            },
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 6,
                              ),
                              child: Row(
                                children: <Widget>[
                                  Icon(
                                    (_collapsedSections[section.label] ??
                                            false)
                                        ? Icons.chevron_right
                                        : Icons.expand_more,
                                    size: 18,
                                    color: AppColors.textMuted,
                                  ),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      section.label.toUpperCase(),
                                      style: Theme.of(context)
                                          .textTheme
                                          .labelSmall,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        if (!(_collapsedSections[section.label] ?? false))
                          ...section.nodes.map(
                            (node) => _TopicTile(
                              node: node,
                              active: node.id == widget.activeNodeId,
                              onTap: node.unlocked
                                  ? () => _goToTopic(node.id)
                                  : null,
                            ),
                          ),
                      ],
                      const SizedBox(height: 8),
                      ListTile(
                        leading: const Icon(Icons.map_outlined),
                        title: const Text('Back to roadmap'),
                        onTap: () {
                          Navigator.of(context).pop();
                          context.go(
                            '/enrollments/${widget.enrollmentId}/roadmap',
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _TopicTile extends StatelessWidget {
  const _TopicTile({
    required this.node,
    required this.active,
    required this.onTap,
  });

  final RoadmapNode node;
  final bool active;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final locked = !node.unlocked;
    final color = locked
        ? AppColors.textMuted
        : MasteryConfig.colors[node.masteryState] ?? AppColors.textBody;
    final icon = locked
        ? Icons.lock_outline
        : MasteryConfig.icons[node.masteryState] ?? Icons.circle_outlined;

    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Material(
        color: active ? AppColors.textPrimary : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Icon(
                  icon,
                  size: 16,
                  color: active ? AppColors.background : color,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    node.title,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: active
                              ? AppColors.background
                              : locked
                                  ? AppColors.textMuted
                                  : AppColors.textBody,
                          fontWeight:
                              active ? FontWeight.w600 : FontWeight.w400,
                        ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
