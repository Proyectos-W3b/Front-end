import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const TITLES: Record<string, string> = {
  '/dashboard':          'Dashboard',
  '/projects':           'Proyectos',
  '/incidents':          'Incidencias',
  '/rrhh/empleados':     'Empleados',
  '/rrhh/departamentos': 'Departamentos',
  '/rrhh/cargos':        'Cargos',
  '/rrhh/asistencia':    'Asistencia',
};

export default function Layout() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const title = TITLES[pathname]
    ?? (pathname.startsWith('/projects/') ? 'Detalle del Proyecto' : 'LauncherNet');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed en mobile, en flujo en desktop */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Header
          title={title}
          onToggle={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
