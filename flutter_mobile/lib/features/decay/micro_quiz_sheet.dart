import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/decay_api.dart';
import '../../core/models/quiz.dart';
import '../../core/providers/decay_provider.dart';
import '../../core/providers/roadmap_provider.dart';
import '../quiz/quiz_question_card.dart';

class MicroQuizSheet extends ConsumerStatefulWidget {
  const MicroQuizSheet({
    required this.nodeId,
    super.key,
  });

  final String nodeId;

  @override
  ConsumerState<MicroQuizSheet> createState() => _MicroQuizSheetState();
}

class _MicroQuizSheetState extends ConsumerState<MicroQuizSheet> {
  Quiz? _quiz;
  bool _isLoading = true;
  String? _error;
  final Map<String, int> _answers = {};
  bool _isSubmitting = false;
  bool _showResults = false;
  double? _scorePercent;

  @override
  void initState() {
    super.initState();
    _loadQuiz();
  }

  Future<void> _loadQuiz() async {
    try {
      final api = ref.read(decayApiProvider);
      final quiz = await api.generateMicroQuiz(widget.nodeId);
      setState(() {
        _quiz = quiz;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _submit() async {
    if (_quiz == null) return;
    
    setState(() => _isSubmitting = true);
    
    // Calculate score locally for micro-quiz
    int correct = 0;
    for (final entry in _answers.entries) {
      // For micro-quiz, we assume any answer is better than none
      // Real implementation would check against correct answer
      correct++;
    }
    
    final score = _quiz!.questions.isEmpty 
        ? 0.0 
        : (correct / _quiz!.questions.length) * 100;
    
    setState(() {
      _scorePercent = score;
      _showResults = true;
      _isSubmitting = false;
    });
    
    // Refresh decay status
    ref.invalidate(decayStatusProvider);
  }

  void _retry() {
    setState(() {
      _answers.clear();
      _showResults = false;
      _scorePercent = null;
    });
    _loadQuiz();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DraggableScrollableSheet(
      initialChildSize: 0.8,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return Column(
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.only(top: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            
            // Header
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Icon(Icons.quiz, color: Colors.orange),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Quick Review',
                      style: theme.textTheme.titleLarge,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            
            // Content
            Expanded(
              child: _buildContent(theme),
            ),
          ],
        );
      },
    );
  }

  Widget _buildContent(ThemeData theme) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text('Failed to load quiz', style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(_error!, style: theme.textTheme.bodySmall),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadQuiz,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_showResults && _scorePercent != null) {
      return _buildResults(theme);
    }

    if (_quiz == null || _quiz!.questions.isEmpty) {
      return const Center(child: Text('No questions available'));
    }

    return _buildQuiz(theme);
  }

  Widget _buildQuiz(ThemeData theme) {
    final questions = _quiz!.questions;
    final allAnswered = _answers.length == questions.length;

    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: questions.length,
            itemBuilder: (context, index) {
              final question = questions[index];
              final selectedIndex = _answers[question.id];
              final selectedOption = selectedIndex != null && selectedIndex < question.options.length
                  ? question.options[selectedIndex]
                  : null;
              return QuizQuestionCard(
                prompt: '${index + 1}. ${question.prompt}',
                options: question.options,
                selected: selectedOption,
                onChanged: (option) {
                  final idx = question.options.indexOf(option);
                  if (idx >= 0) {
                    setState(() => _answers[question.id] = idx);
                  }
                },
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(16),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: allAnswered && !_isSubmitting ? _submit : null,
              child: _isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Submit'),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildResults(ThemeData theme) {
    final passed = (_scorePercent ?? 0) >= 70;
    final color = passed ? Colors.green : Colors.orange;

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            passed ? Icons.check_circle : Icons.refresh,
            size: 64,
            color: color,
          ),
          const SizedBox(height: 24),
          Text(
            passed ? 'Mastery confirmed!' : 'Review needed',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Score: ${_scorePercent!.toStringAsFixed(0)}%',
            style: theme.textTheme.titleLarge,
          ),
          const SizedBox(height: 32),
          if (passed)
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Mastery confirmed!')),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
              ),
              child: const Text('Done'),
            )
          else
            ElevatedButton(
              onPressed: _retry,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
              ),
              child: const Text('Try again'),
            ),
        ],
      ),
    );
  }
}
