import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/domains_provider.dart';
import '../../core/providers/enrollments_provider.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/loading_shimmer.dart';
import 'domain_card.dart';

class CatalogScreen extends ConsumerStatefulWidget {
  const CatalogScreen({super.key});

  @override
  ConsumerState<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends ConsumerState<CatalogScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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

        // Filter domains based on search query
        final filteredDomains = _searchQuery.isEmpty
            ? domains
            : domains.where((domain) {
                final query = _searchQuery.toLowerCase();
                return domain.name.toLowerCase().contains(query) ||
                    domain.displayDescription.toLowerCase().contains(query);
              }).toList();

        final width = MediaQuery.sizeOf(context).width;
        final crossAxisCount = width >= 980
            ? 3
            : width >= 700
                ? 3
                : 2;

        return Column(
          children: [
            // Search bar
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: SearchBar(
                controller: _searchController,
                hintText: 'Search domains...',
                leading: const Icon(Icons.search),
                trailing: _searchQuery.isNotEmpty
                    ? [
                        IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            setState(() {
                              _searchQuery = '';
                              _searchController.clear();
                            });
                          },
                        ),
                      ]
                    : null,
                onChanged: (value) {
                  setState(() {
                    _searchQuery = value;
                  });
                },
              ),
            ),
            // Results count
            if (_searchQuery.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    '${filteredDomains.length} result${filteredDomains.length == 1 ? '' : 's'}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
              ),
            // Grid
            Expanded(
              child: filteredDomains.isEmpty && _searchQuery.isNotEmpty
                  ? const Center(
                      child: Text('No domains match your search.'),
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.all(16),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: crossAxisCount,
                        childAspectRatio: 0.95,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      itemCount: filteredDomains.length,
                      itemBuilder: (_, index) {
                        final domain = filteredDomains[index];

                        return DomainCard(
                          domain: domain,
                          isEnrolled: enrolledDomainIds.contains(domain.id),
                          onTap: () => context.go('/catalog/${domain.slug}'),
                        );
                      },
                    ),
            ),
          ],
        );
      },
    );
  }
}
