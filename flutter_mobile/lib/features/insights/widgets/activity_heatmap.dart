import 'package:flutter/material.dart';

import '../../../core/models/insights_models.dart';
import '../../../core/theme/app_colors.dart';
import 'insights_shared.dart';

const _monthLabels = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const _dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/// GitHub-style 52-week activity grid (matches web ActivityHeatmap).
class ActivityHeatmap extends StatelessWidget {
  const ActivityHeatmap({required this.days, super.key});

  final List<ActivityDay> days;

  static List<List<String>> _buildGrid() {
    final today = DateTime.now();
    final normalized = DateTime(today.year, today.month, today.day);
    final todayDow = normalized.weekday % 7; // Sun=0
    final gridEnd = normalized.add(Duration(days: 6 - todayDow));

    final weeks = <List<String>>[];
    for (var w = 51; w >= 0; w--) {
      final week = <String>[];
      for (var d = 0; d < 7; d++) {
        final date = gridEnd.subtract(Duration(days: w * 7 + (6 - d)));
        week.add(_dateKey(date));
      }
      weeks.add(week);
    }
    return weeks;
  }

  static String _dateKey(DateTime date) {
    final y = date.year.toString().padLeft(4, '0');
    final m = date.month.toString().padLeft(2, '0');
    final d = date.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }

  @override
  Widget build(BuildContext context) {
    final dayMap = {for (final d in days) d.date: d};
    final weeks = _buildGrid();
    final today = _dateKey(DateTime.now());

    final totalActivity = days.fold<int>(0, (sum, d) => sum + d.count);
    final activeDays = days.where((d) => d.count > 0).length;
    final consistency = days.isEmpty
        ? 0
        : ((activeDays / days.length) * 100).round();

    final monthPositions = <({String label, int col})>[];
    var lastMonth = -1;
    for (var wi = 0; wi < weeks.length; wi++) {
      final month = DateTime.parse(weeks[wi].first).month - 1;
      if (month != lastMonth) {
        monthPositions.add((label: _monthLabels[month], col: wi));
        lastMonth = month;
      }
    }

    const cell = 11.0;
    const gap = 3.0;
    const step = cell + gap;
    const dayLabelWidth = 22.0;
    final gridWidth = dayLabelWidth + weeks.length * step;

    return InsightsCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Wrap(
            spacing: 20,
            runSpacing: 8,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: <Widget>[
              _summaryStat('$totalActivity', 'total activities'),
              _summaryStat('$activeDays', 'active days'),
              if (days.isNotEmpty)
                Text(
                  '$consistency% consistency',
                  style: const TextStyle(
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: AppColors.textMuted,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: SizedBox(
              width: gridWidth,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  SizedBox(
                    width: gridWidth,
                    height: 16,
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: monthPositions.map((pos) {
                        return Positioned(
                          left: dayLabelWidth + pos.col * step,
                          child: Text(
                            pos.label,
                            style: const TextStyle(
                              fontSize: 10,
                              fontFamily: 'monospace',
                              color: AppColors.textMuted,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Column(
                        children: [
                          for (var i = 0; i < 7; i++) ...<Widget>[
                            if (i > 0) SizedBox(height: gap),
                            SizedBox(
                              height: cell,
                              width: 18,
                              child: Align(
                                alignment: Alignment.centerLeft,
                                child: i.isEven
                                    ? Text(
                                        _dayLabels[i],
                                        style: const TextStyle(
                                          fontSize: 9,
                                          fontFamily: 'monospace',
                                          color: Color(0xFFC2B9A6),
                                        ),
                                      )
                                    : null,
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(width: 4),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: weeks.map((week) {
                          return Padding(
                            padding: const EdgeInsets.only(right: gap),
                            child: Column(
                              children: week.map((date) {
                                final activity = dayMap[date];
                                final count = activity?.count ?? 0;
                                final isFuture = date.compareTo(today) > 0;
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: gap),
                                  child: Tooltip(
                                    message: isFuture || count == 0
                                        ? date
                                        : '$date\n${activity!.quizzes} quizzes\n'
                                            '${activity.masteries} mastered\n'
                                            '${activity.reviews} reviewed',
                                    child: Container(
                                      width: cell,
                                      height: cell,
                                      decoration: BoxDecoration(
                                        color: isFuture
                                            ? Colors.transparent
                                            : ActivityDay.intensityColor(count),
                                        borderRadius: BorderRadius.circular(3),
                                        border: date == today
                                            ? Border.all(
                                                color: AppColors.accent,
                                                width: 1.5,
                                              )
                                            : null,
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: <Widget>[
              const Text(
                'Less',
                style: TextStyle(
                  fontSize: 10,
                  fontFamily: 'monospace',
                  color: AppColors.textMuted,
                ),
              ),
              const SizedBox(width: 6),
              for (final n in [0, 1, 2, 3, 5])
                Container(
                  width: 11,
                  height: 11,
                  margin: const EdgeInsets.only(right: 3),
                  decoration: BoxDecoration(
                    color: ActivityDay.intensityColor(n),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              const SizedBox(width: 3),
              const Text(
                'More',
                style: TextStyle(
                  fontSize: 10,
                  fontFamily: 'monospace',
                  color: AppColors.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _summaryStat(String value, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(fontSize: 13, color: Color(0xFF6E645A)),
        ),
      ],
    );
  }
}
