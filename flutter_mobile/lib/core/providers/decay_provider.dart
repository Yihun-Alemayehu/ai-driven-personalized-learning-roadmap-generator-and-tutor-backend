import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/decay_api.dart';
import '../models/decay_status.dart';

final decayApiProvider = Provider<DecayApi>(
  (ref) => DecayApi(ref.watch(apiClientProvider).dio),
);

final decayStatusProvider = FutureProvider.family<DecayStatus, String>(
  (ref, enrollmentId) async {
    final api = ref.watch(decayApiProvider);
    return api.getDecayStatus(enrollmentId);
  },
);

// Actionable decay nodes for dashboard (review, relearn, or mastered with decay info)
final decayAlertsProvider = Provider.family<List<DecayNodeStatus>, String>(
  (ref, enrollmentId) {
    final decayAsync = ref.watch(decayStatusProvider(enrollmentId));
    return decayAsync.whenOrNull(
          data: (status) => status.alertNodes,
        ) ??
        [];
  },
);

// Provider that returns total decay count
final decayCountProvider = Provider.family<int, String>(
  (ref, enrollmentId) {
    final decayAsync = ref.watch(decayStatusProvider(enrollmentId));
    return decayAsync.whenOrNull(
          data: (status) => status.totalDecayCount,
        ) ??
        0;
  },
);
