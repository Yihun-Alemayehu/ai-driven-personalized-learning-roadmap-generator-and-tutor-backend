import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/domains_provider.dart';
import '../../core/providers/enrollments_provider.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/loading_shimmer.dart';
import 'enroll_bottom_sheet.dart';

class DomainDetailScreen extends ConsumerWidget {
  const DomainDetailScreen({required this.slug, super.key});

  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final domainAsync = ref.watch(domainBySlugProvider(slug));
    final enrollments = ref.watch(enrollmentsProvider).valueOrNull ?? const [];

    return domainAsync.when(
      loading: () => const LoadingShimmer(),
      error: (_, __) => AtlasErrorWidget(
        message: 'Unable to load domain details.',
        onRetry: () => ref.invalidate(domainBySlugProvider(slug)),
      ),
      data: (domain) {
        final matches = enrollments.where((item) => item.domainId == domain.id);
        final enrollment = matches.isEmpty ? null : matches.first;

        return CustomScrollView(
          slivers: <Widget>[
            SliverAppBar.large(
              pinned: true,
              title: Text(domain.name),
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  color: Theme.of(context).colorScheme.surface,
                  alignment: Alignment.center,
                  child: CircleAvatar(
                    radius: 44,
                    child: Text(
                      domain.name.substring(0, 1).toUpperCase(),
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                  ),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(domain.displayDescription,
                        style: Theme.of(context).textTheme.bodyLarge),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: <Widget>[
                        _MetaChip(label: '${domain.nodeCount ?? '-'} nodes'),
                        _MetaChip(
                          label: domain.ontologyVersion == null
                              ? 'No published ontology'
                              : 'Ontology v${domain.ontologyVersion}',
                        ),
                        _MetaChip(
                          label: domain.estimatedHours == null
                              ? 'Hours not estimated'
                              : '${domain.estimatedHours}h estimate',
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    Text('Learning outcomes',
                        style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    if (domain.learningOutcomes.isEmpty)
                      Text(
                        'No outcomes published yet.',
                        style: Theme.of(context).textTheme.bodyMedium,
                      )
                    else
                      ...domain.learningOutcomes.map(
                        (item) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              const Text('- '),
                              Expanded(
                                child: Text(
                                  item,
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    const SizedBox(height: 24),
                    if (enrollment == null)
                      FilledButton.icon(
                        onPressed: () async {
                          final result = await showModalBottomSheet<String>(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (_) => EnrollBottomSheet(domain: domain),
                          );

                          if (result != null && context.mounted) {
                            context.go('/enrollments/$result/roadmap');
                          }
                        },
                        icon: const Icon(Icons.school_outlined),
                        label: const Text('Enroll now'),
                      )
                    else
                      FilledButton.icon(
                        onPressed: () =>
                            context.go('/enrollments/${enrollment.id}/roadmap'),
                        icon: const Icon(Icons.play_arrow_rounded),
                        label: const Text('Continue learning'),
                      ),
                    if (enrollment != null) ...<Widget>[
                      const SizedBox(height: 10),
                      OutlinedButton.icon(
                        onPressed: () async {
                          await ref
                              .read(enrollNotifierProvider.notifier)
                              .unenroll(enrollment.id);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('Unenrolled successfully.')),
                            );
                          }
                        },
                        icon: const Icon(Icons.delete_outline),
                        label: const Text('Unenroll'),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      child: Text(label, style: Theme.of(context).textTheme.labelSmall),
    );
  }
}
