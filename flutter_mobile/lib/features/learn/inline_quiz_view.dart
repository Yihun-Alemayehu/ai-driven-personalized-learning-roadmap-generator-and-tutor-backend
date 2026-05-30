import 'dart:math';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_errors.dart';
import '../../core/models/attempt_result.dart';
import '../../core/models/quiz.dart';
import '../../core/providers/quiz_provider.dart';
import '../../core/theme/app_colors.dart';
import '../quiz/quiz_question_card.dart';

/// In-learn quiz flow (same API as web [InlineQuiz]: GET /nodes/:nodeId/quiz).
class InlineQuizView extends ConsumerStatefulWidget {
  const InlineQuizView({
    required this.nodeId,
    required this.enrollmentId,
    required this.onBack,
    super.key,
  });

  final String nodeId;
  final String enrollmentId;
  final VoidCallback onBack;

  @override
  ConsumerState<InlineQuizView> createState() => _InlineQuizViewState();
}

class _InlineQuizViewState extends ConsumerState<InlineQuizView> {
  int _currentIndex = 0;
  final Map<String, String> _answers = {};
  final Map<String, List<String>> _shuffledOptions = {};
  DateTime? _startedAt;
  bool _isSubmitting = false;
  AttemptResult? _result;

  List<String> _shuffle(List<String> options) {
    final copy = List<String>.from(options)..shuffle(Random());
    return copy;
  }

  void _startQuiz(Quiz quiz) {
    final opts = <String, List<String>>{};
    for (final q in quiz.questions) {
      opts[q.id] = _shuffle(q.options);
    }
    setState(() {
      _startedAt = DateTime.now();
      _answers.clear();
      _currentIndex = 0;
      _shuffledOptions
        ..clear()
        ..addAll(opts);
      _result = null;
    });
  }

  Future<void> _submit(Quiz quiz) async {
    if (_startedAt == null) return;

    setState(() => _isSubmitting = true);

    final params = QuizAttemptParams(
      quizId: quiz.id,
      enrollmentId: widget.enrollmentId,
      answers: quiz.questions
          .map((q) => {
                'questionId': q.id,
                'answer': _answers[q.id] ?? '',
              })
          .toList(),
      startedAt: _startedAt!,
    );

    try {
      final result =
          await ref.read(quizAttemptNotifierProvider(params).notifier).submit();
      if (mounted) {
        setState(() {
          _result = result;
          _isSubmitting = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              e is DioException
                  ? dioErrorMessage(e, fallback: 'Failed to submit quiz')
                  : 'Failed to submit quiz',
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final quizAsync = ref.watch(quizProvider(widget.nodeId));

    return quizAsync.when(
      loading: () => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text(
              'Loading quiz…',
              style: TextStyle(color: AppColors.textMuted),
            ),
            SizedBox(height: 8),
            Text(
              'This may take up to two minutes while questions are generated.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
      error: (err, _) {
        final message = err is DioException
            ? dioErrorMessage(
                err,
                fallback: 'No quiz available for this topic yet.',
              )
            : 'No quiz available for this topic yet.';

        return Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  message,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: AppColors.textMuted,
                      ),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () =>
                      ref.invalidate(quizProvider(widget.nodeId)),
                  child: const Text('Retry'),
                ),
                TextButton(
                  onPressed: widget.onBack,
                  child: const Text('← Back to explanation'),
                ),
              ],
            ),
          ),
        );
      },
      data: (quiz) {
        if (_result != null) {
          return _OutcomeView(
            result: _result!,
            onBack: widget.onBack,
            onRetry: () => setState(() {
              _result = null;
              _startedAt = null;
            }),
          );
        }

        if (_startedAt == null) {
          return _ReadyView(
            questionCount: quiz.questions.length,
            onBack: widget.onBack,
            onStart: () => _startQuiz(quiz),
          );
        }

        return _TakingView(
          quiz: quiz,
          currentIndex: _currentIndex,
          answers: _answers,
          shuffledOptions: _shuffledOptions,
          isSubmitting: _isSubmitting,
          onBack: widget.onBack,
          onSelect: (questionId, answer) {
            setState(() => _answers[questionId] = answer);
          },
          onPrevious: () {
            if (_currentIndex > 0) {
              setState(() => _currentIndex--);
            }
          },
          onNext: () {
            if (_currentIndex < quiz.questions.length - 1) {
              setState(() => _currentIndex++);
            }
          },
          onSubmit: () => _submit(quiz),
        );
      },
    );
  }
}

class _ReadyView extends StatelessWidget {
  const _ReadyView({
    required this.questionCount,
    required this.onBack,
    required this.onStart,
  });

  final int questionCount;
  final VoidCallback onBack;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Align(
          alignment: Alignment.centerLeft,
          child: TextButton(
            onPressed: onBack,
            child: const Text('← Explanation'),
          ),
        ),
        Expanded(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '$questionCount-question quiz',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Select the best answer for each question. You can review before submitting.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textMuted,
                        ),
                  ),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: onStart,
                    child: const Text('Start quiz →'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _TakingView extends StatelessWidget {
  const _TakingView({
    required this.quiz,
    required this.currentIndex,
    required this.answers,
    required this.shuffledOptions,
    required this.isSubmitting,
    required this.onBack,
    required this.onSelect,
    required this.onPrevious,
    required this.onNext,
    required this.onSubmit,
  });

  final Quiz quiz;
  final int currentIndex;
  final Map<String, String> answers;
  final Map<String, List<String>> shuffledOptions;
  final bool isSubmitting;
  final VoidCallback onBack;
  final void Function(String questionId, String answer) onSelect;
  final VoidCallback onPrevious;
  final VoidCallback onNext;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final question = quiz.questions[currentIndex];
    final options = shuffledOptions[question.id] ?? question.options;
    final hasAnswer = answers.containsKey(question.id);
    final isLast = currentIndex == quiz.questions.length - 1;
    final allAnswered =
        quiz.questions.every((q) => answers.containsKey(q.id));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Row(
            children: [
              TextButton(
                onPressed: onBack,
                child: const Text('← Explanation'),
              ),
              const Spacer(),
              Text(
                'Quiz · ${quiz.questions.length} questions',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: AppColors.textMuted,
                    ),
              ),
              const SizedBox(width: 8),
            ],
          ),
        ),
        LinearProgressIndicator(
          value: (currentIndex + 1) / quiz.questions.length,
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: QuizQuestionCard(
              prompt: question.prompt,
              options: options,
              selected: answers[question.id],
              onChanged: (answer) => onSelect(question.id, answer),
            ),
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                if (currentIndex > 0)
                  OutlinedButton(
                    onPressed: onPrevious,
                    child: const Text('← Back'),
                  ),
                const Spacer(),
                if (isLast)
                  FilledButton(
                    onPressed: allAnswered && !isSubmitting ? onSubmit : null,
                    child: isSubmitting
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Submit'),
                  )
                else
                  FilledButton(
                    onPressed: hasAnswer ? onNext : null,
                    child: const Text('Next →'),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _OutcomeView extends StatelessWidget {
  const _OutcomeView({
    required this.result,
    required this.onBack,
    required this.onRetry,
  });

  final AttemptResult result;
  final VoidCallback onBack;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final isPass = result.scorePercent >= 70;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '${result.scorePercent.toStringAsFixed(0)}%',
              style: Theme.of(context).textTheme.displaySmall?.copyWith(
                    color: isPass ? Colors.green : Colors.orange,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              isPass ? 'Nice work!' : 'Keep practising',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            if (result.newlyUnlockedNodes.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                '${result.newlyUnlockedNodes.length} new topic(s) unlocked',
                style: const TextStyle(color: Colors.green),
              ),
            ],
            const SizedBox(height: 24),
            FilledButton(
              onPressed: onBack,
              child: const Text('Back to explanation'),
            ),
            TextButton(
              onPressed: onRetry,
              child: const Text('Retry quiz'),
            ),
          ],
        ),
      ),
    );
  }
}
