import { useState } from 'react';
import type { AdminUser } from '@/types';
import { RoleChangeDialog } from './RoleChangeDialog';
import { DeleteUserDialog } from './DeleteUserDialog';
import { useAuthStore } from '@/store/auth.store';

const ROLE_COLORS: Record<string, string> = {
  admin:        'oklch(0.85 0.12 285)',
  instructor:   'oklch(0.88 0.10 200)',
  domain_expert:'oklch(0.88 0.10 145)',
  learner:      '#ebe6db',
};

interface Props {
  users: AdminUser[];
}

export function UserTable({ users }: Props) {
  const currentUser = useAuthStore((s) => s.user);
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  return (
    <>
      <div className="border rounded-[12px] overflow-hidden" style={{ borderColor: '#d6cfbf' }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: '#f3efe7', borderBottom: '1px solid #d6cfbf' }}>
              {['Name', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left font-medium"
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr
                key={user.id}
                style={{
                  background: i % 2 === 0 ? '#faf7f1' : '#f7f3ec',
                  borderBottom: '1px solid #ebe6db',
                }}
              >
                <td className="px-4 py-2.5" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>
                  {user.fullName}
                </td>
                <td className="px-4 py-2.5 font-mono text-[12px]" style={{ color: '#6e645a' }}>
                  {user.email}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] capitalize"
                    style={{
                      background: ROLE_COLORS[user.role] ?? '#ebe6db',
                      color: '#1a1614',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-[12px]" style={{ color: '#9a9088' }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setRoleTarget(user)}
                      className="px-2.5 py-1 rounded-[6px] text-[11px] transition-colors hover:bg-[#ebe6db]"
                      style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a', border: '1px solid #d6cfbf' }}
                    >
                      ⚙ Role
                    </button>
                    <button
                      onClick={() => setDeleteTarget(user)}
                      disabled={user.id === currentUser?.id}
                      className="px-2.5 py-1 rounded-[6px] text-[11px] transition-colors disabled:opacity-30"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'oklch(0.50 0.18 28)',
                        border: '1px solid oklch(0.80 0.10 28)',
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="px-8 py-10 text-center" style={{ background: '#faf7f1' }}>
            <p className="text-[14px] italic" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>
              No users found
            </p>
          </div>
        )}
      </div>

      {roleTarget && <RoleChangeDialog user={roleTarget} onClose={() => setRoleTarget(null)} />}
      {deleteTarget && <DeleteUserDialog user={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </>
  );
}
