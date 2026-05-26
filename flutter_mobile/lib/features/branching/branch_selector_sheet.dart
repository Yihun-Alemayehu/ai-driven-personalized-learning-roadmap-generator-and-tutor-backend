import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_client.dart';
import '../../core/api/branching_api.dart';

class BranchSelectorSheet extends ConsumerStatefulWidget {
  const BranchSelectorSheet({
    required this.enrollmentId,
    super.key,
  });

  final String enrollmentId;

  @override
  ConsumerState<BranchSelectorSheet> createState() => _BranchSelectorSheetState();
}

class _BranchSelectorSheetState extends ConsumerState<BranchSelectorSheet> {
  List<BranchPath> _branches = [];
  bool _isLoading = true;
  String? _error;
  String? _selectedBranchId;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadBranches();
  }

  Future<void> _loadBranches() async {
    try {
      final api = ref.read(branchingApiProvider);
      final branches = await api.getBranches(widget.enrollmentId);
      setState(() {
        _branches = branches;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _selectBranch(String branchId) async {
    setState(() {
      _selectedBranchId = branchId;
      _isSubmitting = true;
    });

    try {
      final api = ref.read(branchingApiProvider);
      await api.selectBranch(
        enrollmentId: widget.enrollmentId,
        branchPath: branchId,
      );
      if (mounted) {
        Navigator.of(context).pop(branchId);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Branch changed successfully')),
        );
      }
    } catch (e) {
      setState(() => _isSubmitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) {
        return Column(
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.only(top: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            
            // Header
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      'Choose next path',
                      style: theme.textTheme.headlineSmall,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            
            // Content
            Expanded(
              child: _buildContent(theme),
            ),
          ],
        );
      },
    );
  }

  Widget _buildContent(ThemeData theme) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text('Failed to load branches'),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: _loadBranches,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_branches.isEmpty) {
      return const Center(
        child: Text('No alternative paths available'),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: _branches.length,
      itemBuilder: (context, index) {
        final branch = _branches[index];
        final isSelected = _selectedBranchId == branch.id;
        
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          color: isSelected ? theme.colorScheme.primaryContainer : null,
          child: ListTile(
            title: Text(branch.name),
            subtitle: branch.description != null
                ? Text(branch.description!)
                : null,
            leading: Icon(
              isSelected ? Icons.check_circle : Icons.route,
              color: isSelected ? theme.colorScheme.primary : null,
            ),
            trailing: _isSubmitting && isSelected
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: _isSubmitting ? null : () => _selectBranch(branch.id),
          ),
        );
      },
    );
  }
}

/// Provider for BranchingApi
final branchingApiProvider = Provider<BranchingApi>(
  (ref) => BranchingApi(ref.watch(apiClientProvider).dio),
);
