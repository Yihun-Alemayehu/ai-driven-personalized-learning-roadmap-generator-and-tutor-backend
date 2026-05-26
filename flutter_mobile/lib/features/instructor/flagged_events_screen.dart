import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/instructor_models.dart';
import '../../core/providers/instructor_provider.dart';
import '../../widgets/loading_shimmer.dart';

class FlaggedEventsScreen extends ConsumerWidget {
  const FlaggedEventsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final eventsAsync = ref.watch(flaggedEventsNotifierProvider);

    return eventsAsync.when(
      loading: () => const LoadingShimmer(),
      error: (_, __) => const Center(child: Text('Failed to load events')),
      data: (events) {
        final pending = events.where((e) => !e.isResolved).toList();
        final resolved = events.where((e) => e.isResolved).toList();

        if (pending.isEmpty && resolved.isEmpty) {
          return const Center(child: Text('No flagged events'));
        }

        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (pending.isNotEmpty) ...[
              Text(
                'Pending Review',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              ...pending.map((e) => _FlaggedEventCard(
                    event: e,
                    onResolve: () => _showResolveSheet(context, ref, e),
                  )),
              const SizedBox(height: 24),
            ],
            if (resolved.isNotEmpty) ...[
              Text(
                'Resolved',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              ...resolved.map((e) => _FlaggedEventCard(
                    event: e,
                    onResolve: null,
                  )),
            ],
          ],
        );
      },
    );
  }

  void _showResolveSheet(BuildContext context, WidgetRef ref, FlaggedEvent event) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => _ResolveSheet(
        event: event,
        onResolve: (notes) async {
          await ref.read(flaggedEventsNotifierProvider.notifier).resolveEvent(
                eventId: event.id,
                resolutionNotes: notes,
              );
          if (context.mounted) {
            Navigator.of(context).pop();
          }
        },
      ),
    );
  }
}

class _FlaggedEventCard extends StatelessWidget {
  const _FlaggedEventCard({
    required this.event,
    required this.onResolve,
  });

  final FlaggedEvent event;
  final VoidCallback? onResolve;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: event.isResolved
          ? theme.colorScheme.surfaceContainerHighest
          : theme.colorScheme.errorContainer.withOpacity(0.3),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  event.isResolved ? Icons.check_circle : Icons.warning,
                  color: event.isResolved ? Colors.green : theme.colorScheme.error,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    event.userName,
                    style: theme.textTheme.titleMedium,
                  ),
                ),
                if (!event.isResolved)
                  TextButton(
                    onPressed: onResolve,
                    child: const Text('Resolve'),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text('Node: ${event.nodeTitle}'),
            Text('Type: ${event.adaptationType}'),
            Text('Fail count: ${event.failCount}'),
            const SizedBox(height: 8),
            Text(
              'Reported: ${_formatDate(event.createdAt)}',
              style: theme.textTheme.bodySmall,
            ),
            if (event.resolutionNotes != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'Resolution: ${event.resolutionNotes}',
                  style: theme.textTheme.bodySmall,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

class _ResolveSheet extends StatefulWidget {
  const _ResolveSheet({
    required this.event,
    required this.onResolve,
  });

  final FlaggedEvent event;
  final ValueChanged<String> onResolve;

  @override
  State<_ResolveSheet> createState() => _ResolveSheetState();
}

class _ResolveSheetState extends State<_ResolveSheet> {
  final _notesController = TextEditingController();

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Resolve Flagged Event',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text('${widget.event.userName} - ${widget.event.nodeTitle}'),
          const SizedBox(height: 16),
          TextField(
            controller: _notesController,
            decoration: const InputDecoration(
              labelText: 'Resolution notes',
              hintText: 'How was this resolved?',
              border: OutlineInputBorder(),
            ),
            maxLines: 3,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              widget.onResolve(_notesController.text);
            },
            child: const Text('Mark as Resolved'),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
