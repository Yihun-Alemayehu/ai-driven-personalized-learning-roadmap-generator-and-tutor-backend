import { useMemo, useState } from 'react';
import type { AxiosError } from 'axios';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/hooks/useAuth';
import { useChangePasswordMutation, useDeleteAccountMutation } from '@/api/auth';
import { useAtlasSettingsStore } from '@/store/settings.store';
import { useMyLearningStore } from '@/store/myLearning.store';
import type { FamiliarityLevel, LearningGoal } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[24px] leading-tight"
      style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
    >
      {children}
    </h2>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="text-[11px] tracking-[0.1em] uppercase"
      style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
    >
      {children}
    </label>
  );
}

function PillToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e', fontSize: 15 }}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="w-14 h-8 rounded-full p-1 transition-colors"
        style={{
          background: checked ? 'oklch(0.62 0.18 28)' : '#d6cfbf',
        }}
      >
        <span
          className="block w-6 h-6 rounded-full transition-transform"
          style={{
            background: '#faf7f1',
            transform: checked ? 'translateX(24px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  );
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ error?: { message?: string } }>;
  return axiosError?.response?.data?.error?.message ?? fallback;
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const changePassword = useChangePasswordMutation();
  const deleteAccount = useDeleteAccountMutation();

  const learningDefaults = useAtlasSettingsStore((s) => s.learningDefaults);
  const notifications = useAtlasSettingsStore((s) => s.notifications);
  const setWeeklyHoursGoal = useAtlasSettingsStore((s) => s.setWeeklyHoursGoal);
  const setFamiliarityLevel = useAtlasSettingsStore((s) => s.setFamiliarityLevel);
  const setLearningGoal = useAtlasSettingsStore((s) => s.setLearningGoal);
  const setNotificationPreference = useAtlasSettingsStore((s) => s.setNotificationPreference);

  const historyEntries = useMyLearningStore((s) => s.entries);
  const clearHistory = useMyLearningStore((s) => s.clear);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [historyFeedback, setHistoryFeedback] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const familiarityOptions: { value: FamiliarityLevel; label: string }[] = useMemo(
    () => [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
    ],
    [],
  );

  const learningGoalOptions: { value: LearningGoal; label: string }[] = useMemo(
    () => [
      { value: 'get_job', label: 'Get a job' },
      { value: 'upskill', label: 'Upskill' },
      { value: 'hobby', label: 'Hobby' },
      { value: 'certification', label: 'Certification' },
    ],
    [],
  );

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation must match.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    try {
      await changePassword.mutateAsync(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSuccess('Password updated successfully.');
    } catch (error) {
      setPasswordError(getApiErrorMessage(error, 'Unable to change password.'));
    }
  }

  function handleClearHistory() {
    clearHistory();
    setConfirmClearHistory(false);
    setHistoryFeedback('Learning history cleared.');
  }

  async function handleDeleteAccount() {
    setDeleteError(null);
    try {
      await deleteAccount.mutateAsync();
      localStorage.removeItem('atlas-settings');
      localStorage.removeItem('atlas-my-learning');
      logout();
    } catch (error) {
      setDeleteError(getApiErrorMessage(error, 'Failed to delete account.'));
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div>
          <h1
            className="text-[32px] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
          >
            Settings
          </h1>
          <p style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a', fontSize: 16 }}>
            Manage your security, learning defaults, and account preferences.
          </p>
        </div>

        <section className="border rounded-[16px] p-6 flex flex-col gap-4" style={{ borderColor: '#d6cfbf', background: '#faf7f1' }}>
          <SectionTitle>Security</SectionTitle>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Current Password</FieldLabel>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                className="h-10 px-3.5 rounded-[8px] border outline-none"
                style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>New Password</FieldLabel>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                className="h-10 px-3.5 rounded-[8px] border outline-none"
                style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Confirm New Password</FieldLabel>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                className="h-10 px-3.5 rounded-[8px] border outline-none"
                style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
                required
              />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <button
                type="submit"
                disabled={changePassword.isPending}
                className="px-5 py-2 rounded-[9px] text-[14px] transition-opacity disabled:opacity-60"
                style={{ background: '#1a1614', color: '#faf7f1', fontFamily: "'Crimson Pro', serif" }}
              >
                {changePassword.isPending ? 'Updating…' : 'Change password'}
              </button>
              {passwordSuccess && (
                <span style={{ color: 'oklch(0.50 0.15 145)', fontFamily: "'Crimson Pro', serif", fontSize: 14 }}>
                  {passwordSuccess}
                </span>
              )}
              {passwordError && (
                <span style={{ color: 'oklch(0.54 0.20 25)', fontFamily: "'Crimson Pro', serif", fontSize: 14 }}>
                  {passwordError}
                </span>
              )}
            </div>
          </form>
        </section>

        <section className="border rounded-[16px] p-6 flex flex-col gap-4" style={{ borderColor: '#d6cfbf', background: '#faf7f1' }}>
          <SectionTitle>Learning Defaults</SectionTitle>
          <p style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a', fontSize: 15 }}>
            These defaults auto-fill when you enroll in a new course.
          </p>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Weekly Hours Goal</FieldLabel>
            <input
              type="number"
              min={1}
              max={100}
              value={learningDefaults.weeklyHoursGoal}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (Number.isFinite(value)) setWeeklyHoursGoal(value);
              }}
              className="h-10 w-44 px-3.5 rounded-[8px] border outline-none"
              style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Starting Familiarity Level</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {familiarityOptions.map((option) => {
                const selected = learningDefaults.familiarityLevel === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFamiliarityLevel(option.value)}
                    className="px-3 py-1.5 rounded-full border text-[14px] transition-colors"
                    style={{
                      borderColor: selected ? 'oklch(0.62 0.18 28)' : '#d6cfbf',
                      background: selected ? 'color-mix(in srgb, oklch(0.62 0.18 28) 9%, #faf7f1)' : '#fff',
                      color: '#3a342e',
                      fontFamily: "'Crimson Pro', serif",
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Learning Goal</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {learningGoalOptions.map((option) => {
                const selected = learningDefaults.learningGoal === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLearningGoal(option.value)}
                    className="px-3 py-1.5 rounded-full border text-[14px] transition-colors"
                    style={{
                      borderColor: selected ? 'oklch(0.55 0.13 250)' : '#d6cfbf',
                      background: selected ? 'color-mix(in srgb, oklch(0.55 0.13 250) 9%, #faf7f1)' : '#fff',
                      color: '#3a342e',
                      fontFamily: "'Crimson Pro', serif",
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border rounded-[16px] p-6 flex flex-col gap-4" style={{ borderColor: '#d6cfbf', background: '#faf7f1' }}>
          <SectionTitle>Notification Preferences</SectionTitle>
          <div className="flex flex-col gap-3">
            <PillToggle
              label="Decay reminders"
              checked={notifications.decayReminders}
              onChange={(value) => setNotificationPreference('decayReminders', value)}
            />
            <PillToggle
              label="Quiz result notifications"
              checked={notifications.quizResultNotifications}
              onChange={(value) => setNotificationPreference('quizResultNotifications', value)}
            />
            <PillToggle
              label="Mastery achievements"
              checked={notifications.masteryAchievements}
              onChange={(value) => setNotificationPreference('masteryAchievements', value)}
            />
          </div>
        </section>

        <section className="border rounded-[16px] p-6 flex flex-col gap-4" style={{ borderColor: 'oklch(0.75 0.12 28)', background: '#faf7f1' }}>
          <SectionTitle>Danger Zone</SectionTitle>

          <div className="border rounded-[12px] px-4 py-3" style={{ borderColor: '#f0d9c8', background: '#fff7f4' }}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e', fontSize: 15 }}>
                  Clear My Learning history
                </div>
                <div style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088', fontSize: 13 }}>
                  Removes {historyEntries.length} recent items from the sidebar history.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setHistoryFeedback(null);
                  setConfirmClearHistory(true);
                }}
                className="px-3.5 py-2 rounded-[8px] border text-[13px]"
                style={{ borderColor: '#e1b8aa', color: 'oklch(0.52 0.18 25)', fontFamily: "'Crimson Pro', serif" }}
              >
                Clear history
              </button>
            </div>

            {confirmClearHistory && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span style={{ fontFamily: "'Crimson Pro', serif", color: '#7a3a2e', fontSize: 13 }}>
                  Confirm clearing your sidebar learning history?
                </span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="px-3 py-1.5 rounded-[8px] text-[13px]"
                  style={{ background: 'oklch(0.62 0.18 28)', color: '#faf7f1', fontFamily: "'Crimson Pro', serif" }}
                >
                  Yes, clear
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearHistory(false)}
                  className="px-3 py-1.5 rounded-[8px] border text-[13px]"
                  style={{ borderColor: '#d6cfbf', color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}
                >
                  Cancel
                </button>
              </div>
            )}

            {historyFeedback && (
              <p className="mt-2" style={{ fontFamily: "'Crimson Pro', serif", color: 'oklch(0.50 0.15 145)', fontSize: 13 }}>
                {historyFeedback}
              </p>
            )}
          </div>

          <div className="border rounded-[12px] px-4 py-3" style={{ borderColor: '#f0d9c8', background: '#fff7f4' }}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e', fontSize: 15 }}>
                  Delete account
                </div>
                <div style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088', fontSize: 13 }}>
                  Permanently deletes your account and learning data.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteEmailInput('');
                  setDeleteOpen(true);
                }}
                className="px-3.5 py-2 rounded-[8px] border text-[13px]"
                style={{ borderColor: '#e1b8aa', color: 'oklch(0.52 0.18 25)', fontFamily: "'Crimson Pro', serif" }}
              >
                Delete account
              </button>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent style={{ background: '#faf7f1', borderColor: '#d6cfbf' }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>
              Delete your account?
            </DialogTitle>
            <DialogDescription style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}>
              Type <strong>{user?.email}</strong> to confirm permanent deletion.
            </DialogDescription>
          </DialogHeader>
          <input
            type="email"
            value={deleteEmailInput}
            onChange={(e) => setDeleteEmailInput(e.target.value)}
            className="h-10 px-3.5 rounded-[8px] border outline-none"
            style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: 'JetBrains Mono, monospace', color: '#3a342e' }}
            placeholder="your-email@example.com"
          />
          {deleteError && (
            <p style={{ color: 'oklch(0.54 0.20 25)', fontFamily: "'Crimson Pro', serif", fontSize: 14 }}>
              {deleteError}
            </p>
          )}
          <DialogFooter>
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 rounded-[8px] border"
              style={{ borderColor: '#d6cfbf', color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteEmailInput.trim().toLowerCase() !== (user?.email ?? '').toLowerCase() || deleteAccount.isPending}
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-[8px] disabled:opacity-60"
              style={{ background: 'oklch(0.52 0.18 25)', color: '#faf7f1', fontFamily: "'Crimson Pro', serif" }}
            >
              {deleteAccount.isPending ? 'Deleting…' : 'Delete permanently'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
