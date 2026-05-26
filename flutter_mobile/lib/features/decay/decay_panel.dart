import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/decay_provider.dart';
import 'decay_node_card.dart';
import 'micro_quiz_sheet.dart';

class DecayPanel extends ConsumerWidget {
  const DecayPanel({
    required this.enrollmentId,
    super.key,
  });

  final String enrollmentId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reviewNodes = ref.watch(decayReviewNodesProvider(enrollmentId));
    final relearnNodes = ref.watch(decayRelearnNodesProvider(enrollmentId));
    
    // Combine and take top 3
    final decayNodes = [...relearnNodes, ...reviewNodes].take(3).toList();

    if (decayNodes.isEmpty) {
      return const SizedBox.shrink();
    }

    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.notifications_active, color: Colors.orange),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Topics need review',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    // TODO: Navigate to full decay list
                  },
                  child: const Text('See all →'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...decayNodes.map((node) => DecayNodeCard(
              node: node,
              onReview: () => _showMicroQuiz(context, node.nodeId),
            )),
          ],
        ),
      ),
    );
  }

  void _showMicroQuiz(BuildContext context, String nodeId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => MicroQuizSheet(nodeId: nodeId),
    );
  }
}
