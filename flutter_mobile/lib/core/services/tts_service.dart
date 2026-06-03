import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';

enum TtsState { stopped, speaking, paused }

class TtsService {
  TtsService() {
    _tts.setCompletionHandler(() {
      _updateState(TtsState.stopped);
    });
    _tts.setErrorHandler((_) {
      _updateState(TtsState.stopped);
    });
  }

  final FlutterTts _tts = FlutterTts();
  TtsState _state = TtsState.stopped;

  TtsState get state => _state;
  bool get isSpeaking => _state == TtsState.speaking;
  bool get isStopped => _state == TtsState.stopped;

  final ValueNotifier<TtsState> stateNotifier = ValueNotifier<TtsState>(TtsState.stopped);

  void _updateState(TtsState s) {
    _state = s;
    stateNotifier.value = s;
  }

  Future<void> speak(String text) async {
    if (text.isEmpty) return;
    await _tts.setLanguage('en-US');
    await _tts.setSpeechRate(0.45);
    await _tts.setPitch(1.0);
    final result = await _tts.speak(text);
    if (result == 1) _updateState(TtsState.speaking);
  }

  Future<void> stop() async {
    await _tts.stop();
    _updateState(TtsState.stopped);
  }

  void dispose() {
    _tts.stop();
  }
}
