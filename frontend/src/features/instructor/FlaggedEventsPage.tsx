import { useState } from 'react';
import { useFlaggedEventsQuery } from '@/api/instructor';
import { FlaggedEventCard } from './components/FlaggedEventCard';

type Filter = 'all' | 'unresolved' | 'resolved';

function Skeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 rounded-[12px]" style={{ background: '#ebe6db' }} />
      ))}
    </div>
  );
}

export default function FlaggedEventsPage() {
  const [filter, setFilter] = useState<Filter>('unresolved');
  const { data, isLoading } = useFlaggedEventsQuery();

  const events = data?.flaggedEvents ?? [];
  const unresolved = events.filter((e) => !e.details?.resolved);
  const resolved = events.filter((e) => Boolean(e.details?.resolved));

  const shown =
    filter === 'all'
      ? events
      : filter === 'unresolved'
      ? unresolved
      : resolved;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1
          className="text-[28px] leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
        >
          Flagged Events
          {unresolved.length > 0 && (
            <span
              className="ml-2 text-[14px] px-2 py-0.5 rounded-full align-middle"
              style={{ background: 'oklch(0.62 0.18 28)', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {unresolved.length} unresolved
            </span>
          )}
        </h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {(['unresolved', 'all', 'resolved'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-[12px] tracking-[0.04em] border transition-all capitalize"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              background: filter === f ? '#1a1614' : '#f3efe7',
              color: filter === f ? '#faf7f1' : '#6e645a',
              borderColor: filter === f ? '#1a1614' : '#d6cfbf',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Events */}
      {isLoading ? (
        <Skeleton />
      ) : shown.length === 0 ? (
        <div
          className="border rounded-2xl px-8 py-10 text-center"
          style={{ borderColor: '#d6cfbf', borderStyle: 'dashed', background: '#f3efe7' }}
        >
          <p className="text-[16px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#6e645a' }}>
            {filter === 'unresolved' ? 'No unresolved flags' : 'No events found'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map((event) => (
            <FlaggedEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
