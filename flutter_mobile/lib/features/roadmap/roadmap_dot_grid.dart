import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

/// Subtle dot grid behind the roadmap canvas (Stitch-style, warm palette).
class RoadmapDotGrid extends StatelessWidget {
  const RoadmapDotGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _DotGridPainter(),
      size: Size.infinite,
    );
  }
}

class _DotGridPainter extends CustomPainter {
  static const double _spacing = 24;
  static const double _dotRadius = 0.6;

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      Paint()..color = AppColors.background,
    );

    final dotPaint = Paint()
      ..color = AppColors.border.withValues(alpha: 0.45);

    for (double y = 0; y < size.height; y += _spacing) {
      for (double x = 0; x < size.width; x += _spacing) {
        canvas.drawCircle(Offset(x, y), _dotRadius, dotPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
