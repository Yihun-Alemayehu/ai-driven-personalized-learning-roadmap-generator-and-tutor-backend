import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/enrollments_provider.dart';
import '../../core/providers/my_learning_provider.dart';
import '../../core/utils/format.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/loading_shimmer.dart';
import '../decay/decay_panel.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final enrollmentsAsync = ref.watch(enrollmentsProvider);
    final myLearning = ref.watch(myLearningProvider).valueOrNull;

    return enrollmentsAsync.when(
      loading: () => const LoadingShimmer(),
      error: (_, __) => AtlasErrorWidget(
        message: 'Unable to load your enrollments.',
        onRetry: () => ref.invalidate(enrollmentsProvider),
      ),
      data: (enrollments) {
        return ListView(
          padding: const EdgeInsets.all(16),
          children: <Widget>[
            Text('My Enrollments',
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 10),
            if (enrollments.isEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    'You are not enrolled yet. Explore the catalog to get started.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
              )
            else
              SizedBox(
                height: 210,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: enrollments.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (_, index) {
                    final enrollment = enrollments[index];
                    final totalNodes = enrollment.totalNodes ?? 0;
                    final masteredNodes = enrollment.masteredNodes ?? 0;

                    final currentNodeId =
                        myLearning?.enrollmentToNode[enrollment.id];

                    return SizedBox(
                      width: 300,
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(
                                enrollment.domainTitle,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context).textTheme.titleLarge,
                              ),
                              const SizedBox(height: 8),
                              LinearProgressIndicator(
                                value: enrollment.progressPercent,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                totalNodes > 0
                                    ? '$masteredNodes / $totalNodes nodes mastered'
                                    : 'Progress not available yet',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                enrollment.lastAccessedAt == null
                                    ? 'Last accessed: not yet'
                                    : 'Last accessed: ${Format.shortDate(enrollment.lastAccessedAt!)}',
                                style: Theme.of(context).textTheme.labelSmall,
                              ),
                              const Spacer(),
                              FilledButton(
                                onPressed: () {
                                  if (currentNodeId != null &&
                                      currentNodeId.isNotEmpty) {
                                    context.go(
                                      '/enrollments/${enrollment.id}/learn/$currentNodeId',
                                    );
                                  } else {
                                    context.go(
                                      '/enrollments/${enrollment.id}/roadmap',
                                    );
                                  }
                                },
                                child: const Text('Resume'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            // Decay panels for each enrollment
            ...enrollments.map((enrollment) => DecayPanel(
                  enrollmentId: enrollment.id,
                )),
          ],
        );
      },
    );
  }
}
