import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:graphview/GraphView.dart';

import '../../core/models/roadmap_data.dart';
import '../../core/models/roadmap_node.dart';
import '../../core/providers/enrollments_provider.dart';
import '../../core/providers/roadmap_provider.dart';
import '../../core/theme/mastery_config.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/loading_shimmer.dart';
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
  bool _legendExpanded = false;
  bool _hasCentered = false;

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
                ),
                SliverPersistentHeader(
                  pinned: true,
                  delegate: _ProgressHeaderDelegate(
                    child: ProgressStatsBar(stats: bundle.stats),
                  ),
                ),
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: InteractiveViewer(
                    key: _viewerKey,
                    transformationController: _transformationController,
                    constrained: false,
                    boundaryMargin: const EdgeInsets.all(320),
                    minScale: 0.3,
                    maxScale: 2.5,
                    child: SizedBox(
                      width: 2400,
                      height: 1800,
                      child: GraphView(
                        graph: _graph,
                        algorithm: _algorithm,
                        paint: Paint()
                          ..color = const Color(0xFFB9B1A4)
                          ..strokeWidth = 1.5
                          ..style = PaintingStyle.stroke,
                        builder: (Node node) {
                          final mapped = node.key?.value as RoadmapNode;

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
                                          context.go('/quiz/${mapped.id}');
                                        },
                                        onResources: () {
                                          Navigator.of(context).pop();
                                          context.go(
                                            '/enrollments/${widget.enrollmentId}/learn/${mapped.id}',
                                          );
                                        },
                                      ),
                                    );
                                  }
                                : null,
                          );
                        },
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Positioned(
              right: 14,
              bottom: 14,
              child: _MasteryLegend(
                expanded: _legendExpanded,
                onToggle: () {
                  setState(() {
                    _legendExpanded = !_legendExpanded;
                  });
                },
              ),
            ),
          ],
        );
      },
    );
  }

  void _syncGraph(RoadmapData roadmap) {
    _graph.nodes.clear();
    _graph.edges.clear();
    _nodeMap.clear();

    for (final node in roadmap.nodes) {
      final graphNode = Node.Id(node.id);
      graphNode.key = ValueKey<RoadmapNode>(node);
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
      return;
    }

    final size = _viewerKey.currentContext?.size;
    final position = graphNode.position;

    if (size == null || (position == Offset.zero && retries < 8)) {
      Future<void>.delayed(const Duration(milliseconds: 30), () {
        if (!mounted) {
          return;
        }
        _attemptCenter(roadmap: roadmap, retries: retries + 1);
      });
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

class _MasteryLegend extends StatelessWidget {
  const _MasteryLegend({required this.expanded, required this.onToggle});

  final bool expanded;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      width: expanded ? 188 : 108,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          InkWell(
            onTap: onToggle,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Text('Legend', style: Theme.of(context).textTheme.titleMedium),
                Icon(expanded ? Icons.expand_more : Icons.chevron_left),
              ],
            ),
          ),
          if (expanded) ...<Widget>[
            const SizedBox(height: 8),
            ...MasteryState.values.map((state) {
              final color = MasteryConfig.colors[state] ?? Colors.grey;
              final label = MasteryConfig.labels[state] ?? state.name;
              return Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  children: <Widget>[
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: color,
                        borderRadius: BorderRadius.circular(99),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        label,
                        style: Theme.of(context).textTheme.labelSmall,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ],
      ),
    );
  }
}
