import 'package:flutter/material.dart';

/// Visual identity per domain slug (mirrors web `domainIcons.ts`).
class DomainMeta {
  const DomainMeta({
    required this.icon,
    required this.background,
    required this.accent,
  });

  final String icon;
  final Color background;
  final Color accent;
}

const _metaBySlug = <String, DomainMeta>{
  'frontend-development': DomainMeta(
    icon: '⬡',
    background: Color(0xFFE8F4F8),
    accent: Color(0xFF0EA5E9),
  ),
  'backend-development': DomainMeta(
    icon: '⚙',
    background: Color(0xFFF0FDF4),
    accent: Color(0xFF16A34A),
  ),
  'data-science': DomainMeta(
    icon: '◈',
    background: Color(0xFFFEF9EE),
    accent: Color(0xFFD97706),
  ),
  'devops': DomainMeta(
    icon: '∞',
    background: Color(0xFFFDF4FF),
    accent: Color(0xFF9333EA),
  ),
};

const _fallback = DomainMeta(
  icon: '◆',
  background: Color(0xFFF3EFE7),
  accent: Color(0xFFB85C38),
);

DomainMeta domainMetaForSlug(String slug) => _metaBySlug[slug] ?? _fallback;
