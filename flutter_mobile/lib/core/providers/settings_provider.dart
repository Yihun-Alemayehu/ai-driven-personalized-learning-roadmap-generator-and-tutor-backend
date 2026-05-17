import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/enrollment.dart';

class LearningDefaults {
  const LearningDefaults({
    this.weeklyHours,
    this.familiarityLevel,
    this.learningGoal,
    this.aboutSelf,
  });

  final int? weeklyHours;
  final FamiliarityLevel? familiarityLevel;
  final LearningGoal? learningGoal;
  final String? aboutSelf;

  LearningDefaults copyWith({
    int? weeklyHours,
    FamiliarityLevel? familiarityLevel,
    LearningGoal? learningGoal,
    String? aboutSelf,
  }) {
    return LearningDefaults(
      weeklyHours: weeklyHours ?? this.weeklyHours,
      familiarityLevel: familiarityLevel ?? this.familiarityLevel,
      learningGoal: learningGoal ?? this.learningGoal,
      aboutSelf: aboutSelf ?? this.aboutSelf,
    );
  }
}

class SettingsState {
  const SettingsState({
    required this.notificationsEnabled,
    required this.dailyReminderHour,
    required this.learningDefaults,
  });

  final bool notificationsEnabled;
  final int dailyReminderHour;
  final LearningDefaults learningDefaults;

  SettingsState copyWith({
    bool? notificationsEnabled,
    int? dailyReminderHour,
    LearningDefaults? learningDefaults,
  }) {
    return SettingsState(
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      dailyReminderHour: dailyReminderHour ?? this.dailyReminderHour,
      learningDefaults: learningDefaults ?? this.learningDefaults,
    );
  }
}

final settingsProvider = AsyncNotifierProvider<SettingsNotifier, SettingsState>(
  SettingsNotifier.new,
);

class SettingsNotifier extends AsyncNotifier<SettingsState> {
  static const _notificationsKey = 'notificationsEnabled';
  static const _dailyReminderHourKey = 'dailyReminderHour';
  static const _weeklyHoursKey = 'learningDefaults.weeklyHours';
  static const _familiarityKey = 'learningDefaults.familiarity';
  static const _learningGoalKey = 'learningDefaults.learningGoal';
  static const _aboutSelfKey = 'learningDefaults.aboutSelf';

  @override
  Future<SettingsState> build() async {
    final prefs = await SharedPreferences.getInstance();

    return SettingsState(
      notificationsEnabled: prefs.getBool(_notificationsKey) ?? true,
      dailyReminderHour: prefs.getInt(_dailyReminderHourKey) ?? 19,
      learningDefaults: LearningDefaults(
        weeklyHours: prefs.getInt(_weeklyHoursKey),
        familiarityLevel:
            familiarityLevelFromJson(prefs.getString(_familiarityKey)),
        learningGoal: learningGoalFromJson(prefs.getString(_learningGoalKey)),
        aboutSelf: prefs.getString(_aboutSelfKey),
      ),
    );
  }

  Future<void> setNotificationsEnabled(bool value) async {
    final current = state.valueOrNull;
    if (current == null) {
      return;
    }

    state = AsyncData(current.copyWith(notificationsEnabled: value));
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_notificationsKey, value);
  }

  Future<void> setDailyReminderHour(int value) async {
    final current = state.valueOrNull;
    if (current == null) {
      return;
    }

    state = AsyncData(current.copyWith(dailyReminderHour: value));
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_dailyReminderHourKey, value);
  }

  Future<void> setLearningDefaults(LearningDefaults defaults) async {
    final current = state.valueOrNull;
    if (current == null) {
      return;
    }

    state = AsyncData(current.copyWith(learningDefaults: defaults));
    final prefs = await SharedPreferences.getInstance();

    if (defaults.weeklyHours != null) {
      await prefs.setInt(_weeklyHoursKey, defaults.weeklyHours!);
    } else {
      await prefs.remove(_weeklyHoursKey);
    }

    if (defaults.familiarityLevel != null) {
      await prefs.setString(
        _familiarityKey,
        familiarityLevelToJson(defaults.familiarityLevel!),
      );
    } else {
      await prefs.remove(_familiarityKey);
    }

    if (defaults.learningGoal != null) {
      await prefs.setString(
        _learningGoalKey,
        learningGoalToJson(defaults.learningGoal!),
      );
    } else {
      await prefs.remove(_learningGoalKey);
    }

    if (defaults.aboutSelf != null && defaults.aboutSelf!.trim().isNotEmpty) {
      await prefs.setString(_aboutSelfKey, defaults.aboutSelf!.trim());
    } else {
      await prefs.remove(_aboutSelfKey);
    }
  }
}
