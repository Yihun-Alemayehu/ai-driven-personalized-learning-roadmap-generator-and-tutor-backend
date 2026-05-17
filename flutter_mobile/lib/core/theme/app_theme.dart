import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

class AppTheme {
  const AppTheme._();

  static ThemeData build() {
    final base = ThemeData.light(useMaterial3: true);

    final heading = GoogleFonts.cormorantGaramond(
      color: AppColors.textPrimary,
      fontWeight: FontWeight.w600,
    );

    final body = GoogleFonts.crimsonText(
      color: AppColors.textBody,
      fontSize: 18,
      height: 1.25,
    );

    return base.copyWith(
      colorScheme: const ColorScheme.light(
        primary: AppColors.accent,
        surface: AppColors.surface,
        outline: AppColors.border,
      ),
      scaffoldBackgroundColor: AppColors.background,
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.textPrimary,
        surfaceTintColor: Colors.transparent,
        centerTitle: false,
        titleTextStyle: heading.copyWith(fontSize: 28),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        margin: const EdgeInsets.all(0),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.border),
        ),
      ),
      textTheme: TextTheme(
        displayLarge: heading.copyWith(fontSize: 42),
        displayMedium: heading.copyWith(fontSize: 36),
        headlineLarge: heading.copyWith(fontSize: 32),
        headlineMedium: heading.copyWith(fontSize: 28),
        headlineSmall: heading.copyWith(fontSize: 24),
        titleLarge: heading.copyWith(fontSize: 22),
        titleMedium: GoogleFonts.crimsonText(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
        bodyLarge: body,
        bodyMedium: body.copyWith(fontSize: 16),
        bodySmall: body.copyWith(fontSize: 14, color: AppColors.textMuted),
        labelLarge: GoogleFonts.crimsonText(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.textBody,
        ),
        labelSmall: GoogleFonts.jetBrainsMono(
          fontSize: 12,
          color: AppColors.textMuted,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.background,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.accent, width: 1.5),
        ),
      ),
      dividerColor: AppColors.border,
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surface,
        selectedItemColor: AppColors.textPrimary,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
