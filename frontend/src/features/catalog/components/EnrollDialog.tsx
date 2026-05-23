import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useEnrollMutation, type EnrollResult } from '@/api/enrollments';
import { getDomainMeta } from '../lib/domainIcons';
import type { Domain, FamiliarityLevel, LearningGoal, PreferredLearningStyle } from '@/types';
import { useAtlasSettingsStore } from '@/store/settings.store';

interface EnrollDialogProps {
  domain: Domain;
  open: boolean;
  onClose: () => void;
}

interface PersonalizationForm {
  familiarityLevel: FamiliarityLevel | '';
  learningGoal: LearningGoal | '';
  weeklyHours: string;
  aboutSelf: string;
  preferredLearningStyle: PreferredLearningStyle | '';
  priorSkills: string;
}

function createInitialForm(defaults: {
  weeklyHoursGoal: number;
  familiarityLevel: FamiliarityLevel;
  learningGoal: LearningGoal;
}): PersonalizationForm {
  return {
    familiarityLevel: defaults.familiarityLevel,
    learningGoal: defaults.learningGoal,
    weeklyHours: String(defaults.weeklyHoursGoal),
    aboutSelf: '',
    preferredLearningStyle: '',
    priorSkills: '',
  };
}

const FAMILIARITY_OPTIONS: { value: FamiliarityLevel; label: string; desc: string }[] = [
  { value: 'beginner',     label: 'Beginner',     desc: 'Little to no prior experience' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some experience, looking to advance' },
  { value: 'advanced',     label: 'Advanced',     desc: 'Solid foundation, filling gaps' },
];

const GOAL_OPTIONS: { value: LearningGoal; label: string; icon: string }[] = [
  { value: 'get_job',       label: 'Get a job',         icon: '💼' },
  { value: 'upskill',       label: 'Upskill at work',   icon: '📈' },
  { value: 'hobby',         label: 'Personal interest', icon: '🎯' },
  { value: 'certification', label: 'Get certified',     icon: '🏆' },
];

const LEARNING_STYLE_OPTIONS: { value: PreferredLearningStyle; label: string; icon: string }[] = [
  { value: 'visual',   label: 'Visual',     icon: '🖼' },
  { value: 'reading',  label: 'Reading',    icon: '📖' },
  { value: 'hands_on', label: 'Hands-on',   icon: '🛠' },
  { value: 'video',    label: 'Video',      icon: '🎬' },
];

function Step1({ domain, meta, onNext, onClose }: {
  domain: Domain;
  meta: ReturnType<typeof getDomainMeta>;
  onNext: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <DialogHeader>
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-3"
          style={{ background: meta.color, color: meta.accent }}
        >
          <span style={{ fontFamily: 'monospace' }}>{meta.icon}</span>
        </div>
        <DialogTitle
          className="text-[24px]"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d342a' }}
        >
          Enroll in {domain.name}
        </DialogTitle>
        <DialogDescription style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif", fontSize: 15 }}>
          {domain.description}
        </DialogDescription>
      </DialogHeader>

      <p className="text-[14px] mt-2 leading-relaxed" style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}>
        Before we generate your roadmap, we'd like to personalize it based on your background, goals, and available time.
      </p>

      <div className="flex gap-3 mt-4">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg px-4 py-2.5 text-[14px] border transition-colors hover:bg-[#ebe6db]"
          style={{ borderColor: '#d6cfbf', color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}
        >
          Cancel
        </button>
        <button
          onClick={onNext}
          className="flex-1 rounded-lg px-4 py-2.5 text-[14px] font-semibold transition-all active:scale-[0.98]"
          style={{ background: 'oklch(0.62 0.18 28)', color: '#faf7f1', fontFamily: "'Crimson Pro', serif" }}
        >
          Personalize →
        </button>
      </div>
    </>
  );
}

function Step2({ form, onChange, onBack, onSubmit, isPending, error }: {
  form: PersonalizationForm;
  onChange: (patch: Partial<PersonalizationForm>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isPending: boolean;
  error: string | null;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle
          className="text-[22px]"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d342a' }}
        >
          Tell us about yourself
        </DialogTitle>
        <DialogDescription style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif", fontSize: 14 }}>
          This helps us tailor the roadmap to your needs.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-5 mt-1">
        {/* Familiarity level */}
        <div>
          <label className="block text-[11px] tracking-[0.1em] uppercase mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            Your experience level
          </label>
          <div className="flex flex-col gap-1.5">
            {FAMILIARITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ familiarityLevel: opt.value })}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] border text-left transition-all"
                style={{
                  borderColor: form.familiarityLevel === opt.value ? 'oklch(0.62 0.18 28)' : '#d6cfbf',
                  background: form.familiarityLevel === opt.value ? 'color-mix(in srgb, oklch(0.62 0.18 28) 8%, #faf7f1)' : '#faf7f1',
                }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: form.familiarityLevel === opt.value ? 'oklch(0.62 0.18 28)' : '#c2b9a6' }}
                >
                  {form.familiarityLevel === opt.value && (
                    <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.62 0.18 28)' }} />
                  )}
                </div>
                <div>
                  <div className="text-[14px] font-medium" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>{opt.label}</div>
                  <div className="text-[12px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Learning goal */}
        <div>
          <label className="block text-[11px] tracking-[0.1em] uppercase mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            Your goal
          </label>
          <div className="grid grid-cols-2 gap-2">
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ learningGoal: opt.value })}
                className="flex items-center gap-2 px-3 py-2.5 rounded-[8px] border text-left transition-all"
                style={{
                  borderColor: form.learningGoal === opt.value ? 'oklch(0.55 0.13 250)' : '#d6cfbf',
                  background: form.learningGoal === opt.value ? 'color-mix(in srgb, oklch(0.55 0.13 250) 10%, #faf7f1)' : '#faf7f1',
                }}
              >
                <span className="text-[16px]">{opt.icon}</span>
                <span className="text-[13px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Weekly hours */}
        <div>
          <label className="block text-[11px] tracking-[0.1em] uppercase mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            Hours per week you can commit
          </label>
          <input
            type="number"
            min={1}
            max={80}
            placeholder="e.g. 10"
            value={form.weeklyHours}
            onChange={(e) => onChange({ weeklyHours: e.target.value })}
            className="w-full px-3 py-2 rounded-[8px] border text-[15px] outline-none focus:ring-2"
            style={{
              borderColor: '#d6cfbf',
              background: '#faf7f1',
              fontFamily: "'Crimson Pro', serif",
              color: '#1a1614',
            }}
          />
        </div>

        {/* Learning style */}
        <div>
          <label className="block text-[11px] tracking-[0.1em] uppercase mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            Preferred learning style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {LEARNING_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ preferredLearningStyle: opt.value })}
                className="flex items-center gap-2 px-3 py-2.5 rounded-[8px] border text-left transition-all"
                style={{
                  borderColor: form.preferredLearningStyle === opt.value ? 'oklch(0.55 0.13 150)' : '#d6cfbf',
                  background: form.preferredLearningStyle === opt.value ? 'color-mix(in srgb, oklch(0.55 0.13 150) 10%, #faf7f1)' : '#faf7f1',
                }}
              >
                <span className="text-[16px]">{opt.icon}</span>
                <span className="text-[13px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prior skills */}
        <div>
          <label className="block text-[11px] tracking-[0.1em] uppercase mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            Skills you already know <span style={{ color: '#c2b9a6' }}>(optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. HTML, CSS, basic JavaScript, Git…"
            value={form.priorSkills}
            onChange={(e) => onChange({ priorSkills: e.target.value })}
            className="w-full px-3 py-2 rounded-[8px] border text-[15px] outline-none focus:ring-2 resize-none"
            style={{
              borderColor: '#d6cfbf',
              background: '#faf7f1',
              fontFamily: "'Crimson Pro', serif",
              color: '#1a1614',
            }}
          />
        </div>

        {/* About self */}
        <div>
          <label className="block text-[11px] tracking-[0.1em] uppercase mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            Tell us about yourself <span style={{ color: '#c2b9a6' }}>(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="e.g. I'm a self-taught developer looking to transition into frontend engineering…"
            value={form.aboutSelf}
            onChange={(e) => onChange({ aboutSelf: e.target.value })}
            className="w-full px-3 py-2 rounded-[8px] border text-[15px] outline-none focus:ring-2 resize-none"
            style={{
              borderColor: '#d6cfbf',
              background: '#faf7f1',
              fontFamily: "'Crimson Pro', serif",
              color: '#1a1614',
            }}
          />
        </div>
      </div>

      {error && (
        <p className="text-[13px] rounded-lg px-3 py-2" style={{ background: '#fef2f2', color: '#b91c1c', fontFamily: "'Crimson Pro', serif" }}>
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-lg text-[14px] border transition-colors hover:bg-[#ebe6db]"
          style={{ borderColor: '#d6cfbf', color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isPending}
          className="flex-1 rounded-lg px-4 py-2.5 text-[14px] font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'oklch(0.62 0.18 28)', color: '#faf7f1', fontFamily: "'Crimson Pro', serif" }}
        >
          {isPending ? 'Generating roadmap…' : 'Start learning →'}
        </button>
      </div>
    </>
  );
}

function Step3({ result, onNavigate }: {
  result: EnrollResult;
  onNavigate: () => void;
}) {
  const { totalNodes, unlockedNodes, personalization } = result;
  const { skippedNodes, supplementaryNodes, unlockAcceleration } = personalization;
  const hasPersonalization = skippedNodes > 0 || supplementaryNodes > 0 || unlockAcceleration;

  return (
    <>
      <DialogHeader>
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-3"
          style={{ background: 'color-mix(in srgb, oklch(0.60 0.13 150) 12%, #faf7f1)', border: '1px solid oklch(0.75 0.1 150)' }}
        >
          <span style={{ fontFamily: 'monospace' }}>✓</span>
        </div>
        <DialogTitle
          className="text-[24px]"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d342a' }}
        >
          Roadmap ready!
        </DialogTitle>
        <DialogDescription style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif", fontSize: 15 }}>
          Your personalized learning path has been created.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3 mt-2">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[8px] border px-3 py-2.5" style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}>
            <div className="text-[22px] font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>{totalNodes}</div>
            <div className="text-[11px] tracking-[0.08em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>Total nodes</div>
          </div>
          <div className="rounded-[8px] border px-3 py-2.5" style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}>
            <div className="text-[22px] font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>{unlockedNodes}</div>
            <div className="text-[11px] tracking-[0.08em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>Unlocked</div>
          </div>
        </div>

        {/* Personalization summary */}
        {hasPersonalization && (
          <div className="rounded-[10px] border p-3 flex flex-col gap-2" style={{ borderColor: 'oklch(0.82 0.1 70)', background: 'color-mix(in srgb, oklch(0.72 0.13 70) 8%, #faf7f1)' }}>
            <div className="text-[10px] tracking-[0.12em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
              Personalized for you
            </div>
            <div className="flex flex-col gap-1.5">
              {skippedNodes > 0 && (
                <div className="flex items-center gap-2 text-[14px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e' }}>
                  <span style={{ color: '#b0a898' }}>↷</span>
                  Skipped {skippedNodes} node{skippedNodes !== 1 ? 's' : ''} you already know
                </div>
              )}
              {supplementaryNodes > 0 && (
                <div className="flex items-center gap-2 text-[14px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e' }}>
                  <span style={{ color: 'oklch(0.55 0.13 250)' }}>+</span>
                  Added {supplementaryNodes} supplementary node{supplementaryNodes !== 1 ? 's' : ''}
                </div>
              )}
              {unlockAcceleration && (
                <div className="flex items-center gap-2 text-[14px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e' }}>
                  <span style={{ color: 'oklch(0.60 0.13 150)' }}>⚡</span>
                  {unlockAcceleration === 'advanced' ? 'Advanced unlock — easy nodes pre-mastered' : 'Intermediate unlock — foundational nodes opened'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onNavigate}
        className="w-full mt-3 rounded-lg px-4 py-2.5 text-[14px] font-semibold transition-all active:scale-[0.98]"
        style={{ background: 'oklch(0.62 0.18 28)', color: '#faf7f1', fontFamily: "'Crimson Pro', serif" }}
      >
        Open roadmap →
      </button>
    </>
  );
}

export function EnrollDialog({ domain, open, onClose }: EnrollDialogProps) {
  const navigate = useNavigate();
  const meta = getDomainMeta(domain.slug);
  const enroll = useEnrollMutation();
  const learningDefaults = useAtlasSettingsStore((s) => s.learningDefaults);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<PersonalizationForm>(() => createInitialForm(learningDefaults));
  const [enrollResult, setEnrollResult] = useState<EnrollResult | null>(null);

  function getErrorMessage(err: unknown): string {
    if (axios.isAxiosError(err)) {
      const backendMessage = err.response?.data?.error?.message;
      if (typeof backendMessage === 'string' && backendMessage.trim()) {
        return backendMessage;
      }
    }
    return 'Enrollment failed. Please try again.';
  }

  useEffect(() => {
    if (open) {
      setStep(1);
      setError(null);
      setForm(createInitialForm(learningDefaults));
      setEnrollResult(null);
    }
  }, [open, learningDefaults]);

  const onChange = (patch: Partial<PersonalizationForm>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleClose = () => {
    setStep(1);
    setError(null);
    setForm(createInitialForm(learningDefaults));
    setEnrollResult(null);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const result = await enroll.mutateAsync({
        domainId: domain.id,
        ...(form.familiarityLevel && { familiarityLevel: form.familiarityLevel }),
        ...(form.learningGoal && { learningGoal: form.learningGoal }),
        ...(form.weeklyHours && { weeklyHours: parseInt(form.weeklyHours, 10) }),
        ...(form.aboutSelf.trim() && { aboutSelf: form.aboutSelf.trim() }),
        ...(form.preferredLearningStyle && { preferredLearningStyle: form.preferredLearningStyle }),
        ...(form.priorSkills.trim() && { priorSkills: form.priorSkills.trim() }),
      });
      setEnrollResult(result);
      setStep(3);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-md"
        style={{ background: '#faf7f1', borderColor: '#d6cfbf' }}
      >
        {step === 1 && (
          <Step1 domain={domain} meta={meta} onNext={() => setStep(2)} onClose={handleClose} />
        )}
        {step === 2 && (
          <Step2
            form={form}
            onChange={onChange}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
            isPending={enroll.isPending}
            error={error}
          />
        )}
        {step === 3 && enrollResult && (
          <Step3
            result={enrollResult}
            onNavigate={() => {
              const id = enrollResult.enrollment.id;
              handleClose();
              navigate(`/enrollments/${id}/roadmap`);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
