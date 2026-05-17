import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/domains_api.dart';
import '../models/domain.dart';

final domainsApiProvider = Provider<DomainsApi>(
  (ref) => DomainsApi(ref.watch(apiClientProvider).dio),
);

final domainsProvider = FutureProvider<List<Domain>>((ref) async {
  final api = ref.watch(domainsApiProvider);
  return api.listDomains();
});

final domainBySlugProvider = FutureProvider.family<Domain, String>(
  (ref, slug) async {
    final api = ref.watch(domainsApiProvider);
    return api.getDomainBySlug(slug);
  },
);
