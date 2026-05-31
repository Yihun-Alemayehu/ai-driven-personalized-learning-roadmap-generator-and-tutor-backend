import 'package:flutter/material.dart';

import '../../../core/models/insights_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/format.dart';
import 'insights_shared.dart';

class WeakAreasPanel extends StatelessWidget {
  const WeakAreasPanel({
    required this.weakNodes,
    required this.strugglingNodes,
    super.key,
  });

  final List<InsightWeakNode> weakNodes;
  final List<StrugglingNode> strugglingNodes;

  @override
  Widget build(BuildContext context) {
    if (weakNodes.isEmpty && strugglingNodes.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        if (weakNodes.isNotEmpty) ...<Widget>[
          _SectionHeader(icon: '↻', label: 'Knowledge decay'),
          InsightsCard(
            padding: EdgeInsets.zero,
            child: Column(
              children: weakNodes.map(_WeakNodeRow.new).toList(),
            ),
          ),
        ],
        if (weakNodes.isNotEmpty && strugglingNodes.isNotEmpty)
          const SizedBox(height: 12),
        if (strugglingNodes.isNotEmpty) ...<Widget>[
          _SectionHeader(icon: '⚠', label: 'Multiple attempts needed'),
          InsightsCard(
            padding: EdgeInsets.zero,
            child: Column(
              children: strugglingNodes.map(_StrugglingNodeRow.new).toList(),
            ),
          ),
        ],
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.icon, required this.label});

  final String icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Row(
        children: <Widget>[
          Text(icon, style: const TextStyle(fontSize: 13)),
          const SizedBox(width: 6),
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 11,
              letterSpacing: 1,
              fontFamily: 'monospace',
              color: AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}

class _WeakNodeRow extends StatelessWidget {
  const _WeakNodeRow(this.node);

  final InsightWeakNode node;

  @override
  Widget build(BuildContext context) {
    final isRelearn = node.masteryState == 'relearn';
    final badgeColor = isRelearn ? AppColors.accent : const Color(0xFFD97706);
    final badgeLabel = isRelearn ? 'Relearn' : 'Review needed';
    final bg = badgeColor.withValues(alpha: 0.06);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: bg,
        border: const Border(bottom: BorderSide(color: Color(0xFFE8E2D9))),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  node.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                if (node.lastReviewedAt != null) ...<Widget>[
                  const SizedBox(height: 4),
                  Text(
                    'last seen ${Format.timeAgo(node.lastReviewedAt!)}',
                    style: const TextStyle(
                      fontSize: 11,
                      fontFamily: 'monospace',
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          DifficultyDots(level: node.difficultyLevel),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: badgeColor),
              color: AppColors.background,
            ),
            child: Text(
              badgeLabel,
              style: TextStyle(
                fontSize: 10,
                fontFamily: 'monospace',
                color: badgeColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StrugglingNodeRow extends StatelessWidget {
  const _StrugglingNodeRow(this.node);

  final StrugglingNode node;

  @override
  Widget build(BuildContext context) {
    final subtitle = StringBuffer('${node.attemptsCount} attempt'
        '${node.attemptsCount == 1 ? '' : 's'}');
    if (node.bestQuizScore != null) {
      subtitle.write(' · best ${node.bestQuizScore!.round()}%');
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE8E2D9))),
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  node.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle.toString(),
                  style: const TextStyle(
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          DifficultyDots(level: node.difficultyLevel),
        ],
      ),
    );
  }
}

class GlobalWeakNodesPanel extends StatelessWidget {
  const GlobalWeakNodesPanel({
    required this.nodes,
    required this.onTap,
    super.key,
  });

  final List<GlobalWeakNode> nodes;
  final void Function(GlobalWeakNode node) onTap;

  @override
  Widget build(BuildContext context) {
    if (nodes.isEmpty) {
      return const InsightsCard(
        child: Text(
          'No knowledge decay detected — great work!',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 13, color: AppColors.textMuted),
        ),
      );
    }

    return InsightsCard(
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFFE8E2D9))),
            ),
            child: const Row(
              children: <Widget>[
                Text('⚠', style: TextStyle(fontSize: 13, color: AppColors.accent)),
                SizedBox(width: 8),
                Text(
                  'NEEDS REVIEW',
                  style: TextStyle(
                    fontSize: 11,
                    letterSpacing: 1,
                    fontFamily: 'monospace',
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          ...nodes.map((node) {
            return Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => onTap(node),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 12,
                  ),
                  decoration: const BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: Color(0xFFE8E2D9)),
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              node.title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${node.domainName} · ${node.masteryState.replaceAll('_', ' ')}',
                              style: const TextStyle(
                                fontSize: 11,
                                fontFamily: 'monospace',
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                      DifficultyDots(level: node.difficultyLevel),
                    ],
                  ),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
