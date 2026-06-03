import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shimmer/shimmer.dart';

import '../../core/models/explanation.dart';
import '../../core/providers/explanation_provider.dart';
import '../../core/providers/voice_providers.dart';

class ExplanationPanel extends ConsumerWidget {
  const ExplanationPanel({
    required this.enrollmentId,
    required this.nodeId,
    this.embedInParentScroll = false,
    super.key,
  });

  final String enrollmentId;
  final String nodeId;

  /// When true, omits [SingleChildScrollView] for use inside a parent scroll view.
  final bool embedInParentScroll;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final params = ExplanationParams(
      enrollmentId: enrollmentId,
      nodeId: nodeId,
    );
    final explanationAsync = ref.watch(explanationNotifierProvider(params));

    final hasContent = explanationAsync.hasValue &&
        (explanationAsync.value!.summary.isNotEmpty ||
            explanationAsync.value!.keyPoints.isNotEmpty ||
            explanationAsync.value!.commonMistakes.isNotEmpty);
    final isGenerating =
        explanationAsync.hasValue && explanationAsync.value!.isGenerating;
    final showGenerateButton = !hasContent && !isGenerating && !explanationAsync.isLoading;

    final content = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (showGenerateButton) ...[
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () {
                ref
                    .read(explanationNotifierProvider(params).notifier)
                    .generate();
              },
              icon: const Icon(Icons.auto_awesome),
              label: const Text('Generate AI Explanation'),
            ),
          ),
          const SizedBox(height: 16),
          _EmptyPlaceholder(),
        ],

        // Loading while waiting for first token
        if (isGenerating && !hasContent)
          const _StreamingPlaceholder(),

        // Error display
        if (explanationAsync.hasError)
          Card(
            color: Theme.of(context).colorScheme.errorContainer,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Error generating explanation',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          color: Theme.of(context).colorScheme.onErrorContainer,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    explanationAsync.error.toString(),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(context).colorScheme.onErrorContainer,
                        ),
                  ),
                ],
              ),
            ),
          ),

        // Streaming or completed content
        if (hasContent) ...[
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Summary
                  if (explanationAsync.value!.summary.isNotEmpty) ...[
                    Text(
                      'Summary',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      explanationAsync.value!.summary,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    if (isGenerating && explanationAsync.value!.keyPoints.isEmpty)
                      const Padding(
                        padding: EdgeInsets.only(top: 4),
                        child: _StreamCursor(),
                      ),
                    const SizedBox(height: 24),
                  ],

                  // Key Points
                  if (explanationAsync.value!.keyPoints.isNotEmpty) ...[
                    Text(
                      'Key Points',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    ...explanationAsync.value!.keyPoints.map((point) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.check_circle, size: 18),
                          const SizedBox(width: 8),
                          Expanded(child: Text(point)),
                        ],
                      ),
                    )),
                    if (isGenerating && explanationAsync.value!.commonMistakes.isEmpty)
                      const Padding(
                        padding: EdgeInsets.only(top: 4),
                        child: _StreamCursor(),
                      ),
                    const SizedBox(height: 24),
                  ],

                  // Common Mistakes
                  if (explanationAsync.value!.commonMistakes.isNotEmpty) ...[
                    Text(
                      'Common Mistakes to Avoid',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    ...explanationAsync.value!.commonMistakes.map((mistake) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.warning_amber, size: 18, color: Colors.orange),
                          const SizedBox(width: 8),
                          Expanded(child: Text(mistake)),
                        ],
                      ),
                    )),
                    if (isGenerating)
                      const Padding(
                        padding: EdgeInsets.only(top: 4),
                        child: _StreamCursor(),
                      ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
          if (!isGenerating)
            _ReadAloudButton(
              explanation: explanationAsync.value!,
            ),
        ],
      ],
    );

    if (embedInParentScroll) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: content,
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: content,
    );
  }
}

class _StreamCursor extends StatefulWidget {
  const _StreamCursor();

  @override
  State<_StreamCursor> createState() => _StreamCursorState();
}

class _StreamCursorState extends State<_StreamCursor>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _controller,
      child: Container(
        width: 2,
        height: 16,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primary,
          borderRadius: BorderRadius.circular(1),
        ),
      ),
    );
  }
}

class _StreamingPlaceholder extends StatelessWidget {
  const _StreamingPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Shimmer.fromColors(
          baseColor: const Color(0xFFEBE6DB),
          highlightColor: const Color(0xFFF5F0EA),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(height: 12, width: 100, color: Colors.white),
                  const SizedBox(height: 16),
                  Container(height: 16, width: double.infinity, color: Colors.white),
                  const SizedBox(height: 8),
                  Container(height: 16, width: 260, color: Colors.white),
                  const SizedBox(height: 8),
                  Container(height: 16, width: 200, color: Colors.white),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Center(
          child: Text(
            'Generating explanation…',
            style: TextStyle(
              fontFamily: 'JetBrains Mono',
              fontSize: 11,
              color: Colors.grey[500],
            ),
          ),
        ),
      ],
    );
  }
}

class _EmptyPlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'AI Explanation',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Tap "Generate AI Explanation" to get a personalized explanation for this topic. The AI will provide:\n\n'
              '• Summary of key concepts\n'
              '• Important points to remember\n'
              '• Common mistakes to avoid\n'
              '• Practical examples\n\n'
              'This explanation is tailored to your learning level and goals.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}

class _ReadAloudButton extends ConsumerStatefulWidget {
  const _ReadAloudButton({required this.explanation});

  final Explanation explanation;

  @override
  ConsumerState<_ReadAloudButton> createState() => _ReadAloudButtonState();
}

class _ReadAloudButtonState extends ConsumerState<_ReadAloudButton> {
  @override
  void initState() {
    super.initState();
    final tts = ref.read(ttsServiceProvider);
    tts.stateNotifier.addListener(_onTtsStateChanged);
  }

  @override
  void dispose() {
    final tts = ref.read(ttsServiceProvider);
    tts.stateNotifier.removeListener(_onTtsStateChanged);
    super.dispose();
  }

  void _onTtsStateChanged() {
    if (mounted) setState(() {});
  }

  String _buildFullText() {
    final parts = <String>[];
    final e = widget.explanation;
    if (e.summary.isNotEmpty) {
      parts.add('Summary. ${e.summary}');
    }
    if (e.keyPoints.isNotEmpty) {
      parts.add('Key Points.');
      parts.addAll(e.keyPoints.map((p) => '- $p'));
    }
    if (e.commonMistakes.isNotEmpty) {
      parts.add('Common Mistakes to Avoid.');
      parts.addAll(e.commonMistakes.map((m) => '- $m'));
    }
    return parts.join('. ');
  }

  Future<void> _toggleReadAloud() async {
    final tts = ref.read(ttsServiceProvider);
    if (tts.isSpeaking) {
      await tts.stop();
    } else {
      await tts.speak(_buildFullText());
    }
  }

  @override
  Widget build(BuildContext context) {
    final tts = ref.read(ttsServiceProvider);
    final isSpeaking = tts.isSpeaking;

    return Align(
      alignment: Alignment.centerLeft,
      child: OutlinedButton.icon(
        onPressed: _toggleReadAloud,
        icon: Icon(isSpeaking ? Icons.stop : Icons.volume_up, size: 18),
        label: Text(isSpeaking ? 'Stop reading' : 'Read aloud'),
      ),
    );
  }
}
