import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

class AppTextStyles {
  const AppTextStyles._();

  static TextStyle get heading1 => GoogleFonts.cormorantGaramond(
        fontSize: 32,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      );

  static TextStyle get heading2 => GoogleFonts.cormorantGaramond(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      );

  static TextStyle get body =>
      GoogleFonts.crimsonText(fontSize: 18, color: AppColors.textBody);

  static TextStyle get label => GoogleFonts.crimsonText(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: AppColors.textBody,
      );

  static TextStyle get mono =>
      GoogleFonts.jetBrainsMono(fontSize: 13, color: AppColors.textMuted);
}
