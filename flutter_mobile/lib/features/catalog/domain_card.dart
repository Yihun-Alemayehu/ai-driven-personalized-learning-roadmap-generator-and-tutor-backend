import 'package:flutter/material.dart';

import '../../core/models/domain.dart';
import '../../core/theme/app_colors.dart';

class DomainCard extends StatelessWidget {
  const DomainCard({
    required this.domain,
    required this.isEnrolled,
    required this.onTap,
    super.key,
  });

  final Domain domain;
  final bool isEnrolled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      domain.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style:
                          Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontSize: 20,
                              ),
                    ),
                  ),
                  if (isEnrolled)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF3D8B5E).withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(
                          color: const Color(0xFF3D8B5E).withValues(alpha: 0.4),
                        ),
                      ),
                      child: Text(
                        'Enrolled',
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: const Color(0xFF3D8B5E),
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              Expanded(
                child: Text(
                  domain.displayDescription,
                  maxLines: 4,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontSize: 14,
                        color: AppColors.textBody,
                      ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                domain.nodeCount == null
                    ? 'Node count unavailable'
                    : '${domain.nodeCount} nodes',
                style: Theme.of(context).textTheme.labelSmall,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
