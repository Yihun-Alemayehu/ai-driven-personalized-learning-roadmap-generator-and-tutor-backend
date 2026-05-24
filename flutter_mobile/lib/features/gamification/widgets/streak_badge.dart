import 'package:flutter/material.dart';

/// Streak display badge with fire icon
class StreakBadge extends StatelessWidget {
  final int streak;

  const StreakBadge({required this.streak, super.key});

  @override
  Widget build(BuildContext context) {
    final hasStreak = streak > 0;
    final isLongStreak = streak >= 5;
    
    return Center(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: hasStreak 
            ? Colors.orange.withOpacity(0.1) 
            : Colors.grey[200],
          borderRadius: BorderRadius.circular(24),
          border: hasStreak
            ? Border.all(color: Colors.orange.withOpacity(0.3))
            : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.local_fire_department,
              color: hasStreak 
                ? (isLongStreak ? Colors.orange[700] : Colors.orange) 
                : Colors.grey,
              size: 28,
            ),
            const SizedBox(width: 8),
            Text(
              hasStreak 
                ? '$streak day${streak > 1 ? 's' : ''}' 
                : 'No streak',
              style: TextStyle(
                color: hasStreak ? Colors.orange[800] : Colors.grey[600],
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
