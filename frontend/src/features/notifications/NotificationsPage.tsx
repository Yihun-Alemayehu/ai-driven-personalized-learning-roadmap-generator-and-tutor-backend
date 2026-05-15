import { PageWrapper } from '@/components/layout/PageWrapper';
import { useNotificationsQuery, useMarkAllReadMutation } from '@/api/notifications';
import { NotificationItem } from './components/NotificationItem';

function Skeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 rounded-[10px] animate-pulse" style={{ background: '#ebe6db' }} />
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotificationsQuery();
  const markAll = useMarkAllReadMutation();

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <PageWrapper>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1
            className="text-[36px] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d342a' }}
          >
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-[14px] mt-0.5" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="text-[13px] px-3 py-1.5 rounded-full border transition-colors hover:bg-[#ebe6db] disabled:opacity-60"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a', borderColor: '#d6cfbf' }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <Skeleton />
      ) : !notifications || notifications.length === 0 ? (
        <div
          className="border rounded-2xl px-8 py-12 text-center"
          style={{ background: '#f3efe7', borderColor: '#d6cfbf', borderStyle: 'dashed' }}
        >
          <p className="text-[36px] mb-3">🔔</p>
          <p className="text-[18px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#6e645a' }}>
            No notifications yet
          </p>
          <p className="text-[14px] mt-1" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>
            You'll be notified when nodes unlock, mastery decays, or reviews are due.
          </p>
        </div>
      ) : (
        <div
          className="border rounded-2xl overflow-hidden divide-y"
          style={{ borderColor: '#d6cfbf', background: '#faf7f1' }}
        >
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
