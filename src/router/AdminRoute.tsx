import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '../store/admin-auth.store';
import { parseAdminToken } from '../lib/admin-auth';

export default function AdminRoute() {
  const token           = useAdminAuthStore((s) => s.token);
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const logout          = useAdminAuthStore((s) => s.logout);

  // Verificar expiración del token (sin llamar a funciones del store durante render)
  const tokenPayload = token ? parseAdminToken(token) : null;
  const tokenValid   = tokenPayload !== null;

  // Limpiar sesión si el token ya expiró (sin depender del reloj del render)
  useEffect(() => {
    if (isAuthenticated && !tokenValid) {
      logout();
    }
  }, [isAuthenticated, tokenValid, logout]);

  if (!isAuthenticated || !tokenValid) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
