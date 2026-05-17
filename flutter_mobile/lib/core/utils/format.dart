class Format {
  const Format._();

  static String percent(double value) {
    final fixed = (value * 100).toStringAsFixed(0);
    return '$fixed%';
  }

  static String shortDate(DateTime date) {
    final month = date.month.toString().padLeft(2, '0');
    final day = date.day.toString().padLeft(2, '0');
    return '${date.year}-$month-$day';
  }
}
