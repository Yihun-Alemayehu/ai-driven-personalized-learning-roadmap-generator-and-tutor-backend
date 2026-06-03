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
      clipBehavior: Clip.antiAlias,
      elevation: 0.5,
      shadowColor: Colors.black.withValues(alpha: 0.06),
      surfaceTintColor: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Container(
                height: 4,
                decoration: BoxDecoration(
                  color: meta.accent.withValues(alpha: 0.6),
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(16),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    _DomainIcon(meta: meta, iconUrl: domain.iconUrl),
                    const SizedBox(height: 14),
                    Text(
                      domain.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontSize: 18,
                            height: 1.2,
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    if (domain.description != null &&
                        domain.description!.trim().isNotEmpty) ...<Widget>[
                      const SizedBox(height: 6),
                      Text(
                        domain.description!.trim(),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              fontSize: 14,
                              height: 1.35,
                              color: AppColors.textBody,
                            ),
                      ),
                    ],
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
                                    color: meta.accent,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                            ),
                            const SizedBox(width: 2),
                            Icon(
                              Icons.arrow_forward,
                              size: 14,
                              color: meta.accent,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
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
      width: 52,
      height: 52,
      decoration: BoxDecoration(
        color: meta.background,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: meta.accent.withValues(alpha: 0.2)),
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
        fontSize: 24,
        fontWeight: FontWeight.w700,
        color: meta.accent,
        fontFamily: 'monospace',
      ),
    );
  }
}
