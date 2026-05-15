import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useMarkReadMutation } from '@/api/notifications';
import type { Notification } from '@/types';

const TYPE_ICON: Record<string, string> = {
  decay_reminder:   '⚠',
  node_unlocked:    '🔓',
  mastery_achieved: '✓',
  path_selected:    '🔀',
  challenge_ready:  '🏆',
};

interface NotificationItemProps {
  notification: Notification;
  onNavigate?: () => void;
}

export function NotificationItem({ notification, onNavigate }: NotificationItemProps) {
  const navigate = useNavigate();
  const markRead = useMarkReadMutation();

  const icon = TYPE_ICON[notification.type] ?? '🔔';
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  const handleClick = async () => {
    if (!notification.read) await markRead.mutateAsync(notification.id);
    onNavigate?.();
    // Navigate to relevant page based on data
    const data = notification.data as Record<string, unknown> | undefined;
    if (data?.enrollmentId) {
      navigate(`/enrollments/${data.enrollmentId}/roadmap`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#f3efe7]"
      style={{ background: notification.read ? 'transparent' : 'color-mix(in srgb, oklch(0.62 0.18 28) 5%, #faf7f1)' }}
    >
      {/* Unread dot */}
      <div className="relative shrink-0 mt-0.5">
        <span className="text-[15px]">{icon}</span>
        {!notification.read && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
            style={{ background: 'oklch(0.62 0.18 28)' }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-[14px] leading-snug"
          style={{
            fontFamily: "'Crimson Pro', serif",
            color: '#1a1614',
            fontWeight: notification.read ? 400 : 600,
          }}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p
            className="text-[13px] mt-0.5 leading-snug"
            style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}
          >
            {notification.body}
          </p>
        )}
        <p
          className="text-[11px] mt-1"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
        >
          {timeAgo}
        </p>
      </div>
    </button>
  );
}
