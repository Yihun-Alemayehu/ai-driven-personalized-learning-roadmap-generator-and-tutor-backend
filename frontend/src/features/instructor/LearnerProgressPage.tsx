import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLearnerProgressQuery, useLearnerQuizHistoryQuery } from '@/api/instructor';
import { LearnerProgressTree } from './components/LearnerProgressTree';
import { QuizHistoryTable } from './components/QuizHistoryTable';

type Tab = 'progress' | 'quiz';

function Skeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse mt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 rounded-[8px]" style={{ background: '#ebe6db' }} />
      ))}
    </div>
  );
}

export default function LearnerProgressPage() {
  const { userId = '' } = useParams<{ userId: string }>();
  const [tab, setTab] = useState<Tab>('progress');

  const { data: progressData, isLoading: progressLoading } = useLearnerProgressQuery(userId);
  const { data: historyData, isLoading: historyLoading } = useLearnerQuizHistoryQuery(userId);

  const user = progressData?.user ?? historyData?.user;

  return (
    <div className="flex flex-col gap-5">
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <Link
          to="/instructor/learners"
          className="text-[13px] transition-colors hover:underline"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
        >
          ← Back
        </Link>
        <h1
          className="text-[26px] leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
        >
          {user?.fullName ?? 'Learner'} — Progress
        </h1>
      </div>

      {user && (
        <p className="text-[13px] font-mono -mt-3" style={{ color: '#9a9088' }}>{user.email}</p>
      )}

      {/* Tabs */}
      <div className="flex border-b gap-1" style={{ borderColor: '#d6cfbf' }}>
        {([['progress', 'Progress Tree'], ['quiz', 'Quiz History']] as [Tab, string][]).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className="py-2.5 px-4 text-[13px] transition-colors"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: tab === v ? '#1a1614' : '#9a9088',
              fontWeight: tab === v ? 600 : 400,
              borderBottom: tab === v ? '2px solid oklch(0.62 0.18 28)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        className="border rounded-2xl p-6"
        style={{ borderColor: '#d6cfbf', background: '#faf7f1' }}
      >
        {tab === 'progress' && (
          progressLoading ? <Skeleton /> : <LearnerProgressTree enrollments={progressData?.enrollments ?? []} />
        )}
        {tab === 'quiz' && (
          historyLoading ? <Skeleton /> : <QuizHistoryTable attempts={historyData?.attempts ?? []} />
        )}
      </div>
    </div>
  );
}
