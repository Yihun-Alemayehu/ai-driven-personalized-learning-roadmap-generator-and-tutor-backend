import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_errors.dart';
import '../../core/models/quiz.dart';
import '../../core/providers/quiz_provider.dart';
import '../../core/providers/roadmap_provider.dart';
import '../../core/models/attempt_result.dart';
import '../../widgets/loading_shimmer.dart';
import 'quiz_question_card.dart';

class QuizScreen extends ConsumerStatefulWidget {
  const QuizScreen({
    required this.nodeId,
    this.enrollmentId,
    super.key,
  });

  final String nodeId;
  final String? enrollmentId;

  @override
  ConsumerState<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends ConsumerState<QuizScreen> {
  int _currentQuestionIndex = 0;
  final Map<String, String> _answers = {};
  late DateTime _startedAt;
  Timer? _timer;
  int _elapsedSeconds = 0;
  bool _isSubmitting = false;
  AttemptResult? _result;

  @override
  void initState() {
    super.initState();
    _startedAt = DateTime.now();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _elapsedSeconds++;
      });
    });
  }

  String _formatTime(int seconds) {
    final minutes = seconds ~/ 60;
    final secs = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  void _selectAnswer(String answer) {
    final quizAsync = ref.read(quizProvider(widget.nodeId));
    if (!quizAsync.hasValue) return;

    final question = quizAsync.value!.questions[_currentQuestionIndex];
    setState(() {
      _answers[question.id] = answer;
    });
  }

  void _nextQuestion() {
    final quizAsync = ref.read(quizProvider(widget.nodeId));
    if (!quizAsync.hasValue) return;

    if (_currentQuestionIndex < quizAsync.value!.questions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
      });
    }
  }

  void _previousQuestion() {
    if (_currentQuestionIndex > 0) {
      setState(() {
        _currentQuestionIndex--;
      });
    }
  }

  Future<void> _submitQuiz(Quiz quiz) async {
    if (widget.enrollmentId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cannot submit: missing enrollment ID')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    _timer?.cancel();

    final params = QuizAttemptParams(
      quizId: quiz.id,
      enrollmentId: widget.enrollmentId!,
      answers: _answers.entries.map((e) => {'questionId': e.key, 'answer': e.value}).toList(),
      startedAt: _startedAt,
    );

    try {
      final result = await ref.read(quizAttemptNotifierProvider(params).notifier).submit();
      setState(() {
        _result = result;
        _isSubmitting = false;
      });
    } catch (e) {
      setState(() {
        _isSubmitting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to submit: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final quizAsync = ref.watch(quizProvider(widget.nodeId));

    return quizAsync.when(
      loading: () => const Scaffold(
        body: Center(child: LoadingShimmer()),
      ),
      error: (err, stack) {
        debugPrint('[QUIZ_SCREEN] Error loading quiz: $err');
        debugPrint('[QUIZ_SCREEN] Stack: $stack');
        final message = err is DioException
            ? dioErrorMessage(
                err,
                fallback: 'No quiz available for this topic yet.',
              )
            : 'No quiz available for this topic yet.';
        return Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text(
                  'Could not load quiz',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Text(
                    message,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () => ref.invalidate(quizProvider(widget.nodeId)),
                  icon: const Icon(Icons.refresh),
                  label: const Text('Retry'),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => context.go('/enrollments/${widget.enrollmentId}/roadmap'),
                  child: const Text('Back to Roadmap'),
                ),
              ],
            ),
          ),
        );
      },
      data: (quiz) {
        if (_result != null) {
          return _buildResultsScreen(quiz);
        }
        return _buildQuizScreen(quiz);
      },
    );
  }

  Widget _buildQuizScreen(Quiz quiz) {
    final question = quiz.questions[_currentQuestionIndex];
    final progress = (_currentQuestionIndex + 1) / quiz.questions.length;
    final hasAnswer = _answers.containsKey(question.id);

    // Get node title for display
    final nodeAsync = widget.enrollmentId != null
        ? ref.watch(nodeByIdProvider(NodeLookupParams(
            enrollmentId: widget.enrollmentId!,
            nodeId: widget.nodeId,
          )))
        : null;
    final nodeTitle = nodeAsync?.valueOrNull?.title ?? 'Quiz';

    return Scaffold(
      appBar: AppBar(
        title: Text('$nodeTitle - Quiz'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.go('/enrollments/${widget.enrollmentId}/roadmap'),
        ),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                _formatTime(_elapsedSeconds),
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Progress bar
          LinearProgressIndicator(
            value: progress,
            backgroundColor: Colors.grey[300],
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Question ${_currentQuestionIndex + 1} of ${quiz.questions.length}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 16),
                  QuizQuestionCard(
                    prompt: question.prompt,
                    options: question.options,
                    selected: _answers[question.id],
                    onChanged: _selectAnswer,
                  ),
                ],
              ),
            ),
          ),
          // Navigation footer
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              border: Border(
                top: BorderSide(color: Theme.of(context).dividerColor),
              ),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  if (_currentQuestionIndex > 0)
                    OutlinedButton(
                      onPressed: _previousQuestion,
                      child: const Text('Previous'),
                    )
                  else
                    const SizedBox(width: 80),
                  const Spacer(),
                  if (_currentQuestionIndex < quiz.questions.length - 1)
                    FilledButton(
                      onPressed: hasAnswer ? _nextQuestion : null,
                      child: const Text('Next →'),
                    )
                  else
                    FilledButton(
                      onPressed: hasAnswer && !_isSubmitting
                          ? () => _submitQuiz(quiz)
                          : null,
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Submit'),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsScreen(Quiz quiz) {
    final result = _result!;
    final isPass = result.scorePercent >= 70;
    final tier = _getGatekeeperTier(result.scorePercent);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quiz Results'),
        automaticallyImplyLeading: false,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 32),
            // Score circle
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isPass ? Colors.green[100] : Colors.orange[100],
                border: Border.all(
                  color: isPass ? Colors.green : Colors.orange,
                  width: 4,
                ),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      '${result.scorePercent.toInt()}%',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: isPass ? Colors.green : Colors.orange,
                      ),
                    ),
                    Text(
                      tier,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              isPass ? 'Congratulations!' : 'Keep Learning',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              isPass
                  ? 'You passed and can proceed to the next topics.'
                  : 'Review the material and try again when ready.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            if (result.newlyUnlockedNodes.isNotEmpty) ...[
              const SizedBox(height: 24),
              Card(
                color: Colors.green[50],
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      const Icon(Icons.lock_open, color: Colors.green),
                      const SizedBox(height: 8),
                      Text(
                        '${result.newlyUnlockedNodes.length} new topic(s) unlocked!',
                        style: const TextStyle(color: Colors.green),
                      ),
                    ],
                  ),
                ),
              ),
            ],
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => context.go('/enrollments/${widget.enrollmentId}/roadmap'),
                child: const Text('Back to Roadmap'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getGatekeeperTier(double scorePercent) {
    if (scorePercent >= 80) return 'Strong Pass';
    if (scorePercent >= 70) return 'Pass';
    if (scorePercent >= 50) return 'Fail - Low';
    if (scorePercent >= 30) return 'Fail - Fundamental';
    return 'Fail - Severe';
  }
}
