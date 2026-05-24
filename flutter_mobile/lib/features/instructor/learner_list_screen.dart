import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/instructor_models.dart';
import '../../core/providers/instructor_provider.dart';
import '../../widgets/loading_shimmer.dart';
import 'learner_progress_screen.dart';

class LearnerListScreen extends ConsumerStatefulWidget {
  const LearnerListScreen({super.key});

  @override
  ConsumerState<LearnerListScreen> createState() => _LearnerListScreenState();
}

class _LearnerListScreenState extends ConsumerState<LearnerListScreen> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final learnersAsync = ref.watch(instructorLearnersProvider);

    return learnersAsync.when(
      loading: () => const LoadingShimmer(),
      error: (_, __) => const Center(child: Text('Failed to load learners')),
      data: (learners) {
        // Filter by search query
        final filtered = _searchQuery.isEmpty
            ? learners
            : learners.where((l) {
                final query = _searchQuery.toLowerCase();
                return l.fullName.toLowerCase().contains(query) ||
                    l.email.toLowerCase().contains(query);
              }).toList();

        return Column(
          children: [
            // Search bar
            Padding(
              padding: const EdgeInsets.all(16),
              child: SearchBar(
                hintText: 'Search learners...',
                leading: const Icon(Icons.search),
                onChanged: (value) => setState(() => _searchQuery = value),
              ),
            ),
            // Results count
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  '${filtered.length} learner${filtered.length == 1 ? '' : 's'}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
            ),
            const SizedBox(height: 8),
            // List
            Expanded(
              child: filtered.isEmpty
                  ? const Center(child: Text('No learners found'))
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final learner = filtered[index];
                        return _LearnerTile(learner: learner);
                      },
                    ),
            ),
          ],
        );
      },
    );
  }
}

class _LearnerTile extends StatelessWidget {
  const _LearnerTile({required this.learner});

  final InstructorEnrollment learner;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).colorScheme.primary,
          child: Text(
            _getInitials(learner.fullName),
            style: const TextStyle(color: Colors.white),
          ),
        ),
        title: Text(learner.fullName),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(learner.email),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(
                  Icons.school,
                  size: 14,
                  color: Theme.of(context).colorScheme.secondary,
                ),
                const SizedBox(width: 4),
                Text(
                  learner.domainName,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(width: 12),
                Icon(
                  Icons.check_circle,
                  size: 14,
                  color: Theme.of(context).colorScheme.tertiary,
                ),
                const SizedBox(width: 4),
                Text(
                  '${learner.nodeProgressCount} nodes',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ],
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => _showLearnerProgress(context),
      ),
    );
  }

  String _getInitials(String name) {
    final parts = name.split(' ');
    if (parts.length >= 2 && parts[0].isNotEmpty && parts[1].isNotEmpty) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }

  void _showLearnerProgress(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => LearnerProgressSheet(
        userId: learner.userId,
        userName: learner.fullName,
      ),
    );
  }
}
