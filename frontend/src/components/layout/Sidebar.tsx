import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboardIcon, BookOpenIcon, BellIcon,
  UsersIcon, BarChart2Icon, FlagIcon,
  ShieldIcon, GlobeIcon, SettingsIcon, UserIcon, BookMarkedIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useMyLearningStore } from '@/store/myLearning.store';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

function SidebarGroup({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div
        className="text-[9px] tracking-[0.14em] uppercase px-3 mb-1"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
      >
        {label}
      </div>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/dashboard'}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors',
              isActive
                ? 'font-medium'
                : 'hover:bg-[#ebe6db]',
            )
          }
          style={({ isActive }) => ({
            fontFamily: "'Crimson Pro', serif",
            background: isActive ? 'color-mix(in srgb, oklch(0.62 0.18 28) 10%, #faf7f1)' : undefined,
            color: isActive ? 'oklch(0.62 0.18 28)' : '#3a342e',
          })}
        >
          {({ isActive }) => (
            <>
              <span style={{ color: isActive ? 'oklch(0.62 0.18 28)' : '#9a9088' }}>
                {item.icon}
              </span>
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

function MyLearningSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { entries, remove } = useMyLearningStore();

  // Extract active enrollmentId from /enrollments/:id/learn/:nodeId
  const activeEnrollmentId = location.pathname.match(/\/enrollments\/([^/]+)\//)?.[1];

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-0.5">
      <div
        className="text-[9px] tracking-[0.14em] uppercase px-3 mb-1"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
      >
        My Learning
      </div>
      {entries.map((entry) => {
        const isActive = entry.enrollmentId === activeEnrollmentId;
        return (
          <div
            key={entry.enrollmentId}
            className="group flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            style={{
              background: isActive
                ? 'color-mix(in srgb, oklch(0.62 0.18 28) 10%, #faf7f1)'
                : 'transparent',
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#ebe6db'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = isActive ? 'color-mix(in srgb, oklch(0.62 0.18 28) 10%, #faf7f1)' : 'transparent'; }}
            onClick={() => navigate(`/enrollments/${entry.enrollmentId}/learn/${entry.lastNodeId}`)}
          >
            <BookMarkedIcon
              size={13}
              style={{ color: isActive ? 'oklch(0.62 0.18 28)' : '#9a9088', flexShrink: 0 }}
            />
            <span
              className="flex-1 min-w-0 truncate text-[13px]"
              style={{
                fontFamily: "'Crimson Pro', serif",
                color: isActive ? 'oklch(0.62 0.18 28)' : '#3a342e',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {entry.domainName}
            </span>
            <button
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center rounded text-[11px]"
              style={{ color: '#9a9088' }}
              onClick={(e) => { e.stopPropagation(); remove(entry.enrollmentId); }}
              title="Remove"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const { isAdmin, isInstructor } = useAuth();

  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col gap-5 py-5 px-3 overflow-y-auto"
      style={{ background: '#faf7f1', borderRight: '1px solid #d6cfbf' }}
    >
      <SidebarGroup
        label="Learn"
        items={[
          { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon size={15} /> },
          { to: '/catalog', label: 'Catalog', icon: <BookOpenIcon size={15} /> },
          { to: '/notifications', label: 'Notifications', icon: <BellIcon size={15} /> },
        ]}
      />

      <MyLearningSection />

      {isInstructor && (
        <SidebarGroup
          label="Instructor"
          items={[
            { to: '/instructor/learners', label: 'Learners', icon: <UsersIcon size={15} /> },
            { to: '/instructor/flagged', label: 'Flagged', icon: <FlagIcon size={15} /> },
          ]}
        />
      )}

      {isAdmin && (
        <SidebarGroup
          label="Admin"
          items={[
            { to: '/admin/users', label: 'Users', icon: <ShieldIcon size={15} /> },
            { to: '/admin/domains', label: 'Domains', icon: <GlobeIcon size={15} /> },
            { to: '/admin/stats', label: 'Statistics', icon: <BarChart2Icon size={15} /> },
          ]}
        />
      )}

      <div className="flex-1" />

      <SidebarGroup
        label="Account"
        items={[
          { to: '/profile', label: 'Profile', icon: <UserIcon size={15} /> },
          { to: '/settings', label: 'Settings', icon: <SettingsIcon size={15} /> },
        ]}
      />
    </aside>
  );
}
