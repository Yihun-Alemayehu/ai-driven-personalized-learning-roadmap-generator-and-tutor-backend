import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/explanation_provider.dart';

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
    final showGenerateButton = !hasContent;

    final content = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
          if (showGenerateButton) ...<Widget>[
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: explanationAsync.isLoading
                    ? null
                    : () {
                        ref
                            .read(explanationNotifierProvider(params).notifier)
                            .generate();
                      },
                icon: explanationAsync.isLoading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.auto_awesome),
                label: Text(
                  explanationAsync.isLoading
                      ? 'Generating...'
                      : 'Generate AI Explanation',
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

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

          if (hasContent)
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
                    ],
                  ],
                ),
              ),
            )
          else if (!explanationAsync.hasError &&
              !explanationAsync.isLoading &&
              showGenerateButton)
            Card(
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
            ),
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
