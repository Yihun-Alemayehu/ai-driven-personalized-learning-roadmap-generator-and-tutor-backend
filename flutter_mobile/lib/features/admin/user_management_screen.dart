import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/admin_models.dart';
import '../../core/providers/admin_provider.dart';
import '../../widgets/loading_shimmer.dart';

class UserManagementScreen extends ConsumerWidget {
  const UserManagementScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usersAsync = ref.watch(adminUsersNotifierProvider);

    return usersAsync.when(
        loading: () => const LoadingShimmer(),
        error: (_, __) => const Center(child: Text('Failed to load users')),
        data: (users) {
          if (users.isEmpty) {
            return const Center(child: Text('No users found'));
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(adminUsersNotifierProvider);
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: users.length,
              itemBuilder: (context, index) {
                final user = users[index];
                return _UserTile(user: user);
              },
            ),
          );
        },
      );
  }
}

class _UserTile extends StatelessWidget {
  const _UserTile({required this.user});

  final AdminUser user;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getRoleColor(user.role),
          child: Text(
            user.fullName.isNotEmpty ? user.fullName[0].toUpperCase() : '?',
            style: const TextStyle(color: Colors.white),
          ),
        ),
        title: Text(user.fullName),
        subtitle: Text(user.email),
        trailing: _RoleChip(role: user.role),
        onTap: () => _showRoleOptions(context),
      ),
    );
  }

  Color _getRoleColor(String role) {
    return switch (role.toLowerCase()) {
      'admin' => Colors.red,
      'instructor' => Colors.blue,
      _ => Colors.green,
    };
  }

  void _showRoleOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (_) => _RoleOptionsSheet(user: user),
    );
  }
}

class _RoleChip extends StatelessWidget {
  const _RoleChip({required this.role});

  final String role;

  @override
  Widget build(BuildContext context) {
    final color = switch (role.toLowerCase()) {
      'admin' => Colors.red,
      'instructor' => Colors.blue,
      _ => Colors.green,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        role.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}

class _RoleOptionsSheet extends ConsumerWidget {
  const _RoleOptionsSheet({required this.user});

  final AdminUser user;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final roles = ['learner', 'instructor', 'admin'];

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Change Role for ${user.fullName}',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),
            ...roles.map((role) => ListTile(
                  title: Text(role[0].toUpperCase() + role.substring(1)),
                  leading: Icon(
                    _getRoleIcon(role),
                    color: _getRoleColor(role),
                  ),
                  selected: user.role.toLowerCase() == role,
                  selectedTileColor: Theme.of(context).colorScheme.primaryContainer,
                  onTap: () async {
                    await ref
                        .read(adminUsersNotifierProvider.notifier)
                        .updateUserRole(
                          userId: user.id,
                          role: role,
                        );
                    if (context.mounted) {
                      Navigator.of(context).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Role updated to $role')),
                      );
                    }
                  },
                )),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () async {
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder: (_) => AlertDialog(
                    title: const Text('Delete User?'),
                    content: Text('This will permanently delete ${user.fullName}.'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(false),
                        child: const Text('Cancel'),
                      ),
                      FilledButton(
                        onPressed: () => Navigator.of(context).pop(true),
                        child: const Text('Delete'),
                      ),
                    ],
                  ),
                );
                if (confirmed == true) {
                  await ref
                      .read(adminUsersNotifierProvider.notifier)
                      .deleteUser(user.id);
                  if (context.mounted) {
                    Navigator.of(context).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('User deleted')),
                    );
                  }
                }
              },
              icon: const Icon(Icons.delete, color: Colors.red),
              label: const Text('Delete User', style: TextStyle(color: Colors.red)),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getRoleIcon(String role) {
    return switch (role.toLowerCase()) {
      'admin' => Icons.security,
      'instructor' => Icons.school,
      _ => Icons.person,
    };
  }

  Color _getRoleColor(String role) {
    return switch (role.toLowerCase()) {
      'admin' => Colors.red,
      'instructor' => Colors.blue,
      _ => Colors.green,
    };
  }
}
