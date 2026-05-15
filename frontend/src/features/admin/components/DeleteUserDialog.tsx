import type { AdminUser } from '@/types';
import { useDeleteUserMutation } from '@/api/admin';

interface Props {
  user: AdminUser;
  onClose: () => void;
}

export function DeleteUserDialog({ user, onClose }: Props) {
  const { mutate, isPending } = useDeleteUserMutation();

  function handleDelete() {
    mutate(user.id, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(26,22,20,0.35)' }}>
      <div
        className="w-full max-w-sm rounded-[16px] p-6 flex flex-col gap-5 shadow-xl"
        style={{ background: '#faf7f1', border: '1px solid #d6cfbf' }}
      >
        <div>
          <h2 className="text-[20px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>
            Delete User?
          </h2>
          <p className="text-[13px] mt-1" style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}>
            <strong>{user.fullName}</strong> ({user.email})
          </p>
        </div>

        <p
          className="text-[13px] px-3 py-2.5 rounded-[8px]"
          style={{ background: 'oklch(0.95 0.05 28)', color: 'oklch(0.45 0.15 28)', fontFamily: "'Crimson Pro', serif" }}
        >
          This action is permanent and cannot be undone. All enrollments and progress data will be deleted.
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[8px] text-[13px] transition-colors hover:bg-[#ebe6db]"
            style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 rounded-[8px] text-[13px] transition-colors disabled:opacity-50"
            style={{ background: 'oklch(0.55 0.18 28)', color: '#fff', fontFamily: "'Crimson Pro', serif" }}
          >
            {isPending ? 'Deleting…' : 'Delete permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
