import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/explanation_api.dart';
import '../models/explanation.dart';

final explanationApiProvider = Provider<ExplanationApi>(
  (ref) => ExplanationApi(ref.watch(apiClientProvider).dio),
);

final explanationProvider = FutureProvider.family<Explanation, ExplanationParams>(
  (ref, params) async {
    final api = ref.watch(explanationApiProvider);
    debugPrint('[EXPLANATION] Fetching for node: ${params.nodeId}');

    final response = await api.explain(
      nodeId: params.nodeId,
    );

    final data = response['data'] as Map<String, dynamic>? ?? response;

    return Explanation.fromJson(data);
  },
);

class ExplanationParams {
  const ExplanationParams({
    required this.enrollmentId,
    required this.nodeId,
  });

  final String enrollmentId;
  final String nodeId;

  @override
  bool operator ==(Object other) =>
      other is ExplanationParams &&
      other.enrollmentId == enrollmentId &&
      other.nodeId == nodeId;

  @override
  int get hashCode => Object.hash(enrollmentId, nodeId);
}

// Notifier for generating explanations (handles the async action)
final explanationNotifierProvider = AsyncNotifierProvider.family<ExplanationNotifier, Explanation, ExplanationParams>(
  ExplanationNotifier.new,
);

class ExplanationNotifier extends FamilyAsyncNotifier<Explanation, ExplanationParams> {
  @override
  Future<Explanation> build(ExplanationParams params) async {
    // Initially return empty explanation
    return const Explanation(
      summary: '',
      keyPoints: [],
      commonMistakes: [],
    );
  }

  Future<void> generate() async {
    final api = ref.read(explanationApiProvider);

    state = const AsyncLoading();

    try {
      debugPrint('[EXPLANATION] Generating for node: ${arg.nodeId}');
      final response = await api.explain(
        nodeId: arg.nodeId,
      );

      final data = response['data'] as Map<String, dynamic>? ?? response;
      final explanation = Explanation.fromJson(data);

      state = AsyncData(explanation);
      debugPrint('[EXPLANATION] Generated successfully');
    } catch (e, stack) {
      debugPrint('[EXPLANATION] Error generating: $e');
      state = AsyncError(e, stack);
    }
  }
}
