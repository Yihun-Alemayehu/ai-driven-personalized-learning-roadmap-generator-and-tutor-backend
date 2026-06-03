import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_errors.dart';
import '../../core/models/enrollment.dart';
import '../../core/models/user.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/my_learning_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/providers/users_provider.dart';
import '../../core/theme/app_colors.dart';
import '../profile/widgets/account_shared.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _weeklyHoursController = TextEditingController();

  bool _changingPassword = false;
  String? _passwordSuccess;
  String? _passwordError;

  bool _confirmClearHistory = false;
  String? _historyFeedback;

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    _weeklyHoursController.dispose();
    super.dispose();
  }

  Future<void> _changePassword() async {
    setState(() {
      _passwordSuccess = null;
      _passwordError = null;
    });

    final current = _currentPasswordController.text;
    final newPass = _newPasswordController.text;
    final confirm = _confirmPasswordController.text;

    if (newPass != confirm) {
      setState(() {
        _passwordError = 'New password and confirmation must match.';
      });
      return;
    }
    if (newPass.length < 8) {
      setState(() {
        _passwordError = 'New password must be at least 8 characters.';
      });
      return;
    }

    setState(() => _changingPassword = true);

    try {
      final api = ref.read(usersApiProvider);
      await api.changePassword(
        currentPassword: current,
        newPassword: newPass,
        confirmPassword: confirm,
      );
      _currentPasswordController.clear();
      _newPasswordController.clear();
      _confirmPasswordController.clear();
      if (mounted) {
        setState(() {
          _changingPassword = false;
          _passwordSuccess = 'Password updated successfully.';
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _changingPassword = false;
          _passwordError = error is DioException
              ? dioErrorMessage(
                  error,
                  fallback: 'Unable to change password.',
                )
              : 'Unable to change password.';
        });
      }
    }
  }

  Future<void> _clearHistory() async {
    await ref.read(myLearningProvider.notifier).clearAll();
    setState(() {
      _confirmClearHistory = false;
      _historyFeedback = 'Learning history cleared.';
    });
  }

  Future<void> _showDeleteAccountDialog(User user) async {
    final emailController = TextEditingController();
    var deleting = false;
    String? deleteError;

    if (!mounted) return;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            final email = user.email;
            final canDelete = emailController.text.trim().toLowerCase() ==
                email.toLowerCase();

            void onEmailChanged(String _) => setDialogState(() {});

            return AlertDialog(
              backgroundColor: AppColors.background,
              title: const Text(
                'Delete your account?',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    'Type $email to confirm permanent deletion.',
                    style: const TextStyle(color: Color(0xFF6E645A)),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: emailController,
                    keyboardType: TextInputType.emailAddress,
                    onChanged: onEmailChanged,
                    style: const TextStyle(
                      fontSize: 12,
                      fontFamily: 'monospace',
                      color: Color(0xFF6E645A),
                    ),
                    decoration: InputDecoration(
                      hintText: 'your-email@example.com',
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 12,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                    ),
                  ),
                  if (deleteError != null) ...<Widget>[
                    const SizedBox(height: 8),
                    Text(
                      deleteError!,
                      style: const TextStyle(color: AppColors.accent),
                    ),
                  ],
                ],
              ),
              actions: <Widget>[
                TextButton(
                  onPressed: deleting
                      ? null
                      : () => Navigator.of(dialogContext).pop(),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: !canDelete || deleting
                      ? null
                      : () async {
                          setDialogState(() {
                            deleting = true;
                            deleteError = null;
                          });
                          try {
                            await ref.read(usersApiProvider).deleteAccount();
                            if (dialogContext.mounted) {
                              Navigator.of(dialogContext).pop();
                            }
                            await ref.read(authProvider.notifier).logout();
                            if (context.mounted) context.go('/login');
                          } catch (error) {
                            setDialogState(() {
                              deleting = false;
                              deleteError = error is DioException
                                  ? dioErrorMessage(
                                      error,
                                      fallback: 'Failed to delete account.',
                                    )
                                  : 'Failed to delete account.';
                            });
                          }
                        },
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFFB84A3A),
                  ),
                  child: Text(deleting ? 'Deleting…' : 'Delete permanently'),
                ),
              ],
            );
          },
        );
      },
    );

    emailController.dispose();
  }


  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(settingsProvider);
    final user = ref.watch(authProvider).valueOrNull?.user;
    final historyCount =
        ref.watch(myLearningProvider).valueOrNull?.enrollmentToNode.length ?? 0;

    return settings.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => const Center(child: Text('Unable to load settings.')),
      data: (value) {
        if (_weeklyHoursController.text.isEmpty) {
          _weeklyHoursController.text =
              value.learningDefaults.weeklyHoursGoal.toString();
        }

        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
          children: <Widget>[
            const Text(
              'Manage your security, learning defaults, and account preferences.',
              style: TextStyle(fontSize: 15, color: Color(0xFF6E645A)),
            ),
            const SizedBox(height: 20),
            AccountCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const AccountSectionTitle('Security'),
                  const SizedBox(height: 16),
                  const AccountFieldLabel('Current password'),
                  const SizedBox(height: 6),
                  AccountTextField(
                    controller: _currentPasswordController,
                    obscureText: true,
                  ),
                  const SizedBox(height: 12),
                  const AccountFieldLabel('New password'),
                  const SizedBox(height: 6),
                  AccountTextField(
                    controller: _newPasswordController,
                    obscureText: true,
                  ),
                  const SizedBox(height: 12),
                  const AccountFieldLabel('Confirm new password'),
                  const SizedBox(height: 6),
                  AccountTextField(
                    controller: _confirmPasswordController,
                    obscureText: true,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: <Widget>[
                      AccountPrimaryButton(
                        label: _changingPassword
                            ? 'Updating…'
                            : 'Change password',
                        loading: _changingPassword,
                        onPressed: _changingPassword ? null : _changePassword,
                      ),
                      if (_passwordSuccess != null) ...<Widget>[
                        const SizedBox(width: 12),
                        Flexible(
                          child: Text(
                            _passwordSuccess!,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Color(0xFF2D6A3E),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  if (_passwordError != null) ...<Widget>[
                    const SizedBox(height: 8),
                    Text(
                      _passwordError!,
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.accent,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),
            AccountCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const AccountSectionTitle('Learning Defaults'),
                  const SizedBox(height: 8),
                  const Text(
                    'These defaults auto-fill when you enroll in a new course.',
                    style: TextStyle(fontSize: 15, color: Color(0xFF6E645A)),
                  ),
                  const SizedBox(height: 16),
                  const AccountFieldLabel('Weekly hours goal'),
                  const SizedBox(height: 6),
                  SizedBox(
                    width: 160,
                    child: AccountTextField(
                      controller: _weeklyHoursController,
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: AccountPrimaryButton(
                      label: 'Save hours',
                      onPressed: () {
                        final parsed =
                            int.tryParse(_weeklyHoursController.text);
                        if (parsed != null) {
                          ref
                              .read(settingsProvider.notifier)
                              .setWeeklyHoursGoal(parsed);
                        }
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                  const AccountFieldLabel('Starting familiarity level'),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: FamiliarityLevel.values.map((level) {
                      final selected =
                          value.learningDefaults.familiarityLevel == level;
                      return AccountChoiceChip(
                        label: familiarityLabel(level),
                        selected: selected,
                        onTap: () => ref
                            .read(settingsProvider.notifier)
                            .setFamiliarityLevel(level),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  const AccountFieldLabel('Learning goal'),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: LearningGoal.values.map((goal) {
                      final selected =
                          value.learningDefaults.learningGoal == goal;
                      return AccountChoiceChip(
                        label: learningGoalLabel(goal),
                        selected: selected,
                        accent: const Color(0xFF4A6FA5),
                        onTap: () => ref
                            .read(settingsProvider.notifier)
                            .setLearningGoal(goal),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            AccountCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const AccountSectionTitle('Notification Preferences'),
                  const SizedBox(height: 12),
                  AccountPillToggle(
                    label: 'Decay reminders',
                    value: value.notifications.decayReminders,
                    onChanged: (v) => ref
                        .read(settingsProvider.notifier)
                        .setNotificationPreference(decayReminders: v),
                  ),
                  const Divider(height: 24, color: AppColors.border),
                  AccountPillToggle(
                    label: 'Quiz result notifications',
                    value: value.notifications.quizResultNotifications,
                    onChanged: (v) => ref
                        .read(settingsProvider.notifier)
                        .setNotificationPreference(
                          quizResultNotifications: v,
                        ),
                  ),
                  const Divider(height: 24, color: AppColors.border),
                  AccountPillToggle(
                    label: 'Mastery achievements',
                    value: value.notifications.masteryAchievements,
                    onChanged: (v) => ref
                        .read(settingsProvider.notifier)
                        .setNotificationPreference(masteryAchievements: v),
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: AppColors.border),
                  const SizedBox(height: 12),
                  AccountPillToggle(
                    label: 'Enable daily reminders',
                    value: value.notificationsEnabled,
                    onChanged: (v) => ref
                        .read(settingsProvider.notifier)
                        .setNotificationsEnabled(v),
                  ),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
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
                ],
              ),
            ),
            const SizedBox(height: 16),
            AccountCard(
              borderColor: AppColors.accent.withValues(alpha: 0.4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const AccountSectionTitle('Danger Zone'),
                  const SizedBox(height: 12),
                  _DangerRow(
                    title: 'Clear My Learning history',
                    subtitle:
                        'Removes $historyCount recent items from the sidebar history.',
                    buttonLabel: 'Clear history',
                    onPressed: () => setState(() {
                      _historyFeedback = null;
                      _confirmClearHistory = true;
                    }),
                  ),
                  if (_confirmClearHistory) ...<Widget>[
                    const SizedBox(height: 8),
                    Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      spacing: 8,
                      children: <Widget>[
                        const Text(
                          'Confirm clearing your sidebar learning history?',
                          style: TextStyle(
                            fontSize: 13,
                            color: Color(0xFF7A3A2E),
                          ),
                        ),
                        TextButton(
                          onPressed: _clearHistory,
                          child: const Text('Yes, clear'),
                        ),
                        TextButton(
                          onPressed: () =>
                              setState(() => _confirmClearHistory = false),
                          child: const Text('Cancel'),
                        ),
                      ],
                    ),
                  ],
                  if (_historyFeedback != null) ...<Widget>[
                    const SizedBox(height: 8),
                    Text(
                      _historyFeedback!,
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF2D6A3E),
                      ),
                    ),
                  ],
                  const SizedBox(height: 12),
                  _DangerRow(
                    title: 'Delete account',
                    subtitle:
                        'Permanently deletes your account and learning data.',
                    buttonLabel: 'Delete account',
                    onPressed: user == null
                        ? () {}
                        : () => _showDeleteAccountDialog(user),
                  ),
                  const SizedBox(height: 16),
                  OutlinedButton.icon(
                    onPressed: () async {
                      await ref.read(authProvider.notifier).logout();
                      if (context.mounted) context.go('/login');
                    },
                    icon: const Icon(Icons.logout),
                    label: const Text('Log out'),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

class _DangerRow extends StatelessWidget {
  const _DangerRow({
    required this.title,
    required this.subtitle,
    required this.buttonLabel,
    required this.onPressed,
  });

  final String title;
  final String subtitle;
  final String buttonLabel;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7F4),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFF0D9C8)),
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 15,
                    color: Color(0xFF3A342E),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          OutlinedButton(
            onPressed: onPressed,
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFFB84A3A),
              side: const BorderSide(color: Color(0xFFE1B8AA)),
            ),
            child: Text(buttonLabel, style: const TextStyle(fontSize: 13)),
          ),
        ],
      ),
    );
  }
}
