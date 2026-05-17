import 'package:flutter/material.dart';

extension BuildContextX on BuildContext {
  bool get isTablet => MediaQuery.sizeOf(this).width >= 720;
}

extension StringX on String {
  String get sentenceCase {
    if (isEmpty) {
      return this;
    }
    return '${this[0].toUpperCase()}${substring(1)}';
  }
}
