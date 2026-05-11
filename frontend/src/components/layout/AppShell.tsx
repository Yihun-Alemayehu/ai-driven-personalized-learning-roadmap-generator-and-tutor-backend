import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useIsDesktop } from '@/hooks/useMediaQuery';

export default function AppShell() {
  const isDesktop = useIsDesktop();

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: '#f3efe7', color: '#1a1614' }}
    >
      <Navbar />
      <div className="flex flex-1 overflow-hidden min-h-0">
        {isDesktop && <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
