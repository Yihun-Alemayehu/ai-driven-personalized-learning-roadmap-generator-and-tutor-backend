import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/admin/stats',   icon: '📊', label: 'System Stats'    },
  { to: '/admin/users',   icon: '👥', label: 'Users'           },
  { to: '/admin/domains', icon: '📦', label: 'Domains'         },
];

function SidebarLink({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[14px] transition-colors ${isActive ? '' : 'hover:bg-[#ebe6db]'}`
      }
      style={({ isActive }) => ({
        fontFamily: "'Crimson Pro', serif",
        background: isActive ? '#1a1614' : 'transparent',
        color: isActive ? '#faf7f1' : '#3a342e',
      })}
    >
      <span className="text-[16px] w-5 text-center">{icon}</span>
      <span className="flex-1">{label}</span>
    </NavLink>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen min-h-screen overflow-hidden" style={{ background: '#faf7f1' }}>
      {/* Sidebar */}
      <aside
        className="shrink-0 flex flex-col border-r overflow-y-auto"
        style={{ width: 220, borderColor: '#d6cfbf', background: '#f3efe7' }}
      >
        <div className="px-4 pt-5 pb-4 border-b" style={{ borderColor: '#d6cfbf' }}>
          <div
            className="text-[11px] tracking-[0.12em] uppercase mb-0.5"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
          >
            Admin
          </div>
          <div
            className="text-[18px]"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
          >
            Dashboard
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 py-3 flex-1">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>

        <div className="px-3 py-3 border-t" style={{ borderColor: '#d6cfbf' }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] transition-colors hover:bg-[#ebe6db]"
            style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}
          >
            <span>←</span>
            <span>Back to learner view</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
