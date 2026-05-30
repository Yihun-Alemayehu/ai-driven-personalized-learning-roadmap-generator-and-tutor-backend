import '../../core/models/roadmap_node.dart';

class LearnOutlineSection {
  const LearnOutlineSection({required this.label, required this.nodes});

  final String label;
  final List<RoadmapNode> nodes;
}

List<LearnOutlineSection> groupNodesForOutline(List<RoadmapNode> nodes) {
  final sorted = List<RoadmapNode>.from(nodes)
    ..sort((a, b) => (a.positionY ?? 0).compareTo(b.positionY ?? 0));

  final sections = <LearnOutlineSection>[];
  var current = LearnOutlineSection(label: 'Topics', nodes: <RoadmapNode>[]);

  for (final node in sorted) {
    if (node.isBranchingPoint && current.nodes.isNotEmpty) {
      sections.add(current);
      current = LearnOutlineSection(label: node.title, nodes: <RoadmapNode>[]);
    } else {
      current.nodes.add(node);
    }
  }

  if (current.nodes.isNotEmpty) {
    sections.add(current);
  }

  return sections.isNotEmpty
      ? sections
      : <LearnOutlineSection>[LearnOutlineSection(label: 'Topics', nodes: sorted)];
}
