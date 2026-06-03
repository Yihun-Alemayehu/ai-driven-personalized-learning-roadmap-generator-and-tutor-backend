import 'dart:async';
import 'dart:convert';

import 'package:dio/dio.dart';

/// Parses a Server-Sent Events (SSE) stream from a Dio response.
///
/// Expects `data: {"t":"<token>"}\n\n` chunks, terminated by `data: [DONE]\n\n`.
Stream<String> parseSseResponse(Response<ResponseBody> response) {
  final bodyStream = response.data?.stream;
  if (bodyStream == null) {
    return const Stream<String>.empty();
  }

  final controller = StreamController<String>();
  final lines = bodyStream
      .cast<List<int>>()
      .transform(utf8.decoder)
      .transform(const LineSplitter());

  lines.listen(
    (line) {
      if (line.startsWith('data: ')) {
        final data = line.substring(6);
        if (data == '[DONE]') {
          controller.close();
          return;
        }
        try {
          final json = jsonDecode(data) as Map<String, dynamic>;
          final text = json['t'] as String?;
          if (text != null && text.isNotEmpty) {
            controller.add(text);
          }
        } catch (_) {}
      }
    },
    onError: (e, stack) {
      if (!controller.isClosed) {
        controller.addError(e, stack);
      }
    },
    onDone: () {
      if (!controller.isClosed) {
        controller.close();
      }
    },
    cancelOnError: true,
  );

  return controller.stream;
}
