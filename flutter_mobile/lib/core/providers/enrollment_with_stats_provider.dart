import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/progress_api.dart';
import '../models/enrollment.dart';
import 'enrollments_provider.dart';

/// Provider that enriches enrollments with progress stats
final enrollmentsWithStatsProvider = FutureProvider<List<EnrollmentWithStats>>((ref) async {
  final enrollments = await ref.watch(enrollmentsProvider.future);
  final progressApi = ref.watch(progressApiProvider);

  // Fetch stats for each enrollment in parallel
  final futures = enrollments.map((enrollment) async {
    try {
      final stats = await progressApi.getProgressStats(enrollment.id);
      return EnrollmentWithStats(
        enrollment: enrollment,
        masteredCount: stats.masteredCount,
        completionPercent: stats.completionPercent / 100.0,
      );
    } catch (_) {
      // Fall back to basic enrollment data
      return EnrollmentWithStats(
        enrollment: enrollment,
        masteredCount: enrollment.masteredNodes ?? 0,
        completionPercent: enrollment.progressPercent,
      );
    }
  });

  return Future.wait(futures);
});

final progressApiProvider = Provider<ProgressApi>((ref) {
  final dio = ref.watch(apiClientProvider);
  return ProgressApi(dio.dio);
});

/// Wrapper that combines enrollment with its progress stats
class EnrollmentWithStats {
  final Enrollment enrollment;
  final int masteredCount;
  final double completionPercent;

  const EnrollmentWithStats({
    required this.enrollment,
    required this.masteredCount,
    required this.completionPercent,
  });

  String get id => enrollment.id;
  String get domainTitle => enrollment.domainTitle;
  String? get iconUrl => enrollment.domain.iconUrl;
  int get totalNodes => enrollment.totalNodes ?? 0;
  DateTime? get lastAccessedAt => enrollment.lastAccessedAt;
  double get progressPercent => completionPercent;
  int get masteredNodes => masteredCount;
}
