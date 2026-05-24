import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/resource.dart';
import '../../core/providers/resources_provider.dart';
import 'resource_card.dart';

class ResourcesPanel extends ConsumerStatefulWidget {
  const ResourcesPanel({
    required this.nodeId,
    super.key,
  });

  final String nodeId;

  @override
  ConsumerState<ResourcesPanel> createState() => _ResourcesPanelState();
}

class _ResourcesPanelState extends ConsumerState<ResourcesPanel>
    with TickerProviderStateMixin {
  late TabController _tabController;
  bool _isDiscovering = false;

  static const _tabs = [
    Tab(text: 'All'),
    Tab(text: 'Docs'),
    Tab(text: 'Tutorials'),
    Tab(text: 'Videos'),
    Tab(text: 'Interactive'),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _discoverMore() async {
    setState(() => _isDiscovering = true);
    try {
      final api = ref.read(resourcesApiProvider);
      await api.discover(widget.nodeId);
      // Refresh the resources list
      ref.invalidate(resourcesProvider(widget.nodeId));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Discovered new resources!')),
        );
      }
    } finally {
      setState(() => _isDiscovering = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final resourcesAsync = ref.watch(resourcesProvider(widget.nodeId));
    final resourcesByModality = ref.watch(resourcesByModalityProvider(widget.nodeId));

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return Column(
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.only(top: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            
            // Header
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      'Learning Resources',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ),
                  TextButton.icon(
                    onPressed: _isDiscovering ? null : _discoverMore,
                    icon: _isDiscovering
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.refresh),
                    label: const Text('Discover'),
                  ),
                ],
              ),
            ),
            
            // Tab bar
            TabBar(
              controller: _tabController,
              isScrollable: true,
              tabs: _tabs,
            ),
            
            // Tab content
            Expanded(
              child: resourcesAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, _) => Center(child: Text('Error: $err')),
                data: (resources) {
                  return TabBarView(
                    controller: _tabController,
                    children: [
                      // All
                      _buildResourceList(resources, scrollController),
                      // Docs
                      _buildResourceList(
                        resourcesByModality[ResourceModality.documentation] ?? [],
                        scrollController,
                      ),
                      // Tutorials
                      _buildResourceList(
                        resourcesByModality[ResourceModality.tutorial] ?? [],
                        scrollController,
                      ),
                      // Videos
                      _buildResourceList(
                        resourcesByModality[ResourceModality.video] ?? [],
                        scrollController,
                      ),
                      // Interactive
                      _buildResourceList(
                        resourcesByModality[ResourceModality.interactive] ?? [],
                        scrollController,
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildResourceList(List<Resource> resources, ScrollController controller) {
    if (resources.isEmpty) {
      return const Center(
        child: Text('No resources in this category'),
      );
    }
    
    return ListView.builder(
      controller: controller,
      padding: const EdgeInsets.only(bottom: 16),
      itemCount: resources.length,
      itemBuilder: (context, index) {
        return ResourceCard(
          resource: resources[index],
          nodeId: widget.nodeId,
        );
      },
    );
  }
}

/// Helper to show the resources panel as a modal bottom sheet
void showResourcesPanel(BuildContext context, {required String nodeId}) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Theme.of(context).scaffoldBackgroundColor,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (_) => ResourcesPanel(nodeId: nodeId),
  );
}
