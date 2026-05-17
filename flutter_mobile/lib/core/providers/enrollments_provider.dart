import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/enrollments_api.dart';
import '../models/enrollment.dart';

final enrollmentsApiProvider = Provider<EnrollmentsApi>(
  (ref) => EnrollmentsApi(ref.watch(apiClientProvider).dio),
);

final enrollmentsProvider = FutureProvider<List<Enrollment>>((ref) async {
  final api = ref.watch(enrollmentsApiProvider);
  return api.myEnrollments();
});

final enrollmentByIdProvider = FutureProvider.family<Enrollment, String>(
  (ref, enrollmentId) async {
    final api = ref.watch(enrollmentsApiProvider);
    return api.getEnrollmentById(enrollmentId);
  },
);

final enrollNotifierProvider =
    AsyncNotifierProvider<EnrollNotifier, void>(EnrollNotifier.new);

class EnrollNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<Enrollment> enroll(EnrollPayload payload) async {
    final api = ref.read(enrollmentsApiProvider);
    state = const AsyncLoading<void>();

    try {
      final enrollment = await api.enroll(payload);
      ref.invalidate(enrollmentsProvider);
      state = const AsyncData<void>(null);
      return enrollment;
    } catch (error, stackTrace) {
      state = AsyncError<void>(error, stackTrace);
      rethrow;
    }
  }

  Future<void> unenroll(String enrollmentId) async {
    state = const AsyncLoading<void>();
    state = await AsyncValue.guard(() async {
      final api = ref.read(enrollmentsApiProvider);
      await api.unenroll(enrollmentId);
      ref.invalidate(enrollmentsProvider);
    });
  }
}
