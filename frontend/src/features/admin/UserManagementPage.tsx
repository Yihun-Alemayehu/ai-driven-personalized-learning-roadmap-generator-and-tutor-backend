import { useState } from 'react';
import { useAdminUsersQuery } from '@/api/admin';
import { UserTable } from './components/UserTable';
import type { UserRole } from '@/types';

const ROLE_FILTERS: { value: UserRole | ''; label: string }[] = [
  { value: '', label: 'All roles' },
  { value: 'learner', label: 'Learner' },
  { value: 'domain_expert', label: 'Domain Expert' },
  { value: 'admin', label: 'Admin' },
];

const PAGE_SIZE = 20;

function Skeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-10 rounded-[8px]" style={{ background: '#ebe6db' }} />
      ))}
    </div>
  );
}

export default function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useAdminUsersQuery({
    role: role || undefined,
    limit: PAGE_SIZE,
    page: page + 1,
  });

  const allUsers = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const filtered = search.trim()
    ? allUsers.filter(
        (u) =>
          u.fullName.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      )
    : allUsers;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>
            Users
          </h1>
          <p className="text-[13px] mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            {total} total
          </p>
        </div>

        <div className="flex gap-2">
          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 px-3 rounded-[8px] border outline-none text-[13px]"
            style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: "'Crimson Pro', serif", color: '#1a1614', width: 220 }}
            placeholder="Search by name or email…"
          />
          {/* Role filter */}
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value as UserRole | ''); setPage(0); }}
            className="h-9 px-3 rounded-[8px] border outline-none text-[13px]"
            style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: 'JetBrains Mono, monospace', color: '#1a1614' }}
          >
            {ROLE_FILTERS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? <Skeleton /> : <UserTable users={filtered} />}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-[8px] text-[12px] disabled:opacity-30 hover:bg-[#ebe6db] transition-colors"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a', border: '1px solid #d6cfbf' }}
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className="px-3 py-1.5 rounded-[8px] text-[12px] transition-colors"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                background: page === i ? '#1a1614' : 'transparent',
                color: page === i ? '#faf7f1' : '#6e645a',
                border: '1px solid #d6cfbf',
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1.5 rounded-[8px] text-[12px] disabled:opacity-30 hover:bg-[#ebe6db] transition-colors"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a', border: '1px solid #d6cfbf' }}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
