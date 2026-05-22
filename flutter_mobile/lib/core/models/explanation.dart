class Explanation {
  const Explanation({
    required this.summary,
    required this.keyPoints,
    required this.commonMistakes,
    this.examples,
    this.isGenerating = false,
  });

  final String summary;
  final List<String> keyPoints;
  final List<String> commonMistakes;
  final List<String>? examples;
  final bool isGenerating;

  factory Explanation.fromJson(Map<String, dynamic> json) {
    // API returns nested structure: { explanation: { summary, keyPoints, commonMistakes } }
    final explanationData = json['explanation'] as Map<String, dynamic>? ?? json;

    return Explanation(
      summary: explanationData['summary'] as String? ?? '',
      keyPoints: (explanationData['keyPoints'] as List<dynamic>? ?? [])
          .map((e) => e as String)
          .toList(),
      commonMistakes: (explanationData['commonMistakes'] as List<dynamic>? ?? [])
          .map((e) => e as String)
          .toList(),
      examples: (explanationData['examples'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
    );
  }

  Explanation copyWith({
    String? summary,
    List<String>? keyPoints,
    List<String>? commonMistakes,
    List<String>? examples,
    bool? isGenerating,
  }) {
    return Explanation(
      summary: summary ?? this.summary,
      keyPoints: keyPoints ?? this.keyPoints,
      commonMistakes: commonMistakes ?? this.commonMistakes,
      examples: examples ?? this.examples,
      isGenerating: isGenerating ?? this.isGenerating,
    );
  }
}
