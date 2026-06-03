import 'package:flutter/foundation.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

enum SpeechState { idle, listening, error }

class SpeechService {
  SpeechService() {
    _speech = stt.SpeechToText();
  }

  late final stt.SpeechToText _speech;
  SpeechState _state = SpeechState.idle;
  bool _initialized = false;

  SpeechState get state => _state;
  bool get isListening => _state == SpeechState.listening;

  final ValueNotifier<SpeechState> stateNotifier = ValueNotifier<SpeechState>(SpeechState.idle);

  void _updateState(SpeechState s) {
    _state = s;
    stateNotifier.value = s;
  }

  Future<bool> initialize() async {
    if (_initialized) return true;
    final available = await _speech.initialize(
      onError: (_) => _updateState(SpeechState.error),
      onStatus: (status) {
        if (status == 'done' || status == 'notListening' || status == 'canceled') {
          _updateState(SpeechState.idle);
        }
      },
    );
    _initialized = available;
    return available;
  }

  Future<void> listen({
    required void Function(String text) onResult,
    void Function(String interim)? onInterim,
    String localeId = 'en_US',
  }) async {
    if (!_initialized) {
      final ok = await initialize();
      if (!ok) {
        _updateState(SpeechState.error);
        return;
      }
    }

    _updateState(SpeechState.listening);

    try {
      await _speech.listen(
        onResult: (result) {
          final words = result.recognizedWords;
          if (result.finalResult) {
            if (words.trim().isNotEmpty) {
              onResult(words.trim());
            }
            _updateState(SpeechState.idle);
          } else {
            onInterim?.call(words);
          }
        },
        listenOptions: stt.SpeechListenOptions(
          localeId: localeId,
          listenFor: const Duration(seconds: 30),
          pauseFor: const Duration(seconds: 3),
          partialResults: true,
          cancelOnError: false,
        ),
      );
    } on stt.SpeechToTextNotInitializedException catch (e) {
      debugPrint('[SpeechService] not initialized: $e');
      _updateState(SpeechState.error);
    } on stt.ListenFailedException catch (e) {
      debugPrint('[SpeechService] listen failed: $e');
      _updateState(SpeechState.error);
    } catch (e) {
      debugPrint('[SpeechService] listen error: $e');
      _updateState(SpeechState.idle);
    }
  }

  Future<void> stop() async {
    try {
      await _speech.stop();
    } catch (_) {}
    _updateState(SpeechState.idle);
  }

  Future<void> cancel() async {
    try {
      await _speech.cancel();
    } catch (_) {}
    _updateState(SpeechState.idle);
  }

  void dispose() {
    _speech.stop();
  }
}
