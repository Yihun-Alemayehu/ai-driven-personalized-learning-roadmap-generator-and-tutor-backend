import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useResolveEventMutation, type FlaggedEvent } from '@/api/instructor';

interface Props {
  event: FlaggedEvent;
  open: boolean;
  onClose: () => void;
}

export function ResolveDialog({ event, open, onClose }: Props) {
  const [notes, setNotes] = useState('');
  const resolve = useResolveEventMutation();

  const handleSubmit = async () => {
    await resolve.mutateAsync({ eventId: event.id, resolutionNotes: notes });
    onClose();
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent style={{ background: '#faf7f1', borderColor: '#d6cfbf' }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614', fontSize: 22 }}>
            Resolve Flag
          </DialogTitle>
        </DialogHeader>

        <div
          className="flex flex-col gap-0.5 text-[13px] py-2 px-3 rounded-[8px]"
          style={{ background: '#f3efe7', fontFamily: "'Crimson Pro', serif" }}
        >
          <div style={{ color: '#6e645a' }}>
            <span style={{ color: '#9a9088' }}>Node: </span>{event.node.title}
          </div>
          <div style={{ color: '#6e645a' }}>
            <span style={{ color: '#9a9088' }}>Learner: </span>{event.user.fullName}
          </div>
        </div>

        <div>
          <label
            className="block text-[11px] tracking-[0.1em] uppercase mb-2"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
          >
            Resolution notes
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Referred learner to supplementary materials on closures…"
            className="w-full px-3 py-2.5 rounded-[8px] border text-[15px] outline-none resize-none"
            style={{ borderColor: '#d6cfbf', background: '#faf7f1', fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
          />
        </div>

        {resolve.isError && (
          <p className="text-[13px]" style={{ color: '#b91c1c', fontFamily: "'Crimson Pro', serif" }}>
            Something went wrong. Please try again.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-[14px] border transition-colors hover:bg-[#ebe6db]"
            style={{ borderColor: '#d6cfbf', color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!notes.trim() || resolve.isPending}
            className="flex-1 rounded-lg px-4 py-2.5 text-[14px] font-semibold disabled:opacity-50 transition-all"
            style={{ background: 'oklch(0.60 0.13 150)', color: '#fff', fontFamily: "'Crimson Pro', serif" }}
          >
            {resolve.isPending ? 'Saving…' : 'Mark Resolved'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
