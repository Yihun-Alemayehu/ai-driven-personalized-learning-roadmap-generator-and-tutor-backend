import 'dart:math';

import 'package:flutter/material.dart';
import 'package:graphview/GraphView.dart';

import '../../core/models/roadmap_data.dart';
import '../../core/models/roadmap_node.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/mastery_config.dart';
import 'mastery_legend.dart';
import 'node_widget.dart';
import 'roadmap_dot_grid.dart';
import 'roadmap_edge_renderer.dart';
import 'roadmap_node_presentation.dart';

/// Pannable graph canvas; syncs layout outside [build] to avoid semantics errors.
class RoadmapGraphCanvas extends StatefulWidget {
  const RoadmapGraphCanvas({
    required this.roadmap,
    required this.nextUpNodeId,
    required this.activeNodeId,
    required this.onNodeTap,
    super.key,
  });

  final RoadmapData roadmap;
  final String? nextUpNodeId;
  final String? activeNodeId;
  final ValueChanged<RoadmapNode> onNodeTap;

  @override
  State<RoadmapGraphCanvas> createState() => _RoadmapGraphCanvasState();
}

class _RoadmapGraphCanvasState extends State<RoadmapGraphCanvas> {
  final TransformationController _transformationController =
      TransformationController();
  final GlobalKey _viewerKey = GlobalKey();

  final Graph _graph = Graph()..isTree = true;
  final Map<String, Node> _nodeMap = <String, Node>{};

  late final SugiyamaConfiguration _layoutConfig;
  late final SugiyamaAlgorithm _algorithm;

  int? _dataFingerprint;
  bool _hasCentered = false;
  bool _centerPassScheduled = false;

  @override
  void initState() {
    super.initState();
    _layoutConfig = SugiyamaConfiguration()
      ..orientation = SugiyamaConfiguration.ORIENTATION_TOP_BOTTOM
      ..nodeSeparation = 80
      ..levelSeparation = 100
      ..bendPointShape = SharpBendPointShape()
      ..addTriangleToEdge = false;

    _algorithm = SugiyamaAlgorithm(_layoutConfig)
      ..renderer = RoadmapEdgeRenderer();

    _applyRoadmapData(widget.roadmap);
  }

  @override
  void didUpdateWidget(covariant RoadmapGraphCanvas oldWidget) {
    super.didUpdateWidget(oldWidget);
    final fp = _fingerprint(widget.roadmap);
    if (fp != _dataFingerprint) {
      _applyRoadmapData(widget.roadmap);
    }
  }

  @override
  void dispose() {
    _transformationController.dispose();
    super.dispose();
  }

  int _fingerprint(RoadmapData roadmap) {
    return Object.hash(
      roadmap.nodes.length,
      roadmap.edges.length,
      roadmap.selectedBranchPath,
      Object.hashAll(
        roadmap.nodes.map(
          (n) => Object.hash(n.id, n.masteryState, n.unlocked, n.branchPath),
        ),
      ),
    );
  }

  void _applyRoadmapData(RoadmapData roadmap) {
    _dataFingerprint = _fingerprint(roadmap);
    _hasCentered = false;
    _centerPassScheduled = false;

    _graph.nodes.clear();
    _graph.edges.clear();
    _nodeMap.clear();

    for (final node in roadmap.nodes) {
      final graphNode = Node.Id(node.id);
      graphNode.key = ValueKey<String>(node.id);
      _graph.addNode(graphNode);
      _nodeMap[node.id] = graphNode;
    }

    for (final edge in roadmap.edges) {
      final to = _nodeMap[edge.nodeId];
      final from = _nodeMap[edge.prerequisiteNodeId];
      if (to != null && from != null) {
        _graph.addEdge(from, to);
      }
    }

    if (mounted) {
      setState(() {});
      _scheduleCenterPass();
    }
  }

  void _scheduleCenterPass() {
    if (_centerPassScheduled || _hasCentered) {
      return;
    }
    _centerPassScheduled = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _centerPassScheduled = false;
      if (!mounted || _hasCentered) {
        return;
      }
      _attemptCenter(retries: 0);
    });
  }

  void _attemptCenter({required int retries}) {
    final roadmap = widget.roadmap;
    if (roadmap.nodes.isEmpty) {
      _hasCentered = true;
      return;
    }

    final nextUpId =
        widget.nextUpNodeId ?? RoadmapNodePresentation.resolveNextUpNodeId(roadmap);
    String? inProgressId;
    for (final node in roadmap.nodes) {
      if (node.masteryState == MasteryState.inProgress) {
        inProgressId = node.id;
        break;
      }
    }
    final focusId = nextUpId ??
        inProgressId ??
        roadmap.nodes
            .firstWhere((n) => n.unlocked, orElse: () => roadmap.nodes.first)
            .id;

    final graphNode = _nodeMap[focusId];
    if (graphNode == null) {
      _hasCentered = true;
      return;
    }

    final size = _viewerKey.currentContext?.size;
    final position = graphNode.position;

    if (size == null ||
        (position.dx == 0 && position.dy == 0 && retries < 12)) {
      if (retries < 12) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted && !_hasCentered) {
            _attemptCenter(retries: retries + 1);
          }
        });
      } else {
        _hasCentered = true;
      }
      return;
    }

    const scale = 0.95;
    const nodeWidth = RoadmapNodeWidget.cardWidth;
    const nodeHeight = 110.0;
    final targetX = size.width / 2 - (position.dx + nodeWidth / 2) * scale;
    final targetY =
        max(0, size.height / 2.5 - (position.dy + nodeHeight / 2) * scale);

    final matrix = Matrix4.identity()
      ..translateByDouble(targetX.toDouble(), targetY.toDouble(), 0, 1)
      ..scaleByDouble(scale, scale, 1, 1);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _transformationController.value = matrix;
      }
    });
    _hasCentered = true;
  }

  RoadmapNode? _nodeForGraphNode(Node graphNode) {
    final key = graphNode.key?.value;
    if (key is String) {
      for (final node in widget.roadmap.nodes) {
        if (node.id == key) {
          return node;
        }
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final legendBottom = MediaQuery.paddingOf(context).bottom + 16;

    return Stack(
      fit: StackFit.expand,
      children: <Widget>[
        const Positioned.fill(child: RoadmapDotGrid()),
        InteractiveViewer(
          key: _viewerKey,
          transformationController: _transformationController,
          constrained: false,
          boundaryMargin: const EdgeInsets.all(120),
          minScale: 0.35,
          maxScale: 2.5,
          child: Align(
            alignment: Alignment.topCenter,
            child: GraphView(
              graph: _graph,
              algorithm: _algorithm,
              paint: Paint()
                ..color = AppColors.border.withValues(alpha: 0.9)
                ..strokeWidth = 2
                ..style = PaintingStyle.stroke
                ..strokeCap = StrokeCap.round,
              builder: (Node node) {
                final mapped = _nodeForGraphNode(node);
                if (mapped == null) {
                  return const SizedBox.shrink();
                }

                return RoadmapNodeWidget(
                  node: mapped,
                  roadmap: widget.roadmap,
                  isActive: widget.activeNodeId == mapped.id,
                  isNextUp: mapped.id == widget.nextUpNodeId,
                  onTap: mapped.unlocked
                      ? () => widget.onNodeTap(mapped)
                      : null,
                );
              },
            ),
          ),
        ),
        Align(
          alignment: Alignment.bottomRight,
          child: Padding(
            padding: EdgeInsets.only(bottom: legendBottom, right: 16),
            child: const MasteryLegend(),
          ),
        ),
      ],
    );
  }
}
