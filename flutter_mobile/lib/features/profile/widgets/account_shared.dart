import 'package:flutter/material.dart';

import '../../../core/models/user.dart';
import '../../../core/theme/app_colors.dart';

class AccountSectionHeader extends StatelessWidget {
  const AccountSectionHeader(this.label, {super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Text(
        label.toUpperCase(),
        style: const TextStyle(
          fontSize: 11,
          letterSpacing: 1.2,
          fontFamily: 'monospace',
          color: AppColors.textMuted,
        ),
      ),
    );
  }
}

class AccountCard extends StatelessWidget {
  const AccountCard({
    required this.child,
    this.padding = const EdgeInsets.all(18),
    this.borderColor,
    super.key,
  });

  final Widget child;
  final EdgeInsets padding;
  final Color? borderColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor ?? AppColors.border),
      ),
      child: child,
    );
  }
}

class AccountSectionTitle extends StatelessWidget {
  const AccountSectionTitle(this.title, {super.key});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
    );
  }
}

class AccountFieldLabel extends StatelessWidget {
  const AccountFieldLabel(this.label, {super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Text(
      label.toUpperCase(),
      style: const TextStyle(
        fontSize: 11,
        letterSpacing: 0.8,
        fontFamily: 'monospace',
        color: AppColors.textMuted,
      ),
    );
  }
}

class AccountTextField extends StatelessWidget {
  const AccountTextField({
    required this.controller,
    this.hint,
    this.keyboardType,
    this.obscureText = false,
    this.mono = false,
    super.key,
  });

  final TextEditingController controller;
  final String? hint;
  final TextInputType? keyboardType;
  final bool obscureText;
  final bool mono;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: obscureText,
      style: TextStyle(
        fontSize: mono ? 12 : 15,
        fontFamily: mono ? 'monospace' : null,
        color: mono ? const Color(0xFF6E645A) : AppColors.textPrimary,
      ),
      decoration: InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.accent, width: 1.5),
        ),
      ),
    );
  }
}

class AccountPrimaryButton extends StatelessWidget {
  const AccountPrimaryButton({
    required this.label,
    required this.onPressed,
    this.loading = false,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      onPressed: loading ? null : onPressed,
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.textPrimary,
        foregroundColor: AppColors.background,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      child: loading
          ? const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: AppColors.background,
              ),
            )
          : Text(label, style: const TextStyle(fontSize: 14)),
    );
  }
}

class AccountPillToggle extends StatelessWidget {
  const AccountPillToggle({
    required this.label,
    required this.value,
    required this.onChanged,
    super.key,
  });

  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        Expanded(
          child: Text(
            label,
            style: const TextStyle(fontSize: 15, color: Color(0xFF3A342E)),
          ),
        ),
        Switch(
          value: value,
          onChanged: onChanged,
          activeTrackColor: AppColors.accent.withValues(alpha: 0.5),
          activeThumbColor: AppColors.accent,
        ),
      ],
    );
  }
}

class AccountChoiceChip extends StatelessWidget {
  const AccountChoiceChip({
    required this.label,
    required this.selected,
    required this.onTap,
    this.accent,
    super.key,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;
  final Color? accent;

  @override
  Widget build(BuildContext context) {
    final color = accent ?? AppColors.accent;
    return Material(
      color: selected ? color.withValues(alpha: 0.1) : Colors.white,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: selected ? color : AppColors.border),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                color: const Color(0xFF3A342E),
                fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

String userInitials(String fullName) {
  final parts = fullName.trim().split(RegExp(r'\s+'));
  if (parts.length >= 2) {
    return '${parts.first[0]}${parts[1][0]}'.toUpperCase();
  }
  if (parts.isNotEmpty && parts.first.isNotEmpty) {
    return parts.first.substring(0, 1).toUpperCase();
  }
  return '?';
}

String roleLabel(UserRole role) {
  switch (role) {
    case UserRole.admin:
      return 'Admin';
    case UserRole.domainExpert:
      return 'Domain Expert';
    case UserRole.instructor:
      return 'Instructor';
    case UserRole.learner:
      return 'Learner';
  }
}

Color roleBadgeBackground(UserRole role) {
  switch (role) {
    case UserRole.admin:
      return const Color(0xFFE8E0F5);
    case UserRole.domainExpert:
      return const Color(0xFFE5F0E8);
    case UserRole.instructor:
      return const Color(0xFFE8E0F5);
    case UserRole.learner:
      return AppColors.hover;
  }
}

Color roleBadgeColor(UserRole role) {
  switch (role) {
    case UserRole.admin:
      return const Color(0xFF4A3D8F);
    case UserRole.domainExpert:
      return const Color(0xFF2D6A3E);
    case UserRole.instructor:
      return const Color(0xFF4A3D8F);
    case UserRole.learner:
      return const Color(0xFF6E645A);
  }
}
