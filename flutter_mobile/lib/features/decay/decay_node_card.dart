import 'package:flutter/material.dart';

import '../../core/models/decay_status.dart';
import '../../core/theme/app_colors.dart';

class DecayNodeCard extends StatelessWidget {
  const DecayNodeCard({
    required this.node,
    required this.onReview,
    super.key,
  });

  final DecayNodeStatus node;
  final VoidCallback onReview;

  @override
  Widget build(BuildContext context) {
    final isRelearn = node.isRelearn;
    final bgColor = isRelearn
        ? const Color(0xFFB85C38).withValues(alpha: 0.06)
        : const Color(0xFFD97706).withValues(alpha: 0.06);
    final borderColor = isRelearn
        ? const Color(0xFFB85C38).withValues(alpha: 0.35)
        : const Color(0xFFD97706).withValues(alpha: 0.3);

    final subtitle = _subtitle();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Text(
              isRelearn ? '🔴' : '⚠',
              style: const TextStyle(fontSize: 15),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  node.title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1A1614),
                    height: 1.3,
                  ),
                ),
                if (subtitle.isNotEmpty) ...<Widget>[
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textMuted,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          FilledButton(
            onPressed: onReview,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF1A1614),
              foregroundColor: AppColors.background,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(999),
              ),
            ),
            child: Text(
              isRelearn ? 'Relearn' : 'Review now',
              style: const TextStyle(fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  String _subtitle() {
    final days = node.daysSinceReview;
    final lastReviewed = days != null
        ? 'Last reviewed ${days}d ago'
        : 'Never reviewed';

    if (node.isRelearn) {
      return '$lastReviewed · relearn required';
    }
    if (node.isReviewNeeded) {
      return lastReviewed;
    }
    if (node.isMastered && node.daysUntilDecay != null) {
      return '$lastReviewed · ${node.daysUntilDecay}d until decay';
    }
    return lastReviewed;
  }
}
