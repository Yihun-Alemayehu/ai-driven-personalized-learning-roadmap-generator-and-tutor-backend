import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/instructor_api.dart';
import '../models/instructor_models.dart';

/// Provider for InstructorApi instance
final instructorApiProvider = Provider<InstructorApi>(
  (ref) => InstructorApi(ref.watch(apiClientProvider).dio),
);

/// Provider for instructor learners list
final instructorLearnersProvider = FutureProvider<List<InstructorEnrollment>>(
  (ref) async {
    final api = ref.watch(instructorApiProvider);
    return api.learners();
  },
);

/// Provider for learner progress by user ID
final learnerProgressProvider = FutureProvider.family<List<LearnerProgress>, String>(
  (ref, userId) async {
    final api = ref.watch(instructorApiProvider);
    return api.getLearnerProgress(userId);
  },
);

/// Provider for quiz history by user ID
final learnerQuizHistoryProvider = FutureProvider.family<List<QuizAttemptHistory>, String>(
  (ref, userId) async {
    final api = ref.watch(instructorApiProvider);
    return api.getQuizHistory(userId);
  },
);

/// Provider for domain analytics by domain ID
final domainAnalyticsProvider = FutureProvider.family<DomainAnalytics, String>(
  (ref, domainId) async {
    final api = ref.watch(instructorApiProvider);
    return api.getDomainAnalytics(domainId);
  },
);

/// Provider for flagged events
final flaggedEventsProvider = FutureProvider<List<FlaggedEvent>>(
  (ref) async {
    final api = ref.watch(instructorApiProvider);
    return api.getFlaggedEvents();
  },
);

/// Notifier for managing flagged event resolution
class FlaggedEventsNotifier extends AsyncNotifier<List<FlaggedEvent>> {
  @override
  Future<List<FlaggedEvent>> build() async {
    final api = ref.read(instructorApiProvider);
    return api.getFlaggedEvents();
  }

  Future<void> resolveEvent({
    required String eventId,
    required String resolutionNotes,
  }) async {
    state = const AsyncLoading();
    try {
      final api = ref.read(instructorApiProvider);
      await api.resolveFlaggedEvent(
        eventId: eventId,
        resolutionNotes: resolutionNotes,
      );
      // Refresh the list
      state = AsyncData(await api.getFlaggedEvents());
    } catch (e, stack) {
      state = AsyncError(e, stack);
    }
  }

  void refresh() {
    ref.invalidateSelf();
  }
}

/// Provider for flagged events with actions
final flaggedEventsNotifierProvider =
    AsyncNotifierProvider<FlaggedEventsNotifier, List<FlaggedEvent>>(
  FlaggedEventsNotifier.new,
);
