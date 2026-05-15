import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useEnrollMutation } from '@/api/enrollments';
import { getDomainMeta } from '../lib/domainIcons';
import type { Domain, FamiliarityLevel, LearningGoal } from '@/types';

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

export function EnrollDialog({ domain, open, onClose }: EnrollDialogProps) {
  const navigate = useNavigate();
  const meta = getDomainMeta(domain.slug);
  const enroll = useEnrollMutation();
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<PersonalizationForm>({
    familiarityLevel: '',
    learningGoal: '',
    weeklyHours: '',
    aboutSelf: '',
  });

  const onChange = (patch: Partial<PersonalizationForm>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleClose = () => {
    setStep(1);
    setError(null);
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
      });
      handleClose();
      navigate(`/enrollments/${result.enrollment.id}/roadmap`);
    } catch {
      setError('Enrollment failed. You may already be enrolled in this domain.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-md"
        style={{ background: '#faf7f1', borderColor: '#d6cfbf' }}
      >
        {step === 1 ? (
          <Step1 domain={domain} meta={meta} onNext={() => setStep(2)} onClose={handleClose} />
        ) : (
          <Step2
            form={form}
            onChange={onChange}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
            isPending={enroll.isPending}
            error={error}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
