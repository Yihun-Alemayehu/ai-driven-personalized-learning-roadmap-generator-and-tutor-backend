import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ResolveDialog } from './ResolveDialog';
import type { FlaggedEvent } from '@/api/instructor';

interface Props { event: FlaggedEvent }

export function FlaggedEventCard({ event }: Props) {
  const navigate = useNavigate();
  const [resolveOpen, setResolveOpen] = useState(false);
  const resolved = Boolean(event.details?.resolved);
  const score = event.quizAttempt ? Number(event.quizAttempt.scorePercent).toFixed(0) : null;

  return (
    <>
      <div
        className="border rounded-[12px] px-5 py-4 flex flex-col gap-3"
        style={{
          borderColor: resolved ? '#d6cfbf' : 'oklch(0.62 0.18 28)',
          background: resolved ? '#faf7f1' : 'color-mix(in srgb, oklch(0.62 0.18 28) 5%, #faf7f1)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[16px]">{resolved ? '✓' : '🚩'}</span>
            <div>
              <p className="text-[15px] font-medium" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>
                {event.user.fullName} — {event.node.title}
              </p>
              <p className="text-[12px] font-mono mt-0.5" style={{ color: '#9a9088' }}>
                {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                {score && ` · avg score ${score}%`}
                {event.details?.failCount && ` · ${event.details.failCount} consecutive fails`}
              </p>
            </div>
          </div>
          {resolved && (
            <span
              className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full shrink-0"
              style={{ background: 'oklch(0.60 0.13 150)', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}
            >
              Resolved
            </span>
          )}
        </div>

        {/* Resolution notes */}
        {resolved && event.details?.resolutionNotes && (
          <p
            className="text-[13px] italic px-3 py-2 rounded-[6px] border-l-2"
            style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a', borderColor: 'oklch(0.60 0.13 150)', background: '#f3efe7' }}
          >
            "{event.details.resolutionNotes}"
          </p>
        )}

        {/* Actions */}
        {!resolved && (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/instructor/learners/${event.userId}`)}
              className="text-[13px] px-3 py-1.5 rounded-full border transition-colors hover:bg-[#ebe6db]"
              style={{ fontFamily: "'Crimson Pro', serif", borderColor: '#d6cfbf', color: '#6e645a' }}
            >
              View Progress
            </button>
            <button
              onClick={() => setResolveOpen(true)}
              className="text-[13px] px-3 py-1.5 rounded-full transition-colors hover:opacity-90"
              style={{ background: 'oklch(0.60 0.13 150)', color: '#fff', fontFamily: "'Crimson Pro', serif" }}
            >
              Resolve
            </button>
          </div>
        )}
      </div>

      <ResolveDialog event={event} open={resolveOpen} onClose={() => setResolveOpen(false)} />
    </>
  );
}
