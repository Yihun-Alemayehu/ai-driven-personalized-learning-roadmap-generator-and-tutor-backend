import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { UsersIcon, BarChart2Icon, FlagIcon, ArrowLeftIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlaggedEventsQuery } from '@/api/instructor';
import { Navbar } from '@/components/layout/Navbar';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/instructor/learners',  label: 'Learners',       icon: <UsersIcon size={15} />    },
  { to: '/instructor/analytics', label: 'Analytics',      icon: <BarChart2Icon size={15} /> },
  { to: '/instructor/flagged',   label: 'Flagged Events', icon: <FlagIcon size={15} />     },
];

function NavItemLink({
  item,
  badge,
}: {
  item: NavItem;
  badge?: number;
}) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors',
          !isActive && 'hover:bg-[#ebe6db]',
        )
      }
      style={({ isActive }) => ({
        fontFamily: "'Crimson Pro', serif",
        fontSize: 13.5,
        fontWeight: isActive ? 600 : 400,
        background: isActive
          ? 'color-mix(in srgb, oklch(0.62 0.18 28) 10%, #faf7f1)'
          : undefined,
        color: isActive ? 'oklch(0.52 0.18 28)' : '#3a342e',
      })}
    >
      {({ isActive }) => (
        <>
          <span
            className="shrink-0"
            style={{ color: isActive ? 'oklch(0.52 0.18 28)' : '#9a9088' }}
          >
            {item.icon}
          </span>
          <span className="flex-1">{item.label}</span>
          {badge != null && badge > 0 && (
            <span
              className="min-w-4 h-4 rounded-full grid place-items-center text-[9px] font-bold leading-none px-0.5"
              style={{
                background: 'oklch(0.62 0.18 28)',
                color: '#fff',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function InstructorLayout() {
  const navigate = useNavigate();
  const { data: flaggedData } = useFlaggedEventsQuery();

  const unresolvedCount =
    flaggedData?.flaggedEvents.filter((e) => !e.details?.resolved).length ?? 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#faf7f1' }}>
      <Navbar />
      <div className="flex flex-1 overflow-hidden min-h-0">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className="shrink-0 flex flex-col overflow-hidden"
        style={{
          width: 220,
          background: '#faf7f1',
          borderRight: '1px solid #d6cfbf',
        }}
      >
        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-4 min-h-0">
          {/* Brand header */}
          <div className="px-4 flex flex-col gap-0.5">
            <div
              className="text-[9px] tracking-[0.16em] uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
            >
              Domain Expert
            </div>
            <div
              className="text-[20px] font-medium leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
            >
              Dashboard
            </div>
          </div>

          {/* Nav group */}
          <div className="flex flex-col gap-0.5">
            <div
              className="text-[9px] tracking-[0.16em] uppercase px-3 mb-0.5"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
            >
              Manage
            </div>
            {NAV_ITEMS.map((item) => (
              <NavItemLink
                key={item.to}
                item={item}
                badge={item.label === 'Flagged Events' ? unresolvedCount : undefined}
              />
            ))}
          </div>
        </div>

        {/* Back button — pinned at bottom */}
        <button
          onClick={() => navigate('/dashboard')}
          className="shrink-0 flex items-center gap-2 px-4 py-3 border-t transition-colors hover:bg-[#ebe6db]"
          style={{ borderColor: '#e8e2d9', color: '#9a9088' }}
        >
          <ArrowLeftIcon size={15} />
          <span
            className="text-[12px]"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
          >
            Learner view
          </span>
        </button>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto px-8 py-8">
        <Outlet />
      </main>
      </div>
    </div>
  );
}
