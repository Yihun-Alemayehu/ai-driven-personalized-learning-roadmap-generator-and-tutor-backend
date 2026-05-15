import { useState } from 'react';
import type { AdminUser, UserRole } from '@/types';
import { useChangeRoleMutation } from '@/api/admin';

const ROLES: UserRole[] = ['learner', 'instructor', 'admin', 'domain_expert'];

interface Props {
  user: AdminUser;
  onClose: () => void;
}

export function RoleChangeDialog({ user, onClose }: Props) {
  const [newRole, setNewRole] = useState<UserRole>(user.role);
  const { mutate, isPending } = useChangeRoleMutation();

  function handleSave() {
    mutate({ userId: user.id, role: newRole }, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(26,22,20,0.35)' }}>
      <div
        className="w-full max-w-sm rounded-[16px] p-6 flex flex-col gap-5 shadow-xl"
        style={{ background: '#faf7f1', border: '1px solid #d6cfbf' }}
      >
        <div>
          <h2 className="text-[20px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>
            Change Role
          </h2>
          <p className="text-[13px] mt-1" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            {user.email}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {ROLES.map((r) => (
            <label
              key={r}
              className="flex items-center gap-3 px-3 py-2 rounded-[8px] cursor-pointer transition-colors"
              style={{ background: newRole === r ? '#ebe6db' : 'transparent' }}
            >
              <input
                type="radio"
                name="role"
                value={r}
                checked={newRole === r}
                onChange={() => setNewRole(r)}
                className="accent-[#1a1614]"
              />
              <span className="text-[13px] capitalize" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#1a1614' }}>
                {r.replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[8px] text-[13px] transition-colors hover:bg-[#ebe6db]"
            style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || newRole === user.role}
            className="px-4 py-2 rounded-[8px] text-[13px] transition-colors disabled:opacity-50"
            style={{ background: '#1a1614', color: '#faf7f1', fontFamily: "'Crimson Pro', serif" }}
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
