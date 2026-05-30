import 'package:flutter/material.dart';

import '../../../core/models/insights_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/format.dart';
import 'insights_shared.dart';

class TopAchievementsPanel extends StatelessWidget {
  const TopAchievementsPanel({required this.topNodes, super.key});

  final List<TopNode> topNodes;

  @override
  Widget build(BuildContext context) {
    if (topNodes.isEmpty) return const SizedBox.shrink();

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
                Text('✓', style: TextStyle(fontSize: 13, color: Color(0xFF5A9B6A))),
                SizedBox(width: 8),
                Text(
                  'HARDEST NODES MASTERED',
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
          ...topNodes.asMap().entries.map((entry) {
            final i = entry.key;
            final node = entry.value;
            return _TopNodeRow(rank: i + 1, node: node);
          }),
        ],
      ),
    );
  }
}

class GlobalTopAchievementsPanel extends StatelessWidget {
  const GlobalTopAchievementsPanel({required this.topNodes, super.key});

  final List<GlobalTopNode> topNodes;

  @override
  Widget build(BuildContext context) {
    if (topNodes.isEmpty) return const SizedBox.shrink();

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
                Text('✓', style: TextStyle(fontSize: 13, color: Color(0xFF5A9B6A))),
                SizedBox(width: 8),
                Text(
                  'HARDEST NODES MASTERED',
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
          ...topNodes.asMap().entries.map((entry) {
            return _GlobalTopNodeRow(rank: entry.key + 1, node: entry.value);
          }),
        ],
      ),
    );
  }
}

class _TopNodeRow extends StatelessWidget {
  const _TopNodeRow({required this.rank, required this.node});

  final int rank;
  final TopNode node;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE8E2D9))),
      ),
      child: Row(
        children: <Widget>[
          _RankBadge(rank: rank),
          const SizedBox(width: 10),
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
                Row(
                  children: <Widget>[
                    if (node.bestQuizScore != null)
                      Text(
                        '${node.bestQuizScore!.round()}%',
                        style: const TextStyle(
                          fontSize: 11,
                          fontFamily: 'monospace',
                          color: Color(0xFF5A9B6A),
                        ),
                      ),
                    if (node.bestQuizScore != null && node.masteredAt != null)
                      const SizedBox(width: 8),
                    if (node.masteredAt != null)
                      Text(
                        Format.timeAgo(node.masteredAt!),
                        style: const TextStyle(
                          fontSize: 11,
                          fontFamily: 'monospace',
                          color: AppColors.textMuted,
                        ),
                      ),
                  ],
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

class _GlobalTopNodeRow extends StatelessWidget {
  const _GlobalTopNodeRow({required this.rank, required this.node});

  final int rank;
  final GlobalTopNode node;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE8E2D9))),
      ),
      child: Row(
        children: <Widget>[
          _RankBadge(rank: rank),
          const SizedBox(width: 10),
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
                Row(
                  children: <Widget>[
                    if (node.bestQuizScore != null)
                      Text(
                        '${node.bestQuizScore!.round()}%',
                        style: const TextStyle(
                          fontSize: 11,
                          fontFamily: 'monospace',
                          color: Color(0xFF5A9B6A),
                        ),
                      ),
                    if (node.bestQuizScore != null && node.masteredAt != null)
                      const SizedBox(width: 8),
                    if (node.masteredAt != null)
                      Text(
                        Format.timeAgo(node.masteredAt!),
                        style: const TextStyle(
                          fontSize: 11,
                          fontFamily: 'monospace',
                          color: AppColors.textMuted,
                        ),
                      ),
                  ],
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

class _RankBadge extends StatelessWidget {
  const _RankBadge({required this.rank});

  final int rank;

  @override
  Widget build(BuildContext context) {
    final bg = rank == 1
        ? const Color(0xFFD4A843)
        : rank == 2
            ? AppColors.border
            : AppColors.hover;
    final fg = rank == 1 ? Colors.white : const Color(0xFF6E645A);

    return Container(
      width: 24,
      height: 24,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
      child: Text(
        '$rank',
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          fontFamily: 'monospace',
          color: fg,
        ),
      ),
    );
  }
}
