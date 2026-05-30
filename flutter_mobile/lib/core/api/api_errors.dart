import 'package:dio/dio.dart';

/// Extracts a human-readable API error from a [DioException].
String dioErrorMessage(DioException error, {String fallback = 'Request failed'}) {
  final data = error.response?.data;
  if (data is Map<String, dynamic>) {
    final nested = data['error'];
    if (nested is Map<String, dynamic>) {
      final message = nested['message'] as String?;
      if (message != null && message.isNotEmpty) {
        return message;
      }
    }
    final message = data['message'] as String?;
    if (message != null && message.isNotEmpty) {
      return message;
    }
  }

  if (error.type == DioExceptionType.receiveTimeout ||
      error.type == DioExceptionType.connectionTimeout) {
    return 'The server is taking longer than expected. Quiz generation can take up to two minutes — please try again.';
  }

  return fallback;
}
