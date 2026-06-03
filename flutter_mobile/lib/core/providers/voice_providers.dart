import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/speech_service.dart';
import '../services/tts_service.dart';

final ttsServiceProvider = Provider<TtsService>((ref) {
  final service = TtsService();
  ref.onDispose(() => service.dispose());
  return service;
});

final speechServiceProvider = Provider<SpeechService>((ref) {
  final service = SpeechService();
  ref.onDispose(() => service.dispose());
  return service;
});

final ttsStateProvider = Provider<TtsState>((ref) {
  final service = ref.watch(ttsServiceProvider);
  return service.state;
});

final speechStateProvider = Provider<SpeechState>((ref) {
  final service = ref.watch(speechServiceProvider);
  return service.state;
});
