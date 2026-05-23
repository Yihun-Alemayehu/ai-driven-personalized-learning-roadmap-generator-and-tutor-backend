import { NavLink, Outlet, useNavigate, useMatch } from 'react-router-dom';
import {
  BarChart2Icon,
  UsersIcon,
  GlobeIcon,
  ArrowLeftIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin/stats',   label: 'Statistics', icon: <BarChart2Icon size={15} /> },
  { to: '/admin/users',   label: 'Users',      icon: <UsersIcon size={15} />     },
  { to: '/admin/domains', label: 'Domains',    icon: <GlobeIcon size={15} />     },
];

function NavItemLink({ item }: { item: NavItem }) {
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
          {item.label}
        </>
      )}
    </NavLink>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const isBuilder = Boolean(useMatch('/admin/ontology/:id'));

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
              Admin
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
              <NavItemLink key={item.to} item={item} />
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
      <main
        className={`flex-1 min-w-0 ${
          isBuilder ? 'overflow-hidden' : 'overflow-y-auto px-8 py-8'
        }`}
      >
        <Outlet />
      </main>
      </div>
    </div>
  );
}
