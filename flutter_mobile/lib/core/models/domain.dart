class Domain {
  const Domain({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.iconUrl,
    this.learningOutcomes = const <String>[],
    this.estimatedHours,
    this.nodeCount,
    this.ontologyVersion,
    this.createdAt,
  });

  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? iconUrl;
  final List<String> learningOutcomes;
  final int? estimatedHours;
  final int? nodeCount;
  final int? ontologyVersion;
  final DateTime? createdAt;

  String get displayDescription =>
      (description == null || description!.trim().isEmpty)
          ? 'No description available yet.'
          : description!.trim();

  factory Domain.fromJson(Map<String, dynamic> json) {
    final ontologyVersionPayload =
        json['publishedOntologyVersion'] as Map<String, dynamic>?;

    return Domain(
      id: json['id'] as String,
      name: (json['name'] ?? json['title'] ?? 'Untitled domain') as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      iconUrl: json['iconUrl'] as String?,
      learningOutcomes:
          (json['learningOutcomes'] as List<dynamic>? ?? <dynamic>[])
              .map((item) => item as String)
              .toList(),
      estimatedHours: (json['estimatedHours'] as num?)?.toInt(),
      nodeCount: (json['nodeCount'] as num?)?.toInt() ??
          (ontologyVersionPayload?['nodeCount'] as num?)?.toInt(),
      ontologyVersion: (json['ontologyVersion'] as num?)?.toInt() ??
          (json['versionNumber'] as num?)?.toInt() ??
          (ontologyVersionPayload?['versionNumber'] as num?)?.toInt(),
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.tryParse(json['createdAt'] as String),
    );
  }
}
