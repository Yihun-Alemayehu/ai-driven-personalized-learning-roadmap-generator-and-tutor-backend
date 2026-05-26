import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/admin_models.dart';
import '../../core/providers/admin_provider.dart';
import '../../widgets/loading_shimmer.dart';

class DomainManagementScreen extends ConsumerWidget {
  const DomainManagementScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final domainsAsync = ref.watch(adminDomainsNotifierProvider);

    return domainsAsync.when(
        loading: () => const LoadingShimmer(),
        error: (_, __) => const Center(child: Text('Failed to load domains')),
        data: (domains) {
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(adminDomainsNotifierProvider);
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: domains.length + 1,
              itemBuilder: (context, index) {
                if (index == 0) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: FilledButton.icon(
                      onPressed: () => _showAddDomainSheet(context, ref),
                      icon: const Icon(Icons.add),
                      label: const Text('Add Domain'),
                    ),
                  );
                }
                final domain = domains[index - 1];
                return _DomainTile(domain: domain);
              },
            ),
          );
        },
      );
  }

  void _showAddDomainSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => _AddDomainSheet(
        onAdd: (name, slug, description) async {
          await ref.read(adminDomainsNotifierProvider.notifier).createDomain(
            name: name,
            slug: slug,
            description: description,
          );
          if (context.mounted) {
            Navigator.of(context).pop();
          }
        },
      ),
    );
  }
}

class _DomainTile extends StatelessWidget {
  const _DomainTile({required this.domain});

  final AdminDomain domain;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(domain.name),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Slug: ${domain.slug}'),
            if (domain.description != null)
              Text(
                domain.description!,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
          ],
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => _showEditDomainSheet(context),
      ),
    );
  }

  void _showEditDomainSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => _EditDomainSheet(domain: domain),
    );
  }
}

class _AddDomainSheet extends StatefulWidget {
  const _AddDomainSheet({required this.onAdd});

  final Function(String name, String slug, String? description) onAdd;

  @override
  State<_AddDomainSheet> createState() => _AddDomainSheetState();
}

class _AddDomainSheetState extends State<_AddDomainSheet> {
  final _nameController = TextEditingController();
  final _slugController = TextEditingController();
  final _descriptionController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _slugController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Add New Domain',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Domain Name',
              hintText: 'e.g., Machine Learning',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _slugController,
            decoration: const InputDecoration(
              labelText: 'Slug',
              hintText: 'e.g., machine-learning',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _descriptionController,
            decoration: const InputDecoration(
              labelText: 'Description (optional)',
              hintText: 'Brief description of the domain',
              border: OutlineInputBorder(),
            ),
            maxLines: 3,
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: () {
              widget.onAdd(
                _nameController.text,
                _slugController.text,
                _descriptionController.text.isEmpty
                    ? null
                    : _descriptionController.text,
              );
            },
            child: const Text('Create Domain'),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _EditDomainSheet extends ConsumerWidget {
  const _EditDomainSheet({required this.domain});

  final AdminDomain domain;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController(text: domain.name);
    final descController = TextEditingController(text: domain.description);

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Edit Domain',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          TextField(
            controller: nameController,
            decoration: const InputDecoration(
              labelText: 'Domain Name',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: descController,
            decoration: const InputDecoration(
              labelText: 'Description',
              border: OutlineInputBorder(),
            ),
            maxLines: 3,
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: () async {
              await ref
                  .read(adminDomainsNotifierProvider.notifier)
                  .updateDomain(
                    domainId: domain.id,
                    name: nameController.text,
                    description: descController.text,
                  );
              if (context.mounted) {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Domain updated')),
                );
              }
            },
            child: const Text('Save Changes'),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
