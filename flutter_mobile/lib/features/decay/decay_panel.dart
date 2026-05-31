import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/decay_provider.dart';
import '../../core/theme/app_colors.dart';
import 'decay_node_card.dart';
import 'micro_quiz_sheet.dart';

/// Per-enrollment decay alerts (mirrors web `DecayStatusPanel`).
class DecayPanel extends ConsumerStatefulWidget {
  const DecayPanel({
    required this.enrollmentId,
    super.key,
  });

  final String enrollmentId;

  @override
  ConsumerState<DecayPanel> createState() => _DecayPanelState();
}

class _DecayPanelState extends ConsumerState<DecayPanel> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final decayAsync = ref.watch(decayStatusProvider(widget.enrollmentId));

    return decayAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (status) {
        // Match web: show full decayStatus array from API
        final alerts = status.nodes;
        if (alerts.isEmpty) {
          return const SizedBox.shrink();
        }

        final shown = _expanded ? alerts : alerts.take(2).toList();

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: const Color(0xFFD97706).withValues(alpha: 0.5),
            ),
            color: const Color(0xFFD97706).withValues(alpha: 0.05),
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: const Color(0xFFD97706).withValues(alpha: 0.25),
                    ),
                  ),
                ),
                child: Row(
                  children: <Widget>[
                    const Text('⚠', style: TextStyle(fontSize: 15)),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'Knowledge Decay Alerts',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1A1614),
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD97706),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        '${alerts.length}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ),
                    if (alerts.length > 2) ...<Widget>[
                      const SizedBox(width: 8),
                      TextButton(
                        onPressed: () => setState(() => _expanded = !_expanded),
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.textMuted,
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: Text(
                          _expanded ? 'Show less' : 'Show all ${alerts.length}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  children: <Widget>[
                    for (var i = 0; i < shown.length; i++) ...<Widget>[
                      if (i > 0) const SizedBox(height: 10),
                      DecayNodeCard(
                        node: shown[i],
                        onReview: () => _showMicroQuiz(context, shown[i].nodeId),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showMicroQuiz(BuildContext context, String nodeId) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => MicroQuizSheet(
        nodeId: nodeId,
        enrollmentId: widget.enrollmentId,
      ),
    ).then((_) {
      ref.invalidate(decayStatusProvider(widget.enrollmentId));
    });
  }
}
