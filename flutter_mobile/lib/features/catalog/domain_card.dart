import 'package:flutter/material.dart';

import '../../core/models/domain.dart';
import '../../core/models/enrollment.dart';
import '../../core/theme/app_colors.dart';
import 'domain_meta.dart';

class DomainCard extends StatelessWidget {
  const DomainCard({
    required this.domain,
    this.enrollment,
    required this.onTap,
    super.key,
  });

  final Domain domain;
  final Enrollment? enrollment;
  final VoidCallback onTap;

  bool get _isEnrolled => enrollment != null;

  @override
  Widget build(BuildContext context) {
    final meta = domainMetaForSlug(domain.slug);

    return Material(
      color: AppColors.background,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                _DomainIcon(meta: meta, iconUrl: domain.iconUrl),
                const SizedBox(height: 16),
                Text(
                  domain.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontSize: 18,
                        height: 1.2,
                        color: const Color(0xFF3D342A),
                        fontWeight: FontWeight.w600,
                      ),
                ),
                if (domain.description != null &&
                    domain.description!.trim().isNotEmpty) ...<Widget>[
                  const SizedBox(height: 6),
                  Expanded(
                    child: Text(
                      domain.description!.trim(),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontSize: 14,
                            height: 1.35,
                            color: const Color(0xFF6E645A),
                          ),
                    ),
                  ),
                ] else
                  const Spacer(),
                const SizedBox(height: 12),
                Row(
                  children: <Widget>[
                    if (_isEnrolled)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0FDF4),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          'Enrolled',
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                color: const Color(0xFF16A34A),
                                fontWeight: FontWeight.w600,
                                fontSize: 11,
                              ),
                        ),
                      )
                    else
                      Text(
                        'Not enrolled',
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: AppColors.textMuted,
                              fontSize: 12,
                            ),
                      ),
                    const Spacer(),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: <Widget>[
                        Text(
                          _isEnrolled ? 'Continue' : 'View',
                          style: Theme.of(context).textTheme.labelLarge?.copyWith(
                                color: AppColors.textMuted,
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                        ),
                        const SizedBox(width: 2),
                        Icon(
                          Icons.arrow_forward,
                          size: 14,
                          color: AppColors.textMuted,
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _DomainIcon extends StatelessWidget {
  const _DomainIcon({required this.meta, this.iconUrl});

  final DomainMeta meta;
  final String? iconUrl;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: meta.background,
        borderRadius: BorderRadius.circular(12),
      ),
      alignment: Alignment.center,
      child: iconUrl != null && iconUrl!.isNotEmpty
          ? Image.network(
              iconUrl!,
              width: 28,
              height: 28,
              errorBuilder: (_, __, ___) => _glyph(),
            )
          : _glyph(),
    );
  }

  Widget _glyph() {
    return Text(
      meta.icon,
      style: TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: meta.accent,
        fontFamily: 'monospace',
      ),
    );
  }
}
