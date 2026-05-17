import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MyLearningState {
  const MyLearningState({required this.enrollmentToNode});

  final Map<String, String> enrollmentToNode;

  MyLearningState copyWith({Map<String, String>? enrollmentToNode}) {
    return MyLearningState(
      enrollmentToNode: enrollmentToNode ?? this.enrollmentToNode,
    );
  }
}

final myLearningProvider =
    AsyncNotifierProvider<MyLearningNotifier, MyLearningState>(
  MyLearningNotifier.new,
);

class MyLearningNotifier extends AsyncNotifier<MyLearningState> {
  static const _key = 'myLearningMap';

  @override
  Future<MyLearningState> build() async {
    final prefs = await SharedPreferences.getInstance();
    final values = prefs.getStringList(_key) ?? <String>[];
    final parsed = <String, String>{};

    for (final value in values) {
      final split = value.split('|');
      if (split.length == 2) {
        parsed[split[0]] = split[1];
      }
    }

    return MyLearningState(enrollmentToNode: parsed);
  }

  Future<void> setCurrentNode({
    required String enrollmentId,
    required String nodeId,
  }) async {
    final current = state.valueOrNull;
    if (current == null) {
      return;
    }

    final updated = <String, String>{...current.enrollmentToNode};
    updated[enrollmentId] = nodeId;
    state = AsyncData(current.copyWith(enrollmentToNode: updated));

    final prefs = await SharedPreferences.getInstance();
    final payload = updated.entries.map(
      (entry) => '${entry.key}|${entry.value}',
    );
    await prefs.setStringList(_key, payload.toList());
  }
}
