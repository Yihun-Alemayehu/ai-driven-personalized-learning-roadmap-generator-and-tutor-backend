import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/models/user.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider).valueOrNull;
    final user = authState?.user;

    if (user == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: <Widget>[
        // Profile Header
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 50,
                  backgroundColor: AppColors.accent,
                  child: Text(
                    _getInitials(user.fullName),
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  user.fullName,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 4),
                Text(
                  user.email,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
                const SizedBox(height: 8),
                Chip(
                  label: Text(_capitalize(user.role.name)),
                  backgroundColor: _getRoleColor(user.role),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Account Section
        Card(
          child: Column(
            children: [
              ListTile(
                leading: const Icon(Icons.settings),
                title: const Text('Settings'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.go('/settings'),
              ),
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Icons.notifications),
                title: const Text('Notifications'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.go('/notifications'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Logout
        Card(
          child: ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text(
              'Log out',
              style: TextStyle(color: Colors.red),
            ),
            onTap: () => _showLogoutConfirm(context, ref),
          ),
        ),
      ],
    );
  }

  String _getInitials(String fullName) {
    final parts = fullName.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return fullName.substring(0, 1).toUpperCase();
  }

  String _capitalize(String s) => s[0].toUpperCase() + s.substring(1);

  Color _getRoleColor(UserRole role) {
    switch (role) {
      case UserRole.admin:
        return Colors.red.shade100;
      case UserRole.instructor:
        return Colors.blue.shade100;
      case UserRole.domainExpert:
        return Colors.green.shade100;
      case UserRole.learner:
        return Colors.orange.shade100;
    }
  }

  void _showLogoutConfirm(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Log out?'),
        content: const Text('You will need to log in again.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              Navigator.of(context).pop();
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) {
                context.go('/login');
              }
            },
            child: const Text('Log out'),
          ),
        ],
      ),
    );
  }
}
