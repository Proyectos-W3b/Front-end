import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

const NAV = [
  { to: '/admin',               icon: '🖥',  label: 'Dashboard',       end: true  },
  { to: '/admin/usuarios',      icon: '👤', label: 'Usuarios'                    },
  { to: '/admin/roles',         icon: '🔑', label: 'Roles y Permisos'            },
  { to: '/admin/configuracion', icon: '⚙',  label: 'Configuración'               },
];

export default function AdminLayout() {
  const user     = useAuthStore((s) => s.user);
  const logout   = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 w-56 bg-slate-950 flex flex-col z-20 shadow-xl">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-800">
          <span className="text-white font-bold text-lg tracking-tight">
            Launcher<span className="text-blue-400">Net</span>
          </span>
          <p className="text-slate-500 text-xs mt-0.5">Panel Administrativo</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Separador — volver al sistema */}
          <div className="pt-4">
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-widest text-slate-700 select-none">
              Accesos
            </p>
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-800 hover:text-white transition-all duration-150"
            >
              <span className="text-base w-5 text-center">↗</span>
              Sistema principal
            </a>
          </div>
        </nav>

        {/* Perfil admin */}
        <div className="px-4 py-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow shadow-blue-600/40">
              {user?.nombre?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-200 text-xs font-semibold truncate">{user?.nombre}</p>
              <p className="text-slate-600 text-xs truncate">{user?.correo}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors px-1 py-1 rounded hover:bg-red-950/30"
          >
            <span>⬡</span>
            Cerrar sesión admin
          </button>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <div className="ml-56 flex-1 flex flex-col min-h-0">

        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full font-semibold">
              🛡 Superadmin
            </span>
            <span className="text-xs text-gray-400">Sesión activa · 8 h</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            Cerrar sesión
          </button>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
