import 'dart:math';

import 'package:flutter/material.dart';
import 'package:graphview/GraphView.dart';

/// Top-to-bottom cubic connectors from parent bottom center to child top center.
class RoadmapEdgeRenderer extends EdgeRenderer {
  RoadmapEdgeRenderer({this.curveTension = 0.45});

  /// Fraction of vertical gap used for bezier control-point offset (0–1).
  final double curveTension;

  @override
  void renderEdge(Canvas canvas, Edge edge, Paint paint) {
    final source = edge.source;
    final destination = edge.destination;

    if (source == destination) {
      final loop = buildSelfLoopPath(edge, arrowLength: 0);
      if (loop != null) {
        canvas.drawPath(loop.path, paint..style = PaintingStyle.stroke);
      }
      return;
    }

    final fromPos = getNodePosition(source);
    final toPos = getNodePosition(destination);

    final start = Offset(
      fromPos.dx + source.width * 0.5,
      fromPos.dy + source.height,
    );
    final end = Offset(
      toPos.dx + destination.width * 0.5,
      toPos.dy,
    );

    final path = _buildConnectorPath(start, end);
    final stroke = Paint.from(edge.paint ?? paint)
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    canvas.drawPath(path, stroke);
  }

  Path _buildConnectorPath(Offset start, Offset end) {
    final dy = end.dy - start.dy;
    if (dy.abs() < 4 && (end.dx - start.dx).abs() < 4) {
      return Path()..moveTo(start.dx, start.dy)..lineTo(end.dx, end.dy);
    }

    // Vertical DAG: smooth S-curve like the Stitch mock.
    if (dy >= 0) {
      final controlOffset = max(32.0, dy * curveTension);
      return Path()
        ..moveTo(start.dx, start.dy)
        ..cubicTo(
          start.dx,
          start.dy + controlOffset,
          end.dx,
          end.dy - controlOffset,
          end.dx,
          end.dy,
        );
    }

    // Rare backward edge: horizontal midline + short verticals.
    final midY = (start.dy + end.dy) * 0.5;
    return Path()
      ..moveTo(start.dx, start.dy)
      ..lineTo(start.dx, midY)
      ..lineTo(end.dx, midY)
      ..lineTo(end.dx, end.dy);
  }
}
