import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function AdminRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user            = useAuthStore((s) => s.user);

  if (!isAuthenticated || user?.rol !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
