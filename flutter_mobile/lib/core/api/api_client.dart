import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';

class ApiClient {
  ApiClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        headers: const {'Content-Type': 'application/json'},
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 90),
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final shouldSkipAuth =
              (options.extra[_skipAuthExtraKey] as bool?) ?? false;

          if (!shouldSkipAuth) {
            final accessToken = _accessTokenGetter?.call();
            if (accessToken != null && accessToken.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $accessToken';
            }
          }

          handler.next(options);
        },
        onError: (error, handler) async {
          final statusCode = error.response?.statusCode;
          final requestOptions = error.requestOptions;
          final shouldSkipRefresh =
              (requestOptions.extra[_skipRefreshExtraKey] as bool?) ?? false;
          final hasRetried =
              (requestOptions.extra[_retriedExtraKey] as bool?) ?? false;

          if (statusCode != 401 || shouldSkipRefresh || hasRetried) {
            handler.next(error);
            return;
          }

          final refreshedAccessToken = await _refreshAccessToken();

          if (refreshedAccessToken == null || refreshedAccessToken.isEmpty) {
            await _onRefreshFailure?.call();
            handler.next(error);
            return;
          }

          try {
            final response = await _dio.request<dynamic>(
              requestOptions.path,
              data: requestOptions.data,
              queryParameters: requestOptions.queryParameters,
              options: Options(
                method: requestOptions.method,
                headers: <String, dynamic>{
                  ...requestOptions.headers,
                  'Authorization': 'Bearer $refreshedAccessToken',
                },
                contentType: requestOptions.contentType,
                responseType: requestOptions.responseType,
                followRedirects: requestOptions.followRedirects,
                receiveDataWhenStatusError:
                    requestOptions.receiveDataWhenStatusError,
                validateStatus: requestOptions.validateStatus,
                sendTimeout: requestOptions.sendTimeout,
                receiveTimeout: requestOptions.receiveTimeout,
                extra: <String, dynamic>{
                  ...requestOptions.extra,
                  _retriedExtraKey: true,
                },
              ),
              cancelToken: requestOptions.cancelToken,
              onSendProgress: requestOptions.onSendProgress,
              onReceiveProgress: requestOptions.onReceiveProgress,
            );

            handler.resolve(response);
          } catch (_) {
            handler.next(error);
          }
        },
      ),
    );
  }

  static const String _skipAuthExtraKey = 'skipAuth';
  static const String _skipRefreshExtraKey = 'skipRefresh';
  static const String _retriedExtraKey = 'retried';

  late final Dio _dio;

  String? Function()? _accessTokenGetter;
  Future<String?> Function()? _refreshTokenHandler;
  Future<void> Function()? _onRefreshFailure;
  Completer<String?>? _refreshCompleter;

  Dio get dio => _dio;

  Options unauthenticatedOptions({bool skipRefresh = true}) {
    return Options(
      extra: <String, dynamic>{
        _skipAuthExtraKey: true,
        _skipRefreshExtraKey: skipRefresh,
      },
    );
  }

  Options authenticatedNoRefreshOptions() {
    return Options(extra: <String, dynamic>{_skipRefreshExtraKey: true});
  }

  void bindAuth({
    required String? Function() accessTokenGetter,
    required Future<String?> Function() refreshTokenHandler,
    required Future<void> Function() onRefreshFailure,
  }) {
    _accessTokenGetter = accessTokenGetter;
    _refreshTokenHandler = refreshTokenHandler;
    _onRefreshFailure = onRefreshFailure;
  }

  Future<String?> _refreshAccessToken() async {
    if (_refreshCompleter != null) {
      return _refreshCompleter?.future;
    }

    final completer = Completer<String?>();
    _refreshCompleter = completer;

    try {
      final token = await _refreshTokenHandler?.call();
      completer.complete(token);
      return token;
    } catch (_) {
      completer.complete(null);
      return null;
    } finally {
      _refreshCompleter = null;
    }
  }
}

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());
