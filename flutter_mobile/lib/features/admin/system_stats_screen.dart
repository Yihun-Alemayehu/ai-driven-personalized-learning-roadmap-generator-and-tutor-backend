import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/admin_models.dart';
import '../../core/providers/admin_provider.dart';
import '../../widgets/loading_shimmer.dart';

class SystemStatsScreen extends ConsumerWidget {
  const SystemStatsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(systemStatsProvider);
    final breakdownAsync = ref.watch(masteryBreakdownProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(systemStatsProvider);
        ref.invalidate(masteryBreakdownProvider);
      },
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // KPI Cards
            statsAsync.when(
              loading: () => const LoadingShimmer(),
              error: (_, __) => const _KpiError(),
              data: (stats) => _KpiGrid(stats: stats),
            ),
            const SizedBox(height: 24),
            // Mastery Breakdown
            breakdownAsync.when(
              loading: () => const LoadingShimmer(),
              error: (_, __) => const Center(child: Text('Failed to load mastery breakdown')),
              data: (breakdown) => _MasteryBreakdownCard(breakdown: breakdown),
            ),
          ],
        ),
      ),
    );
  }
}

class _KpiGrid extends StatelessWidget {
  const _KpiGrid({required this.stats});

  final SystemStats stats;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.2,
      children: [
        _KpiCard(
          icon: Icons.people,
          value: '${stats.totalUsers}',
          label: 'Total Users',
          color: Colors.blue,
        ),
        _KpiCard(
          icon: Icons.school,
          value: '${stats.totalEnrollments}',
          label: 'Enrollments',
          color: Colors.green,
        ),
        _KpiCard(
          icon: Icons.quiz,
          value: '${stats.totalQuizAttempts}',
          label: 'Quiz Attempts',
          color: Colors.orange,
        ),
        _KpiCard(
          icon: Icons.trending_up,
          value: '${stats.avgQuizScore.toInt()}%',
          label: 'Avg Score',
          color: Colors.purple,
        ),
      ],
    );
  }
}

class _KpiCard extends StatelessWidget {
  const _KpiCard({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String value;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: color,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _KpiError extends StatelessWidget {
  const _KpiError();

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Center(child: Text('Failed to load stats')),
      ),
    );
  }
}

class _MasteryBreakdownCard extends StatelessWidget {
  const _MasteryBreakdownCard({required this.breakdown});

  final MasteryBreakdown breakdown;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Mastery Distribution',
              style: theme.textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            _MasteryBar(
              label: 'Mastered',
              count: breakdown.masteredCount,
              total: breakdown.total,
              color: Colors.green,
            ),
            _MasteryBar(
              label: 'Proficient',
              count: breakdown.proficientCount,
              total: breakdown.total,
              color: Colors.blue,
            ),
            _MasteryBar(
              label: 'Familiar',
              count: breakdown.familiarCount,
              total: breakdown.total,
              color: Colors.orange,
            ),
            _MasteryBar(
              label: 'Novice',
              count: breakdown.noviceCount,
              total: breakdown.total,
              color: Colors.yellow.shade700,
            ),
            _MasteryBar(
              label: 'Unknown',
              count: breakdown.unknownCount,
              total: breakdown.total,
              color: Colors.grey,
            ),
          ],
        ),
      ),
    );
  }
}

class _MasteryBar extends StatelessWidget {
  const _MasteryBar({
    required this.label,
    required this.count,
    required this.total,
    required this.color,
  });

  final String label;
  final int count;
  final int total;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final percentage = total > 0 ? count / total : 0.0;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            child: Text(label, style: Theme.of(context).textTheme.bodySmall),
          ),
          Expanded(
            child: LinearProgressIndicator(
              value: percentage,
              backgroundColor: color.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 8,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(width: 12),
          Text(
            '$count',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
          ),
        ],
      ),
    );
  }
}
