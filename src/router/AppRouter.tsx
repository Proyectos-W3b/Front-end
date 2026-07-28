import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute     from './PrivateRoute';
import AdminRoute       from './AdminRoute';
import Layout           from '../components/layout/Layout';
import AdminLayout      from '../components/layout/AdminLayout';

// Auth principal (backend)
import LoginPage          from '../features/auth/pages/LoginPage';
import RegisterPage       from '../features/auth/pages/RegisterPage';

// App
import DashboardPage      from '../features/dashboard/pages/DashboardPage';
import ProjectsPage       from '../features/projects/pages/ProjectsPage';
import ProjectDetailPage  from '../features/projects/pages/ProjectDetailPage';
import IncidentsPage      from '../features/incidents/pages/IncidentsPage';
import ClientesPage        from '../features/clientes/pages/ClientesPage';
import ClientesChatPage   from '../features/clientes/pages/ClientesChatPage';
import ClienteDetailPage  from '../features/clientes/pages/ClienteDetailPage';
import TrabajadoresPage   from '../features/rrhh/pages/TrabajadoresPage';
import UsuariosPage       from '../features/usuarios/pages/UsuariosPage';

// Admin panel (auth independiente — sin backend)
import AdminLoginPage     from '../features/admin/pages/AdminLoginPage';
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage';
import UsuariosAdminPage  from '../features/admin/pages/UsuariosAdminPage';
import RolesPage          from '../features/admin/pages/RolesPage';
import ConfiguracionPage  from '../features/admin/pages/ConfiguracionPage';

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
            <Route path="/projects/:slug"     element={<ProjectDetailPage />} />
            <Route path="/incidents"  element={<IncidentsPage />} />
            <Route path="/clientes"        element={<ClientesPage />} />
            <Route path="/clientes/chat"   element={<ClientesChatPage />} />
            <Route path="/clientes/:id"    element={<ClienteDetailPage />} />
            <Route path="/trabajadores"  element={<TrabajadoresPage />} />
            <Route path="/usuarios"      element={<UsuariosPage />} />
          </Route>
        </Route>

        {/* ── Panel administrativo (auth local — sin backend) ────────────── */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin"                 element={<AdminDashboardPage />} />
            <Route path="/admin/usuarios"        element={<UsuariosAdminPage />} />
            <Route path="/admin/roles"           element={<RolesPage />} />
            <Route path="/admin/configuracion"   element={<ConfiguracionPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
