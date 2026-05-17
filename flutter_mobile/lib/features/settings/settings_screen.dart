import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/auth_provider.dart';
import '../../core/providers/settings_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);

    return settings.when(
      data: (value) {
        return ListView(
          padding: const EdgeInsets.all(16),
          children: <Widget>[
            Card(
              child: SwitchListTile(
                value: value.notificationsEnabled,
                onChanged: (newValue) => ref
                    .read(settingsProvider.notifier)
                    .setNotificationsEnabled(newValue),
                title: const Text('Enable reminders'),
                subtitle: const Text('Local decay and mastery notifications'),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                title: const Text('Daily reminder hour'),
                subtitle: Text('${value.dailyReminderHour}:00'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () async {
                  final selected = await showModalBottomSheet<int>(
                    context: context,
                    showDragHandle: true,
                    builder: (_) {
                      return ListView.builder(
                        itemCount: 24,
                        itemBuilder: (_, index) => ListTile(
                          title: Text('$index:00'),
                          onTap: () => Navigator.of(context).pop(index),
                        ),
                      );
                    },
                  );

                  if (selected != null) {
                    await ref
                        .read(settingsProvider.notifier)
                        .setDailyReminderHour(selected);
                  }
                },
              ),
            ),
            const SizedBox(height: 20),
            OutlinedButton.icon(
              onPressed: () => ref.read(authProvider.notifier).logout(),
              icon: const Icon(Icons.logout),
              label: const Text('Log out'),
            ),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => const Center(child: Text('Unable to load settings.')),
    );
  }
}
