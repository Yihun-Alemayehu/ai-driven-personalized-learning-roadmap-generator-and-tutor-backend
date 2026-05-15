import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FamiliarityLevel, LearningGoal } from '@/types';

interface LearningDefaults {
  weeklyHoursGoal: number;
  familiarityLevel: FamiliarityLevel;
  learningGoal: LearningGoal;
}

interface NotificationPreferences {
  decayReminders: boolean;
  quizResultNotifications: boolean;
  masteryAchievements: boolean;
}

interface AtlasSettingsState {
  learningDefaults: LearningDefaults;
  notifications: NotificationPreferences;
  setWeeklyHoursGoal: (hours: number) => void;
  setFamiliarityLevel: (level: FamiliarityLevel) => void;
  setLearningGoal: (goal: LearningGoal) => void;
  setNotificationPreference: (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => void;
}

export const useAtlasSettingsStore = create<AtlasSettingsState>()(
  persist(
    (set) => ({
      learningDefaults: {
        weeklyHoursGoal: 8,
        familiarityLevel: 'beginner',
        learningGoal: 'upskill',
      },
      notifications: {
        decayReminders: true,
        quizResultNotifications: true,
        masteryAchievements: true,
      },
      setWeeklyHoursGoal: (hours) =>
        set((state) => ({
          learningDefaults: {
            ...state.learningDefaults,
            weeklyHoursGoal: Math.min(100, Math.max(1, Math.floor(hours || 1))),
          },
        })),
      setFamiliarityLevel: (level) =>
        set((state) => ({
          learningDefaults: { ...state.learningDefaults, familiarityLevel: level },
        })),
      setLearningGoal: (goal) =>
        set((state) => ({
          learningDefaults: { ...state.learningDefaults, learningGoal: goal },
        })),
      setNotificationPreference: (key, value) =>
        set((state) => ({
          notifications: { ...state.notifications, [key]: value },
        })),
    }),
    { name: 'atlas-settings' },
  ),
);
