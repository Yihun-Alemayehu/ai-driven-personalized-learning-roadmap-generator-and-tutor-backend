import { Link } from 'react-router-dom';
import { BellIcon } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { useAuth } from '@/hooks/useAuth';

interface NavbarProps {
  /** Breadcrumb items shown after the logo */
  breadcrumbs?: { label: string; to?: string }[];
  /** Unread notification count */
  unreadCount?: number;
}

export function Navbar({ breadcrumbs = [], unreadCount = 0 }: NavbarProps) {
  const { user } = useAuth();

  const initials = user?.fullName
    ? user.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <header
      className="flex-shrink-0 h-[58px] flex items-center gap-2 px-6 z-40"
      style={{
        background: 'color-mix(in srgb, #f3efe7 92%, transparent)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid #d6cfbf',
      }}
    >
      {/* Brand */}
      <Link to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
        <BrandMark />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, letterSpacing: '-0.01em' }}>
          Atlas<em style={{ fontStyle: 'italic', color: '#6e645a' }}>.learn</em>
        </span>
      </Link>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav
          className="flex items-center gap-1.5 text-[13px]"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a' }}
        >
          <span style={{ color: '#c2b9a6', margin: '0 2px' }}>/</span>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-[oklch(0.62_0.18_28)] transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span style={{ color: '#1a1614', fontWeight: 600 }}>{crumb.label}</span>
              )}
              {i < breadcrumbs.length - 1 && (
                <span style={{ color: '#c2b9a6' }}>/</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex-1" />

      {/* Notification bell */}
      <Link
        to="/notifications"
        className="relative w-[34px] h-[34px] rounded-lg border grid place-items-center transition-colors hover:bg-[#ebe6db]"
        style={{ borderColor: '#d6cfbf', color: '#6e645a' }}
        title="Notifications"
      >
        <BellIcon size={17} strokeWidth={1.6} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full grid place-items-center
                       text-[9px] font-bold text-white leading-none px-[3px]"
            style={{ background: 'oklch(0.60 0.18 28)', fontFamily: 'JetBrains Mono, monospace' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>

      {/* Avatar */}
      <Link
        to="/profile"
        className="w-8 h-8 rounded-full grid place-items-center cursor-pointer flex-shrink-0 transition-opacity hover:opacity-80"
        style={{ background: '#1a1614', color: '#f3efe7', fontFamily: "'Cormorant Garamond', serif", fontSize: 15 }}
        title="Profile"
      >
        {initials}
      </Link>
    </header>
  );
}
