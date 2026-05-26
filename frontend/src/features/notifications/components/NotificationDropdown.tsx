import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from 'lucide-react';
import { useNotificationsQuery, useUnreadCount, useMarkAllReadMutation } from '@/api/notifications';
import { NotificationItem } from './NotificationItem';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = useUnreadCount();
  const { data: notifications } = useNotificationsQuery();
  const markAll = useMarkAllReadMutation();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const preview = notifications?.slice(0, 5) ?? [];

  return (
    <div ref={ref} className="relative">
      <button
        data-testid="notification-bell"
        onClick={() => setOpen((v) => !v)}
        className="relative w-8.5 h-8.5 rounded-lg border grid place-items-center transition-colors hover:bg-muted"
        style={{ borderColor: '#d6cfbf', color: '#6e645a' }}
        title="Notifications"
        aria-label="Notifications"
      >
        <BellIcon size={17} strokeWidth={1.6} />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full grid place-items-center text-[9px] font-bold text-white leading-none px-0.5"
            style={{ background: 'oklch(0.60 0.18 28)', fontFamily: 'JetBrains Mono, monospace' }}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-[320px] rounded-[12px] border overflow-hidden shadow-lg z-50"
          style={{ background: '#faf7f1', borderColor: '#d6cfbf' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b"
            style={{ borderColor: '#e8e2d9' }}
          >
            <span
              className="text-[13px] font-semibold"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614', fontSize: 15 }}
            >
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={() => markAll.mutate()}
                className="text-[11px] transition-colors hover:underline"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Items */}
          {preview.length === 0 ? (
            <p
              className="px-4 py-6 text-center text-[14px] italic"
              style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}
            >
              No notifications
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: '#ebe6db' }}>
              {preview.map((n) => (
                <NotificationItem key={n.id} notification={n} onNavigate={() => setOpen(false)} />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="border-t px-4 py-2.5 text-center" style={{ borderColor: '#e8e2d9' }}>
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-[13px] transition-colors hover:underline"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'oklch(0.62 0.18 28)' }}
            >
              See all →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
