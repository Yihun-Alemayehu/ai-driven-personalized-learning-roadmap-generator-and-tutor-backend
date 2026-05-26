import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/resources_api.dart';
import '../models/resource.dart';

final resourcesApiProvider = Provider<ResourcesApi>(
  (ref) => ResourcesApi(ref.watch(apiClientProvider).dio),
);

final resourcesProvider = FutureProvider.family<List<Resource>, String>(
  (ref, nodeId) async {
    final api = ref.watch(resourcesApiProvider);
    return api.listByNode(nodeId);
  },
);

final resourcesByModalityProvider = Provider.family<Map<ResourceModality, List<Resource>>, String>(
  (ref, nodeId) {
    final resourcesAsync = ref.watch(resourcesProvider(nodeId));
    
    final Map<ResourceModality, List<Resource>> byModality = {
      ResourceModality.documentation: [],
      ResourceModality.tutorial: [],
      ResourceModality.video: [],
      ResourceModality.interactive: [],
      ResourceModality.reference: [],
    };
    
    resourcesAsync.whenOrNull(
      data: (resources) {
        for (final resource in resources) {
          byModality[resource.modality]?.add(resource);
        }
      },
    );
    
    return byModality;
  },
);
