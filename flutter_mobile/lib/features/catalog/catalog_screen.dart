import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/domains_provider.dart';
import '../../core/providers/enrollments_provider.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/loading_shimmer.dart';
import 'domain_card.dart';

class CatalogScreen extends ConsumerWidget {
  const CatalogScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final domainsAsync = ref.watch(domainsProvider);
    final enrollmentsAsync = ref.watch(enrollmentsProvider);

    return domainsAsync.when(
      loading: () => const LoadingShimmer(),
      error: (_, __) => AtlasErrorWidget(
        message: 'Unable to load domains.',
        onRetry: () => ref.invalidate(domainsProvider),
      ),
      data: (domains) {
        final enrolledDomainIds = enrollmentsAsync.valueOrNull
                ?.map((item) => item.domainId)
                .toSet() ??
            <String>{};

        final width = MediaQuery.sizeOf(context).width;
        final crossAxisCount = width >= 980
            ? 3
            : width >= 700
                ? 3
                : 2;

        return GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            childAspectRatio: 0.95,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: domains.length,
          itemBuilder: (_, index) {
            final domain = domains[index];

            return DomainCard(
              domain: domain,
              isEnrolled: enrolledDomainIds.contains(domain.id),
              onTap: () => context.go('/catalog/${domain.slug}'),
            );
          },
        );
      },
    );
  }
}
