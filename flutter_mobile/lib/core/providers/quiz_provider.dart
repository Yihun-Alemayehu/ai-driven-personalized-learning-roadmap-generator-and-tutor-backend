import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/quizzes_api.dart' show QuizzesApi, AttemptAnswer;
import '../models/quiz.dart';
import '../models/attempt_result.dart';
import 'roadmap_provider.dart';

final quizzesApiProvider = Provider<QuizzesApi>(
  (ref) => QuizzesApi(ref.watch(apiClientProvider).dio),
);

// Provider to fetch quiz by node ID
final quizProvider = FutureProvider.family<Quiz, String>((ref, nodeId) async {
  final api = ref.watch(quizzesApiProvider);
  debugPrint('[QUIZ_PROVIDER] Fetching quiz for node: $nodeId');
  try {
    final quiz = await api.getQuizByNode(nodeId);
    debugPrint('[QUIZ_PROVIDER] Loaded quiz: ${quiz.id} with ${quiz.questions.length} questions');
    return quiz;
  } catch (e, stack) {
    debugPrint('[QUIZ_PROVIDER] Error fetching quiz: $e');
    debugPrint('[QUIZ_PROVIDER] Stack trace: $stack');
    rethrow;
  }
});

// Notifier for quiz attempt submission
final quizAttemptNotifierProvider = AsyncNotifierProvider.family<QuizAttemptNotifier, AttemptResult, QuizAttemptParams>(
  QuizAttemptNotifier.new,
);

class QuizAttemptParams {
  const QuizAttemptParams({
    required this.quizId,
    required this.enrollmentId,
    required this.answers,
    required this.startedAt,
  });

  final String quizId;
  final String enrollmentId;
  final List<Map<String, String>> answers;
  final DateTime startedAt;

  @override
  bool operator ==(Object other) =>
      other is QuizAttemptParams &&
      other.quizId == quizId &&
      other.enrollmentId == enrollmentId;

  @override
  int get hashCode => Object.hash(quizId, enrollmentId);
}

class QuizAttemptNotifier extends FamilyAsyncNotifier<AttemptResult, QuizAttemptParams> {
  @override
  Future<AttemptResult> build(QuizAttemptParams params) async {
    throw UnimplementedError('Submit must be called explicitly');
  }

  Future<AttemptResult> submit() async {
    final api = ref.read(quizzesApiProvider);

    state = const AsyncLoading();

    try {
      debugPrint('[QUIZ_ATTEMPT] Submitting attempt for quiz: ${arg.quizId}');
      final result = await api.submitAttempt(
        quizId: arg.quizId,
        enrollmentId: arg.enrollmentId,
        answers: arg.answers.map((a) => AttemptAnswer(
          questionId: a['questionId']!,
          answer: a['answer']!,
        )).toList(),
        startedAt: arg.startedAt,
      );

      // Invalidate roadmap to refresh unlocked nodes
      // Refresh roadmap data to get updated unlocked nodes
      // ignore: avoid_dynamic_calls
      ref.invalidate(roadmapProvider(arg.enrollmentId));

      state = AsyncData(result);
      debugPrint('[QUIZ_ATTEMPT] Submitted successfully, score: ${result.scorePercent}%');
      return result;
    } catch (e, stack) {
      debugPrint('[QUIZ_ATTEMPT] Error submitting: $e');
      state = AsyncError(e, stack);
      rethrow;
    }
  }
}
