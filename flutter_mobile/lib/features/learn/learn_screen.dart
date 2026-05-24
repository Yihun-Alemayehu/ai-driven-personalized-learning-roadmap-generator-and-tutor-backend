import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/models/roadmap_node.dart';
import '../../core/providers/my_learning_provider.dart';
import '../../core/providers/roadmap_provider.dart';
import '../../widgets/loading_shimmer.dart';
import 'explanation_panel.dart';

class LearnScreen extends ConsumerStatefulWidget {
  const LearnScreen({
    required this.enrollmentId,
    required this.nodeId,
    super.key,
  });

  final String enrollmentId;
  final String nodeId;

  @override
  ConsumerState<LearnScreen> createState() => _LearnScreenState();
}

class _LearnScreenState extends ConsumerState<LearnScreen>
    with TickerProviderStateMixin {
  late final TabController _tabController;
  bool _hasRedirected = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    // Save current node for "Resume" functionality and refresh roadmap
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(myLearningProvider.notifier).setCurrentNode(
            enrollmentId: widget.enrollmentId,
            nodeId: widget.nodeId,
          );
      // Refresh roadmap to get latest unlock status (in case quiz just unlocked this node)
      ref.invalidate(roadmapProvider(widget.enrollmentId));
    });
  }

  void _redirectToRoadmap() {
    if (!_hasRedirected && mounted) {
      _hasRedirected = true;
      context.go('/enrollments/${widget.enrollmentId}/roadmap');
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final nodeAsync = ref.watch(nodeByIdProvider(
      NodeLookupParams(
        enrollmentId: widget.enrollmentId,
        nodeId: widget.nodeId,
      ),
    ));

    return nodeAsync.when(
      loading: () => const Scaffold(
        body: LoadingShimmer(),
      ),
      error: (_, __) {
        // Redirect to roadmap on error after short delay
        Future.delayed(const Duration(seconds: 2), _redirectToRoadmap);
        return const Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Loading content...'),
              ],
            ),
          ),
        );
      },
      data: (node) {
        if (node == null) {
          // Redirect to roadmap if node not found
          WidgetsBinding.instance.addPostFrameCallback((_) => _redirectToRoadmap());
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        return Scaffold(
          appBar: AppBar(
            title: Text(node.title),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => context.go('/enrollments/${widget.enrollmentId}/roadmap'),
            ),
            bottom: TabBar(
              controller: _tabController,
              tabs: const [
                Tab(icon: Icon(Icons.article), text: 'Content'),
                Tab(icon: Icon(Icons.psychology), text: 'AI Explanation'),
              ],
            ),
          ),
          body: TabBarView(
            controller: _tabController,
            children: [
              // Content tab
              _ContentTab(
                node: node,
                enrollmentId: widget.enrollmentId,
              ),
              // AI Explanation tab
              ExplanationPanel(
                enrollmentId: widget.enrollmentId,
                nodeId: widget.nodeId,
              ),
            ],
          ),
        );
      },
    );
  }
}

class _ContentTab extends ConsumerWidget {
  const _ContentTab({
    required this.node,
    required this.enrollmentId,
  });

  final RoadmapNode node;
  final String enrollmentId;

  Future<void> _refresh(WidgetRef ref) async {
    // Refresh roadmap to get latest unlock status
    ref.invalidate(roadmapProvider(enrollmentId));
    // Small delay to allow provider to reload
    await Future.delayed(const Duration(milliseconds: 500));
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canTakeQuiz = node.unlocked;

    return Column(
      children: [
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => _refresh(ref),
            child: ListView(
              padding: const EdgeInsets.all(16),
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
              // Description
              if (node.description?.isNotEmpty ?? false) ...[
                Text(
                  node.description!,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 24),
              ],

              // Content placeholder (backend doesn't return full content yet)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Topic Overview',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        node.description?.isNotEmpty ?? false
                            ? node.description!
                            : 'This topic covers ${node.title}. Detailed content will be available soon.',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Estimated time
              if (node.estimatedHours != null)
                ListTile(
                  leading: const Icon(Icons.schedule),
                  title: const Text('Estimated Time'),
                  subtitle: Text('${node.estimatedHours} hours'),
                ),

              // Difficulty
              if (node.difficultyLevel != null)
                ListTile(
                  leading: const Icon(Icons.star),
                  title: const Text('Difficulty Level'),
                  subtitle: Row(
                    children: List.generate(3, (index) {
                      return Icon(
                        index < node.difficultyLevel! ? Icons.star : Icons.star_border,
                        size: 16,
                      );
                    }),
                  ),
                ),

              const SizedBox(height: 16),

              // Learning outcomes
              if (node.learningOutcomes.isNotEmpty) ...[
                Text(
                  'Learning Outcomes',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                ...node.learningOutcomes.map((outcome) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.check_circle_outline, size: 18),
                      const SizedBox(width: 8),
                      Expanded(child: Text(outcome)),
                    ],
                  ),
                )),
              ],
            ],
          ),
        ),
        ),

        // Footer CTA - matching web frontend
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            border: Border(
              top: BorderSide(color: Theme.of(context).dividerColor),
            ),
          ),
          child: SafeArea(
            child: Row(
              children: [
                Expanded(
                  child: FilledButton(
                    onPressed: canTakeQuiz ? () => context.go('/enrollments/$enrollmentId/quiz/${node.id}') : null,
                    child: const Text('Take quiz →'),
                  ),
                ),
                const SizedBox(width: 12),
                OutlinedButton(
                  onPressed: () => context.go('/enrollments/$enrollmentId/roadmap'),
                  child: const Text('Back to roadmap'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
