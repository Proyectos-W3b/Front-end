import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute     from './PrivateRoute';
import AdminRoute       from './AdminRoute';
import Layout           from '../components/layout/Layout';
import AdminLayout      from '../components/layout/AdminLayout';

// Auth principal (backend)
import LoginPage          from '../pages/auth/LoginPage';
import RegisterPage       from '../pages/auth/RegisterPage';

// App
import DashboardPage      from '../pages/dashboard/DashboardPage';
import ProjectsPage       from '../pages/projects/ProjectsPage';
import ProjectDetailPage  from '../pages/projects/ProjectDetailPage';
import IncidentsPage      from '../pages/incidents/IncidentsPage';
import ClientesPage        from '../pages/clientes/ClientesPage';
import ClientesChatPage   from '../pages/clientes/ClientesChatPage';
import ClienteDetailPage  from '../pages/clientes/ClienteDetailPage';
import TrabajadoresPage   from '../pages/rrhh/TrabajadoresPage';

// Admin panel (auth independiente — sin backend)
import AdminLoginPage     from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import UsuariosAdminPage  from '../pages/admin/UsuariosAdminPage';
import RolesPage          from '../pages/admin/RolesPage';
import AuditoriaPage      from '../pages/admin/AuditoriaPage';
import ConfiguracionPage  from '../pages/admin/ConfiguracionPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Rutas públicas ─────────────────────────────────────────────── */}
        <Route path="/login"       element={<LoginPage />} />
        <Route path="/register"    element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* ── Rutas del sistema principal (requiere auth backend) ─────────── */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/"                   element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"          element={<DashboardPage />} />
            <Route path="/projects"           element={<ProjectsPage />} />
            <Route path="/projects/:id"       element={<ProjectDetailPage />} />
            <Route path="/incidents"  element={<IncidentsPage />} />
            <Route path="/clientes"        element={<ClientesPage />} />
            <Route path="/clientes/chat"   element={<ClientesChatPage />} />
            <Route path="/clientes/:id"    element={<ClienteDetailPage />} />
            <Route path="/trabajadores"  element={<TrabajadoresPage />} />
          </Route>
        </Route>

        {/* ── Panel administrativo (auth local — sin backend) ────────────── */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin"                 element={<AdminDashboardPage />} />
            <Route path="/admin/usuarios"        element={<UsuariosAdminPage />} />
            <Route path="/admin/roles"           element={<RolesPage />} />
            <Route path="/admin/auditoria"       element={<AuditoriaPage />} />
            <Route path="/admin/configuracion"   element={<ConfiguracionPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
