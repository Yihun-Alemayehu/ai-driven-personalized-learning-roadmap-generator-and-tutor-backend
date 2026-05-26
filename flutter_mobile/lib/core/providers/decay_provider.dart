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

// Provider that returns only nodes needing review
final decayReviewNodesProvider = Provider.family<List<DecayNodeStatus>, String>(
  (ref, enrollmentId) {
    final decayAsync = ref.watch(decayStatusProvider(enrollmentId));
    return decayAsync.whenOrNull(
          data: (status) => status.reviewNeededNodes,
        ) ??
        [];
  },
);

// Provider that returns only nodes needing relearn
final decayRelearnNodesProvider = Provider.family<List<DecayNodeStatus>, String>(
  (ref, enrollmentId) {
    final decayAsync = ref.watch(decayStatusProvider(enrollmentId));
    return decayAsync.whenOrNull(
          data: (status) => status.relearnNodes,
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
