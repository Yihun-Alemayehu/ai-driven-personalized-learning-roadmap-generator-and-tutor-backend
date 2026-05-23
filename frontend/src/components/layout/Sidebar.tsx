import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboardIcon, BookOpenIcon, BellIcon,
  UsersIcon, BarChart2Icon, FlagIcon,
  ShieldIcon, GlobeIcon, SettingsIcon, UserIcon, BookMarkedIcon,
  PanelLeftCloseIcon, PanelLeftOpenIcon, SparklesIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useMyLearningStore } from '@/store/myLearning.store';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const COLLAPSED_KEY = 'nav-sidebar-collapsed';

function readCollapsed(): boolean {
  try { return localStorage.getItem(COLLAPSED_KEY) === 'true'; } catch { return false; }
}

function NavItemLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/dashboard'}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center transition-colors rounded-lg',
          collapsed ? 'justify-center p-2.5 mx-1' : 'gap-2.5 px-3 py-2',
          !isActive && 'hover:bg-[#ebe6db]',
        )
      }
      style={({ isActive }) => ({
        fontFamily: "'Crimson Pro', serif",
        fontSize: 13.5,
        fontWeight: isActive ? 600 : 400,
        background: isActive ? 'color-mix(in srgb, oklch(0.62 0.18 28) 10%, #faf7f1)' : undefined,
        color: isActive ? 'oklch(0.52 0.18 28)' : '#3a342e',
      })}
    >
      {({ isActive }) => (
        <>
          <span className="shrink-0" style={{ color: isActive ? 'oklch(0.52 0.18 28)' : '#9a9088' }}>
            {item.icon}
          </span>
          {!collapsed && item.label}
        </>
      )}
    </NavLink>
  );
}

function SidebarGroup({
  label,
  items,
  collapsed,
}: {
  label: string;
  items: NavItem[];
  collapsed: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {!collapsed && (
        <div
          className="text-[9px] tracking-[0.16em] uppercase px-3 mb-0.5 mt-0.5"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
        >
          {label}
        </div>
      )}
      {collapsed && <div className="mx-2 my-1 border-t" style={{ borderColor: '#e8e2d9' }} />}
      {items.map((item) => (
        <NavItemLink key={item.to} item={item} collapsed={collapsed} />
      ))}
    </div>
  );
}

function MyLearningSection({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { entries, remove } = useMyLearningStore();

  const activeEnrollmentId = location.pathname.match(/\/enrollments\/([^/]+)\//)?.[1];

  const uniqueEntries = entries.filter(
    (entry, idx, arr) => arr.findIndex((e) => e.domainSlug === entry.domainSlug) === idx,
  );

  if (uniqueEntries.length === 0) return null;

  if (collapsed) {
    return (
      <>
        <div className="mx-2 my-1 border-t" style={{ borderColor: '#e8e2d9' }} />
        {uniqueEntries.map((entry) => {
          const isActive = entry.enrollmentId === activeEnrollmentId;
          return (
            <button
              key={entry.enrollmentId}
              title={entry.domainName}
              onClick={() => navigate(`/enrollments/${entry.enrollmentId}/learn/${entry.lastNodeId}`)}
              className="flex justify-center items-center p-2.5 mx-1 rounded-lg transition-colors"
              style={{
                background: isActive
                  ? 'color-mix(in srgb, oklch(0.62 0.18 28) 10%, #faf7f1)'
                  : undefined,
                color: isActive ? 'oklch(0.52 0.18 28)' : '#9a9088',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#ebe6db'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <BookMarkedIcon size={15} />
            </button>
          );
        })}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div
        className="text-[9px] tracking-[0.16em] uppercase px-3 mb-0.5 mt-0.5"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
      >
        My Learning
      </div>
      {uniqueEntries.map((entry) => {
        const isActive = entry.enrollmentId === activeEnrollmentId;
        return (
          <div
            key={entry.enrollmentId}
            className="group flex items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer"
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
              size={14}
              className="shrink-0"
              style={{ color: isActive ? 'oklch(0.52 0.18 28)' : '#9a9088' }}
            />
            <span
              className="flex-1 min-w-0 truncate"
              style={{
                fontFamily: "'Crimson Pro', serif",
                fontSize: 13.5,
                color: isActive ? 'oklch(0.52 0.18 28)' : '#3a342e',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {entry.domainName}
            </span>
            <button
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center rounded text-[12px] leading-none"
              style={{ color: '#b0a898' }}
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
  const [collapsed, setCollapsed] = useState(readCollapsed);

  function toggle() {
    setCollapsed((v) => {
      const next = !v;
      try { localStorage.setItem(COLLAPSED_KEY, String(next)); } catch { /* noop */ }
      return next;
    });
  }

  return (
    <aside
      className="flex flex-col flex-shrink-0 overflow-hidden"
      style={{
        background: '#faf7f1',
        borderRight: '1px solid #d6cfbf',
        width: collapsed ? 52 : 220,
        transition: 'width 0.2s ease',
      }}
    >
      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-4 min-h-0">
        <SidebarGroup
          label="Learn"
          collapsed={collapsed}
          items={[
            { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon size={15} /> },
            { to: '/catalog', label: 'Catalog', icon: <BookOpenIcon size={15} /> },
            { to: '/insights', label: 'Insights', icon: <SparklesIcon size={15} /> },
            { to: '/notifications', label: 'Notifications', icon: <BellIcon size={15} /> },
          ]}
        />

        <MyLearningSection collapsed={collapsed} />

        {isInstructor && (
          <SidebarGroup
            label="Domain Expert"
            collapsed={collapsed}
            items={[
              { to: '/instructor/learners', label: 'Learners', icon: <UsersIcon size={15} /> },
              { to: '/instructor/flagged', label: 'Flagged', icon: <FlagIcon size={15} /> },
            ]}
          />
        )}

        {isAdmin && (
          <SidebarGroup
            label="Admin"
            collapsed={collapsed}
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
          collapsed={collapsed}
          items={[
            { to: '/profile', label: 'Profile', icon: <UserIcon size={15} /> },
            { to: '/settings', label: 'Settings', icon: <SettingsIcon size={15} /> },
          ]}
        />
      </div>

      {/* Collapse toggle — pinned at bottom */}
      <button
        onClick={toggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={cn(
          'shrink-0 flex items-center border-t transition-colors',
          collapsed ? 'justify-center p-3' : 'gap-2 px-4 py-3',
          'hover:bg-[#ebe6db]',
        )}
        style={{ borderColor: '#e8e2d9', color: '#9a9088' }}
      >
        {collapsed ? (
          <PanelLeftOpenIcon size={15} />
        ) : (
          <>
            <PanelLeftCloseIcon size={15} />
            <span
              className="text-[12px]"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
            >
              Collapse
            </span>
          </>
        )}
      </button>
    </aside>
  );
}
