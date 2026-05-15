import { useState } from 'react';
import { useLearnersQuery } from '@/api/instructor';
import { LearnerTable } from './components/LearnerTable';

function Skeleton() {
  return (
    <div className="flex flex-col gap-2 mt-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 rounded-[8px] animate-pulse" style={{ background: '#ebe6db' }} />
      ))}
    </div>
  );
}

export default function LearnerListPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useLearnersQuery();

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-[28px] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
          >
            Learners
          </h1>
          {data && (
            <p className="text-[13px] mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
              {data.total} total enrollments
            </p>
          )}
        </div>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 px-3 rounded-[8px] border text-[14px] outline-none w-64"
          style={{ borderColor: '#d6cfbf', background: '#faf7f1', fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
        />
      </div>

      {/* Table */}
      <div
        className="border rounded-2xl overflow-hidden"
        style={{ borderColor: '#d6cfbf', background: '#faf7f1' }}
      >
        {isLoading ? (
          <Skeleton />
        ) : (
          <LearnerTable learners={data?.learners ?? []} search={search} />
        )}
      </div>
    </div>
  );
}
