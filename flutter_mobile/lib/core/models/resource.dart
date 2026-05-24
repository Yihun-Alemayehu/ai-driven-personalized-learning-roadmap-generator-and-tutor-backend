enum ResourceModality {
  documentation,
  tutorial,
  video,
  interactive,
  reference,
}

class Resource {
  const Resource({
    required this.id,
    required this.nodeId,
    required this.title,
    required this.url,
    required this.sourceDomain,
    required this.modality,
    this.description,
    required this.isPrimary,
    required this.avgRating,
  });

  final String id;
  final String nodeId;
  final String title;
  final String url;
  final String sourceDomain;
  final ResourceModality modality;
  final String? description;
  final bool isPrimary;
  final double avgRating;

  factory Resource.fromJson(Map<String, dynamic> json) {
    return Resource(
      id: (json['id'] as String?) ?? '',
      nodeId: (json['nodeId'] as String?) ?? '',
      title: (json['title'] as String?) ?? '',
      url: (json['url'] as String?) ?? '',
      sourceDomain: (json['sourceDomain'] as String?) ?? '',
      modality: _parseModality(json['modality'] as String?),
      description: json['description'] as String?,
      isPrimary: json['isPrimary'] as bool? ?? false,
      avgRating: _parseRating(json['avgRating']),
    );
  }

  static ResourceModality _parseModality(String? value) {
    switch (value) {
      case 'documentation':
        return ResourceModality.documentation;
      case 'tutorial':
        return ResourceModality.tutorial;
      case 'video':
        return ResourceModality.video;
      case 'interactive':
        return ResourceModality.interactive;
      case 'reference':
        return ResourceModality.reference;
      default:
        return ResourceModality.documentation;
    }
  }

  static double _parseRating(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }
}

class DiscoverResult {
  const DiscoverResult({
    required this.discovered,
    required this.resources,
  });

  final int discovered;
  final List<Resource> resources;

  factory DiscoverResult.fromJson(Map<String, dynamic> json) {
    return DiscoverResult(
      discovered: json['discovered'] as int? ?? 0,
      resources: (json['resources'] as List<dynamic>? ?? [])
          .map((e) => Resource.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
