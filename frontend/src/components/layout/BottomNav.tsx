import { NavLink } from 'react-router-dom';
import { LayoutDashboardIcon, BookOpenIcon, BellIcon, UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const BASE_ITEMS = [
  { to: '/dashboard',     icon: LayoutDashboardIcon, label: 'Home'    },
  { to: '/catalog',       icon: BookOpenIcon,         label: 'Catalog' },
  { to: '/notifications', icon: BellIcon,             label: 'Alerts'  },
  { to: '/profile',       icon: UserIcon,             label: 'Profile' },
];

export function BottomNav() {
  const { isAdmin, isInstructor } = useAuth();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 flex border-t"
      style={{ background: '#faf7f1', borderColor: '#d6cfbf', height: 60 }}
    >
      {BASE_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/dashboard'}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
          style={({ isActive }) => ({
            color: isActive ? 'oklch(0.62 0.18 28)' : '#9a9088',
          })}
        >
          <Icon size={20} />
          <span
            className="text-[10px] tracking-[0.03em]"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {label}
          </span>
        </NavLink>
      ))}

      {(isAdmin || isInstructor) && (
        <NavLink
          to={isAdmin ? '/admin' : '/instructor'}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
          style={({ isActive }) => ({
            color: isActive ? 'oklch(0.62 0.18 28)' : '#9a9088',
          })}
        >
          <span className="text-[18px] leading-none">{isAdmin ? '🛡' : '🎓'}</span>
          <span
            className="text-[10px] tracking-[0.03em]"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {isAdmin ? 'Admin' : 'Teach'}
          </span>
        </NavLink>
      )}
    </nav>
  );
}
