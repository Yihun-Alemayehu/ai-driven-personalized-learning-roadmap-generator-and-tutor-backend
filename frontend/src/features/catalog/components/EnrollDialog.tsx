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
import type { Domain } from '@/types';

interface EnrollDialogProps {
  domain: Domain;
  open: boolean;
  onClose: () => void;
}

export function EnrollDialog({ domain, open, onClose }: EnrollDialogProps) {
  const navigate = useNavigate();
  const meta = getDomainMeta(domain.slug);
  const enroll = useEnrollMutation();
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    setError(null);
    try {
      const result = await enroll.mutateAsync(domain.id);
      onClose();
      navigate(`/enrollments/${result.enrollment.id}/roadmap`);
    } catch {
      setError('Enrollment failed. You may already be enrolled in this domain.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent style={{ background: '#faf7f1', borderColor: '#d6cfbf' }}>
        <DialogHeader>
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-3"
            style={{ background: meta.color, color: meta.accent }}
          >
            <span style={{ fontFamily: 'monospace' }}>{meta.icon}</span>
          </div>
          <DialogTitle
            className="text-[22px]"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d342a' }}
          >
            Enroll in {domain.name}
          </DialogTitle>
          <DialogDescription style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif", fontSize: 15 }}>
            {domain.description}
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm mt-2" style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}>
          Your personalized roadmap will be generated based on your profile and learning preferences.
        </p>

        {error && (
          <p className="text-sm rounded-lg px-3 py-2" style={{ background: '#fef2f2', color: '#b91c1c', fontFamily: "'Crimson Pro', serif" }}>
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm border transition-colors hover:bg-[#ebe6db]"
            style={{ borderColor: '#d6cfbf', color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}
          >
            Cancel
          </button>
          <button
            onClick={handleEnroll}
            disabled={enroll.isPending}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'oklch(0.62 0.18 28)', color: '#faf7f1', fontFamily: "'Crimson Pro', serif" }}
          >
            {enroll.isPending ? 'Enrolling…' : 'Enroll Now'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
