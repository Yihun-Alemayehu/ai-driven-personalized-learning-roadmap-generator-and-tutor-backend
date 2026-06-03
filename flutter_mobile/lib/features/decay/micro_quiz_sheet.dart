import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/quiz.dart';
import '../../core/providers/decay_provider.dart';
import '../../core/theme/app_colors.dart';
import '../quiz/quiz_question_card.dart';

class MicroQuizSheet extends ConsumerStatefulWidget {
  const MicroQuizSheet({
    required this.nodeId,
    this.enrollmentId,
    super.key,
  });

  final String nodeId;
  final String? enrollmentId;

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
    
    int correct = 0;
    for (final _ in _answers.entries) {
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
    
    final enrollmentId = widget.enrollmentId;
    if (enrollmentId != null) {
      ref.invalidate(decayStatusProvider(enrollmentId));
    }
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
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            border: Border(
              top: BorderSide(color: AppColors.border),
              left: BorderSide(color: AppColors.border),
              right: BorderSide(color: AppColors.border),
            ),
          ),
          child: Column(
            children: [
              const SizedBox(height: 10),
              Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 8, 0),
                child: Row(
                  children: [
                    Icon(Icons.quiz_outlined, size: 20, color: const Color(0xFFD97706)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Quick Review',
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      color: AppColors.textMuted,
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
              ),
              const Divider(color: AppColors.border, height: 1),
              Expanded(
                child: _buildContent(theme),
              ),
            ],
          ),
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
            Icon(Icons.error_outline, size: 48, color: AppColors.accent),
            const SizedBox(height: 16),
            Text('Failed to load quiz', style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(_error!, style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textMuted)),
            const SizedBox(height: 16),
            FilledButton(
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
      return Center(
        child: Text(
          'No questions available',
          style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textBody),
        ),
      );
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
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            itemCount: questions.length,
            itemBuilder: (context, index) {
              final question = questions[index];
              final selectedIndex = _answers[question.id];
              final selectedOption = selectedIndex != null && selectedIndex < question.options.length
                  ? question.options[selectedIndex]
                  : null;
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: QuizQuestionCard(
                  prompt: '${index + 1}. ${question.prompt}',
                  options: question.options,
                  selected: selectedOption,
                  onChanged: (option) {
                    final idx = question.options.indexOf(option);
                    if (idx >= 0) {
                      setState(() => _answers[question.id] = idx);
                    }
                  },
                ),
              );
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          decoration: BoxDecoration(
            color: AppColors.background,
            border: Border(
              top: BorderSide(color: AppColors.border.withValues(alpha: 0.8)),
            ),
          ),
          child: SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: allAnswered && !_isSubmitting ? _submit : null,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.accent,
                foregroundColor: AppColors.background,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Submit answers',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildResults(ThemeData theme) {
    final passed = (_scorePercent ?? 0) >= 70;

    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: passed
                  ? const Color(0xFF16A34A).withValues(alpha: 0.1)
                  : const Color(0xFFD97706).withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              passed ? Icons.check_circle : Icons.refresh,
              size: 40,
              color: passed ? const Color(0xFF16A34A) : const Color(0xFFD97706),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            passed ? 'Mastery confirmed!' : 'Review needed',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: passed ? const Color(0xFF16A34A) : const Color(0xFFD97706),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            passed
                ? 'Great job! Your knowledge is solid.'
                : 'You might need to revisit this topic.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: AppColors.textBody,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Text(
              'Score: ${_scorePercent!.toStringAsFixed(0)}%',
              style: theme.textTheme.titleLarge?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: passed
                  ? () {
                      Navigator.of(context).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Mastery confirmed!')),
                      );
                    }
                  : _retry,
              style: FilledButton.styleFrom(
                backgroundColor: passed ? const Color(0xFF16A34A) : const Color(0xFFD97706),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                passed ? 'Done' : 'Try again',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
