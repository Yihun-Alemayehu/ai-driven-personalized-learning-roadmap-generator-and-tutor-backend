import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export default function AdminIndexRedirect() {
  const role = useAuthStore((s) => s.user?.role);
  return <Navigate to={role === 'admin' ? '/admin/stats' : '/admin/domains'} replace />;
}
