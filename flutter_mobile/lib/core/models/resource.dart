class LearningResource {
  const LearningResource({
    required this.id,
    required this.title,
    required this.kind,
    required this.url,
  });

  final String id;
  final String title;
  final String kind;
  final String url;

  factory LearningResource.fromJson(Map<String, dynamic> json) {
    return LearningResource(
      id: json['id'] as String,
      title: json['title'] as String,
      kind: json['kind'] as String,
      url: json['url'] as String,
    );
  }
}
