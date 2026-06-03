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

final explanationNotifierProvider =
    AsyncNotifierProvider.family<ExplanationNotifier, Explanation, ExplanationParams>(
  ExplanationNotifier.new,
);

class ExplanationNotifier extends FamilyAsyncNotifier<Explanation, ExplanationParams> {
  @override
  Future<Explanation> build(ExplanationParams params) async {
    return const Explanation(
      summary: '',
      keyPoints: [],
      commonMistakes: [],
    );
  }

  Future<void> _fetchNonStreaming() async {
    final api = ref.read(explanationApiProvider);

    try {
      final response = await api.explain(
        nodeId: arg.nodeId,
      );

      final data = response['data'] as Map<String, dynamic>? ?? response;
      final explanation = Explanation.fromJson(data);

      state = AsyncData(explanation);
    } catch (e, stack) {
      debugPrint('[EXPLANATION] Error: $e');
      state = AsyncError(e, stack);
    }
  }

  Future<void> generate() async {
    state = const AsyncLoading();

    try {
      final api = ref.read(explanationApiProvider);
      String accumulated = '';

      final stream = api.explainStream(nodeId: arg.nodeId);
      await for (final token in stream) {
        accumulated += token;
        state = AsyncData(_parseStreamText(accumulated).copyWith(isGenerating: true));
      }

      state = AsyncData(_parseStreamText(accumulated).copyWith(isGenerating: false));
      debugPrint('[EXPLANATION] Stream complete');
    } catch (e) {
      debugPrint('[EXPLANATION] Stream error: $e');
      await _fetchNonStreaming();
    }
  }

  Explanation _parseStreamText(String text) {
    final summaryM = _sectionRegex(text, 'SUMMARY');
    final pointsM = _sectionRegex(text, 'KEY[_ ]POINTS');
    final mistakesM = _sectionRegex(text, 'COMMON[_ ]MISTAKES');

    final summary = _stripAndTruncate(summaryM);
    final keyPoints = _parseBulletList(pointsM);
    final commonMistakes = _parseBulletList(mistakesM);

    return Explanation(
      summary: summary,
      keyPoints: keyPoints,
      commonMistakes: commonMistakes,
      isGenerating: true,
    );
  }

  String? _sectionRegex(String text, String sectionName) {
    final pattern = RegExp(
      '\\[$sectionName\\](.*?)(?=\\[|\$)',
      dotAll: true,
      caseSensitive: false,
    );
    final match = pattern.firstMatch(text);
    return match?.group(1)?.trim();
  }

  String _stripAndTruncate(String? section) {
    if (section == null || section.isEmpty) return '';
    return section.trim();
  }

  List<String> _parseBulletList(String? section) {
    if (section == null || section.isEmpty) return [];
    return section
        .split('\n')
        .map((l) => l.trim())
        .where((l) => l.startsWith('-'))
        .map((l) => l.replaceFirst(RegExp(r'^-\s*'), '').trim())
        .where((l) => l.isNotEmpty)
        .toList();
  }
}
