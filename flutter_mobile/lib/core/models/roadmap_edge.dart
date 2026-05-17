class RoadmapEdge {
  const RoadmapEdge({
    required this.id,
    required this.nodeId,
    required this.prerequisiteNodeId,
  });

  final String id;
  final String nodeId;
  final String prerequisiteNodeId;

  factory RoadmapEdge.fromJson(Map<String, dynamic> json) {
    return RoadmapEdge(
      id: json['id'] as String,
      nodeId: json['nodeId'] as String,
      prerequisiteNodeId: json['prerequisiteNodeId'] as String,
    );
  }
}
