import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4" style={{ background: '#f3efe7' }}>
      <div className="text-[80px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#d6cfbf' }}>403</div>
      <h1 className="text-[28px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>Access denied</h1>
      <p style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}>You don't have permission to view this page.</p>
      <Link to="/dashboard" className="text-[14px]" style={{ color: 'oklch(0.62 0.18 28)', fontFamily: "'Crimson Pro', serif" }}>
        ← Return to dashboard
      </Link>
    </div>
  );
}
