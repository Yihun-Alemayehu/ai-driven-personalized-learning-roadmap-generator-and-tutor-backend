import 'package:flutter/material.dart';

class RoadmapPainter extends CustomPainter {
  RoadmapPainter({required this.lines});

  final List<(Offset start, Offset end)> lines;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke
      ..color = const Color(0xFFD6CFBF);

    for (final segment in lines) {
      canvas.drawLine(segment.$1, segment.$2, paint);
    }
  }

  @override
  bool shouldRepaint(covariant RoadmapPainter oldDelegate) {
    return oldDelegate.lines != lines;
  }
}
