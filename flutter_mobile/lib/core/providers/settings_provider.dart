import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/enrollment.dart';

class NotificationPreferences {
  const NotificationPreferences({
    required this.decayReminders,
    required this.quizResultNotifications,
    required this.masteryAchievements,
  });

  final bool decayReminders;
  final bool quizResultNotifications;
  final bool masteryAchievements;

  NotificationPreferences copyWith({
    bool? decayReminders,
    bool? quizResultNotifications,
    bool? masteryAchievements,
  }) {
    return NotificationPreferences(
      decayReminders: decayReminders ?? this.decayReminders,
      quizResultNotifications:
          quizResultNotifications ?? this.quizResultNotifications,
      masteryAchievements: masteryAchievements ?? this.masteryAchievements,
    );
  }
}

class LearningDefaults {
  const LearningDefaults({
    this.weeklyHoursGoal = 8,
    this.familiarityLevel = FamiliarityLevel.beginner,
    this.learningGoal = LearningGoal.upskill,
    this.aboutSelf,
  });

  final int weeklyHoursGoal;
  final FamiliarityLevel familiarityLevel;
  final LearningGoal learningGoal;
  final String? aboutSelf;

  LearningDefaults copyWith({
    int? weeklyHoursGoal,
    FamiliarityLevel? familiarityLevel,
    LearningGoal? learningGoal,
    String? aboutSelf,
  }) {
    return LearningDefaults(
      weeklyHoursGoal: weeklyHoursGoal ?? this.weeklyHoursGoal,
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
    required this.notifications,
  });

  final bool notificationsEnabled;
  final int dailyReminderHour;
  final LearningDefaults learningDefaults;
  final NotificationPreferences notifications;

  SettingsState copyWith({
    bool? notificationsEnabled,
    int? dailyReminderHour,
    LearningDefaults? learningDefaults,
    NotificationPreferences? notifications,
  }) {
    return SettingsState(
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      dailyReminderHour: dailyReminderHour ?? this.dailyReminderHour,
      learningDefaults: learningDefaults ?? this.learningDefaults,
      notifications: notifications ?? this.notifications,
    );
  }
}

final settingsProvider = AsyncNotifierProvider<SettingsNotifier, SettingsState>(
  SettingsNotifier.new,
);

class SettingsNotifier extends AsyncNotifier<SettingsState> {
  static const _notificationsKey = 'notificationsEnabled';
  static const _dailyReminderHourKey = 'dailyReminderHour';
  static const _weeklyHoursKey = 'learningDefaults.weeklyHoursGoal';
  static const _familiarityKey = 'learningDefaults.familiarity';
  static const _learningGoalKey = 'learningDefaults.learningGoal';
  static const _aboutSelfKey = 'learningDefaults.aboutSelf';
  static const _decayRemindersKey = 'notifications.decayReminders';
  static const _quizResultsKey = 'notifications.quizResultNotifications';
  static const _masteryKey = 'notifications.masteryAchievements';

  @override
  Future<SettingsState> build() async {
    final prefs = await SharedPreferences.getInstance();

    return SettingsState(
      notificationsEnabled: prefs.getBool(_notificationsKey) ?? true,
      dailyReminderHour: prefs.getInt(_dailyReminderHourKey) ?? 19,
      learningDefaults: LearningDefaults(
        weeklyHoursGoal: prefs.getInt(_weeklyHoursKey) ?? 8,
        familiarityLevel: familiarityLevelFromJson(
              prefs.getString(_familiarityKey),
            ) ??
            FamiliarityLevel.beginner,
        learningGoal:
            learningGoalFromJson(prefs.getString(_learningGoalKey)) ??
                LearningGoal.upskill,
        aboutSelf: prefs.getString(_aboutSelfKey),
      ),
      notifications: NotificationPreferences(
        decayReminders: prefs.getBool(_decayRemindersKey) ?? true,
        quizResultNotifications: prefs.getBool(_quizResultsKey) ?? true,
        masteryAchievements: prefs.getBool(_masteryKey) ?? true,
      ),
    );
  }

  Future<void> _persist(SettingsState current) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_notificationsKey, current.notificationsEnabled);
    await prefs.setInt(_dailyReminderHourKey, current.dailyReminderHour);
    await prefs.setInt(
      _weeklyHoursKey,
      current.learningDefaults.weeklyHoursGoal,
    );
    await prefs.setString(
      _familiarityKey,
      familiarityLevelToJson(current.learningDefaults.familiarityLevel),
    );
    await prefs.setString(
      _learningGoalKey,
      learningGoalToJson(current.learningDefaults.learningGoal),
    );
    await prefs.setBool(
      _decayRemindersKey,
      current.notifications.decayReminders,
    );
    await prefs.setBool(
      _quizResultsKey,
      current.notifications.quizResultNotifications,
    );
    await prefs.setBool(
      _masteryKey,
      current.notifications.masteryAchievements,
    );

    final about = current.learningDefaults.aboutSelf;
    if (about != null && about.trim().isNotEmpty) {
      await prefs.setString(_aboutSelfKey, about.trim());
    } else {
      await prefs.remove(_aboutSelfKey);
    }
  }

  Future<void> setNotificationsEnabled(bool value) async {
    final current = state.valueOrNull;
    if (current == null) return;

    final next = current.copyWith(notificationsEnabled: value);
    state = AsyncData(next);
    await _persist(next);
  }

  Future<void> setDailyReminderHour(int value) async {
    final current = state.valueOrNull;
    if (current == null) return;

    final next = current.copyWith(dailyReminderHour: value);
    state = AsyncData(next);
    await _persist(next);
  }

  Future<void> setWeeklyHoursGoal(int hours) async {
    final current = state.valueOrNull;
    if (current == null) return;

    final clamped = hours.clamp(1, 100);
    final next = current.copyWith(
      learningDefaults: current.learningDefaults.copyWith(
        weeklyHoursGoal: clamped,
      ),
    );
    state = AsyncData(next);
    await _persist(next);
  }

  Future<void> setFamiliarityLevel(FamiliarityLevel level) async {
    final current = state.valueOrNull;
    if (current == null) return;

    final next = current.copyWith(
      learningDefaults: current.learningDefaults.copyWith(
        familiarityLevel: level,
      ),
    );
    state = AsyncData(next);
    await _persist(next);
  }

  Future<void> setLearningGoal(LearningGoal goal) async {
    final current = state.valueOrNull;
    if (current == null) return;

    final next = current.copyWith(
      learningDefaults: current.learningDefaults.copyWith(learningGoal: goal),
    );
    state = AsyncData(next);
    await _persist(next);
  }

  /// Persists enrollment-form defaults (used after enroll).
  Future<void> setLearningDefaults(LearningDefaults defaults) async {
    final current = state.valueOrNull;
    if (current == null) return;

    final next = current.copyWith(learningDefaults: defaults);
    state = AsyncData(next);
    await _persist(next);
  }

  Future<void> setNotificationPreference({
    bool? decayReminders,
    bool? quizResultNotifications,
    bool? masteryAchievements,
  }) async {
    final current = state.valueOrNull;
    if (current == null) return;

    final next = current.copyWith(
      notifications: current.notifications.copyWith(
        decayReminders: decayReminders,
        quizResultNotifications: quizResultNotifications,
        masteryAchievements: masteryAchievements,
      ),
    );
    state = AsyncData(next);
    await _persist(next);
  }
}

String familiarityLabel(FamiliarityLevel level) {
  switch (level) {
    case FamiliarityLevel.beginner:
      return 'Beginner';
    case FamiliarityLevel.intermediate:
      return 'Intermediate';
    case FamiliarityLevel.advanced:
      return 'Advanced';
  }
}

String learningGoalLabel(LearningGoal goal) {
  switch (goal) {
    case LearningGoal.getJob:
      return 'Get a job';
    case LearningGoal.upskill:
      return 'Upskill';
    case LearningGoal.hobby:
      return 'Personal interest';
    case LearningGoal.certification:
      return 'Certification';
  }
}
