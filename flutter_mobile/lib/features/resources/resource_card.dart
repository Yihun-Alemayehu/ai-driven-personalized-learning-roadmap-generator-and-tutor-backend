import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/models/resource.dart';
import '../../core/providers/resources_provider.dart';

class ResourceCard extends ConsumerStatefulWidget {
  const ResourceCard({
    required this.resource,
    required this.nodeId,
    super.key,
  });

  final Resource resource;
  final String nodeId;

  @override
  ConsumerState<ResourceCard> createState() => _ResourceCardState();
}

class _ResourceCardState extends ConsumerState<ResourceCard> {
  int? _localRating;
  bool _isSubmitting = false;

  Future<void> _copyUrl() async {
    await Clipboard.setData(ClipboardData(text: widget.resource.url));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('URL copied to clipboard')),
      );
    }
  }

  Future<void> _openUrl() async {
    final uri = Uri.parse(widget.resource.url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open URL')),
        );
      }
    }
  }

  Future<void> _rate(int rating) async {
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);
    
    try {
      final api = ref.read(resourcesApiProvider);
      await api.rateResource(
        resourceId: widget.resource.id,
        rating: rating,
      );
      setState(() => _localRating = rating);
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  IconData _getModalityIcon(ResourceModality modality) {
    return switch (modality) {
      ResourceModality.documentation => Icons.description,
      ResourceModality.tutorial => Icons.school,
      ResourceModality.video => Icons.video_library,
      ResourceModality.interactive => Icons.touch_app,
      ResourceModality.reference => Icons.book,
    };
  }

  String _getModalityLabel(ResourceModality modality) {
    return switch (modality) {
      ResourceModality.documentation => 'Docs',
      ResourceModality.tutorial => 'Tutorial',
      ResourceModality.video => 'Video',
      ResourceModality.interactive => 'Interactive',
      ResourceModality.reference => 'Reference',
    };
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final displayRating = _localRating ?? widget.resource.avgRating.round();

    return InkWell(
      onTap: _openUrl,
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title row
            Row(
              children: [
                Expanded(
                  child: Text(
                    widget.resource.title,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                if (widget.resource.isPrimary)
                  Chip(
                    label: const Text('Primary'),
                    backgroundColor: theme.colorScheme.primaryContainer,
                  ),
              ],
            ),
            const SizedBox(height: 8),
            
            // Source & modality
            Row(
              children: [
                Icon(_getModalityIcon(widget.resource.modality), size: 16),
                const SizedBox(width: 4),
                Text(
                  '${_getModalityLabel(widget.resource.modality)} • ${widget.resource.sourceDomain}',
                  style: theme.textTheme.bodySmall,
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.copy, size: 20),
                  onPressed: _copyUrl,
                  tooltip: 'Copy URL',
                ),
              ],
            ),
            
            if (widget.resource.description != null) ...[
              const SizedBox(height: 8),
              Text(
                widget.resource.description!,
                style: theme.textTheme.bodySmall,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            
            const SizedBox(height: 12),
            
            // Rating row
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  Text('Rate: ', style: theme.textTheme.bodySmall),
                  ...List.generate(5, (index) {
                    final starValue = index + 1;
                    return InkWell(
                      onTap: _isSubmitting ? null : () => _rate(starValue),
                      child: Padding(
                        padding: const EdgeInsets.all(4),
                        child: Icon(
                          starValue <= displayRating ? Icons.star : Icons.star_border,
                          size: 20,
                          color: starValue <= displayRating ? Colors.amber : null,
                        ),
                      ),
                    );
                  }),
                  const SizedBox(width: 8),
                  Text(
                    '(${widget.resource.avgRating.toStringAsFixed(1)})',
                    style: theme.textTheme.bodySmall,
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
