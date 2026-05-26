import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:graphview/GraphView.dart';

import '../../core/models/roadmap_data.dart';
import '../../core/models/roadmap_node.dart';
import '../../core/providers/enrollments_provider.dart';
import '../../core/providers/roadmap_provider.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/loading_shimmer.dart';
import '../resources/resources_panel.dart';
import 'mastery_legend.dart';
import 'node_detail_sheet.dart';
import 'node_widget.dart';
import 'progress_stats_bar.dart';

class RoadmapScreen extends ConsumerStatefulWidget {
  const RoadmapScreen({required this.enrollmentId, super.key});

  final String enrollmentId;

  @override
  ConsumerState<RoadmapScreen> createState() => _RoadmapScreenState();
}

class _RoadmapScreenState extends ConsumerState<RoadmapScreen> {
  final TransformationController _transformationController =
      TransformationController();
  final GlobalKey _viewerKey = GlobalKey();

  final Graph _graph = Graph()..isTree = true;
  final Map<String, Node> _nodeMap = <String, Node>{};
  String? _activeNodeId;
  bool _hasCentered = false;
  int _lastSyncedNodeCount = -1;
  int _lastSyncedEdgeCount = -1;

  late final SugiyamaConfiguration _layoutConfig;
  late final SugiyamaAlgorithm _algorithm;

  @override
  void initState() {
    super.initState();
    _layoutConfig = SugiyamaConfiguration()
      ..orientation = SugiyamaConfiguration.ORIENTATION_TOP_BOTTOM
      ..nodeSeparation = 50
      ..levelSeparation = 64
      ..bendPointShape = CurvedBendPointShape(curveLength: 26)
      ..addTriangleToEdge = false;

    _algorithm = SugiyamaAlgorithm(_layoutConfig);
  }

  @override
  void dispose() {
    _transformationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final roadmapAsync = ref.watch(roadmapBundleProvider(widget.enrollmentId));
    final enrollmentAsync =
        ref.watch(enrollmentByIdProvider(widget.enrollmentId));

    return roadmapAsync.when(
      loading: () => const LoadingShimmer(),
      error: (_, __) => AtlasErrorWidget(
        message: 'Unable to load roadmap.',
        onRetry: () =>
            ref.invalidate(roadmapBundleProvider(widget.enrollmentId)),
      ),
      data: (bundle) {
        if (bundle.roadmap.nodes.isEmpty) {
          return const Center(child: Text('No roadmap nodes available yet.'));
        }

        _syncGraph(bundle.roadmap);
        _centerOnFirstUnlocked(bundle.roadmap);

        final title = enrollmentAsync.valueOrNull?.domainTitle ?? 'Roadmap';

        return Stack(
          children: <Widget>[
            CustomScrollView(
              slivers: <Widget>[
                SliverAppBar.large(
                  pinned: true,
                  title: Text(title),
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.insights),
                      tooltip: 'Insights',
                      onPressed: () {
                        context.push('/enrollments/${widget.enrollmentId}/insights');
                      },
                    ),
                  ],
                ),
                SliverPersistentHeader(
                  pinned: true,
                  delegate: _ProgressHeaderDelegate(
                    child: ProgressStatsBar(stats: bundle.stats),
                  ),
                ),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 500, // Fixed height for the graph area
                    child: InteractiveViewer(
                      key: _viewerKey,
                      transformationController: _transformationController,
                      constrained: false,
                      boundaryMargin: const EdgeInsets.all(100),
                      minScale: 0.3,
                      maxScale: 2.5,
                      child: Align(
                        alignment: Alignment.topLeft,
                        child: GraphView(
                          graph: _graph,
                          algorithm: _algorithm,
                          paint: Paint()
                            ..color = const Color(0xFFB9B1A4)
                            ..strokeWidth = 1.5
                            ..style = PaintingStyle.stroke,
                          builder: (Node node) {
                            final mapped = node.key?.value as RoadmapNode?;
                            
                            if (mapped == null) {
                              debugPrint('[ROADMAP] WARNING: Node has null data, key=${node.key}');
                              return const SizedBox.shrink();
                            }

                            return RoadmapNodeWidget(
                              node: mapped,
                              isActive: _activeNodeId == mapped.id,
                              onTap: mapped.unlocked
                                  ? () {
                                      setState(() {
                                        _activeNodeId = mapped.id;
                                      });

                                      showModalBottomSheet<void>(
                                        context: context,
                                        isScrollControlled: true,
                                        backgroundColor: Colors.transparent,
                                        builder: (_) => NodeDetailSheet(
                                          enrollmentId: widget.enrollmentId,
                                          node: mapped,
                                          onLearn: () {
                                            Navigator.of(context).pop();
                                            context.go(
                                              '/enrollments/${widget.enrollmentId}/learn/${mapped.id}',
                                            );
                                          },
                                          onQuiz: () {
                                            Navigator.of(context).pop();
                                            context.go('/enrollments/${widget.enrollmentId}/quiz/${mapped.id}');
                                          },
                                          onResources: () {
                                            // Keep node detail sheet open and show resources panel
                                            showResourcesPanel(
                                              context,
                                              nodeId: mapped.id,
                                            );
                                          },
                                        ),
                                      ).then((_) {
                                        // Clear active node when sheet is dismissed
                                        if (mounted) {
                                          setState(() {
                                            _activeNodeId = null;
                                          });
                                        }
                                      });
                                    }
                                  : null,
                            );
                          },
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const MasteryLegend(),
          ],
        );
      },
    );
  }

  void _syncGraph(RoadmapData roadmap) {
    // Only re-sync if data has changed
    if (roadmap.nodes.length == _lastSyncedNodeCount &&
        roadmap.edges.length == _lastSyncedEdgeCount &&
        _graph.nodes.isNotEmpty) {
      return;
    }

    debugPrint('[ROADMAP] Syncing graph with ${roadmap.nodes.length} nodes, ${roadmap.edges.length} edges');

    // Only clear if we have data to avoid empty graph issues
    if (roadmap.nodes.isEmpty) {
      debugPrint('[ROADMAP] No nodes to sync, skipping');
      return;
    }

    _graph.nodes.clear();
    _graph.edges.clear();
    _nodeMap.clear();

    for (final node in roadmap.nodes) {
      final graphNode = Node.Id(node.id);
      graphNode.key = ValueKey<RoadmapNode>(node);
      _graph.addNode(graphNode);
      _nodeMap[node.id] = graphNode;
      debugPrint('[ROADMAP] Added node: ${node.id} - ${node.title}');
    }

    for (final edge in roadmap.edges) {
      final to = _nodeMap[edge.nodeId];
      final from = _nodeMap[edge.prerequisiteNodeId];
      if (to != null && from != null) {
        _graph.addEdge(from, to);
        debugPrint('[ROADMAP] Added edge: ${edge.prerequisiteNodeId} -> ${edge.nodeId}');
      } else {
        debugPrint('[ROADMAP] WARNING: Could not add edge ${edge.prerequisiteNodeId} -> ${edge.nodeId} (missing nodes)');
      }
    }
    
    _lastSyncedNodeCount = roadmap.nodes.length;
    _lastSyncedEdgeCount = roadmap.edges.length;

    debugPrint('[ROADMAP] Graph sync complete: ${_graph.nodeCount()} nodes, ${_graph.edges.length} edges');
  }

  void _centerOnFirstUnlocked(RoadmapData roadmap) {
    if (_hasCentered) {
      return;
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        return;
      }

      _attemptCenter(roadmap: roadmap, retries: 0);
    });
  }

  void _attemptCenter({required RoadmapData roadmap, required int retries}) {
    if (roadmap.nodes.isEmpty) {
      return;
    }

    final unlockedNode = roadmap.nodes.firstWhere(
      (node) => node.unlocked,
      orElse: () => roadmap.nodes.first,
    );

    final graphNode = _nodeMap[unlockedNode.id];
    if (graphNode == null) {
      debugPrint('[ROADMAP] Centering: graphNode is null, skipping');
      return;
    }

    final size = _viewerKey.currentContext?.size;
    final position = graphNode.position;

    debugPrint('[ROADMAP] Centering attempt #$retries: size=$size, position=$position');

    if (size == null || (position.dx == 0 && position.dy == 0 && retries < 10)) {
      if (retries < 10) {
        Future<void>.delayed(const Duration(milliseconds: 50), () {
          if (!mounted) {
            return;
          }
          _attemptCenter(roadmap: roadmap, retries: retries + 1);
        });
      } else {
        debugPrint('[ROADMAP] Centering: max retries reached, giving up');
        _hasCentered = true; // Mark as done to stop trying
      }
      return;
    }

    final scale = 1.0;
    const nodeWidth = 176.0;
    const nodeHeight = 90.0;
    final targetX = size.width / 2 - (position.dx + nodeWidth / 2) * scale;
    final targetY =
        max(0, size.height / 3 - (position.dy + nodeHeight / 2) * scale);

    _transformationController.value = Matrix4.identity()
      ..translateByDouble(targetX.toDouble(), targetY.toDouble(), 0, 1)
      ..scaleByDouble(scale, scale, 1, 1);

    _hasCentered = true;
  }
}

class _ProgressHeaderDelegate extends SliverPersistentHeaderDelegate {
  const _ProgressHeaderDelegate({required this.child});

  final Widget child;

  @override
  double get maxExtent => 52;

  @override
  double get minExtent => 52;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return child;
  }

  @override
  bool shouldRebuild(covariant _ProgressHeaderDelegate oldDelegate) {
    return oldDelegate.child != child;
  }
}

