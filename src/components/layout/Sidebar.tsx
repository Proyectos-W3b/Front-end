import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { moduleCategories } from '../../config/modulos';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface Tooltip { label: string; x: number; y: number }

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const userRole = user?.rol ?? '';
  const [fotoPerfil, setFotoPerfil] = useState(() =>
    user?.id ? (localStorage.getItem(`foto_perfil_${user.id}`) ?? '') : '',
  );

  useEffect(() => {
    const handler = () =>
      setFotoPerfil(user?.id ? (localStorage.getItem(`foto_perfil_${user.id}`) ?? '') : '');
    window.addEventListener('foto-perfil-updated', handler);
    return () => window.removeEventListener('foto-perfil-updated', handler);
  }, [user?.id]);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [tooltip,   setTooltip]   = useState<Tooltip | null>(null);

  const categories = moduleCategories
    .filter((c) => c.roles.includes(userRole))
    .map((c) => ({ ...c, modules: c.modules.filter((m) => m.roles.includes(userRole)) }))
    .filter((c) => c.modules.length > 0);

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const showTip = (e: React.MouseEvent<HTMLElement>, label: string) => {
    if (isOpen) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, x: r.right + 10, y: r.top + r.height / 2 });
  };
  const hideTip = () => setTooltip(null);

  const handleLogout = () => { logout(); navigate('/login'); };
  const closeOnMobile = () => { if (window.innerWidth < 1024) onClose?.(); };

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Drawer ─────────────────────────────────────────────────────── */}
      <aside
        className={[
          // Base
          'flex flex-col shrink-0 select-none',
          'bg-white border-r border-gray-100',
          'transition-all duration-300 ease-in-out overflow-hidden',
          // Mobile — drawer fijo
          'fixed top-0 left-0 z-40 h-full shadow-xl',
          isOpen ? 'translate-x-0 w-60' : '-translate-x-full w-60',
          // Desktop — en flujo, ancho variable
          'lg:relative lg:translate-x-0 lg:shadow-none',
          isOpen ? 'lg:w-60' : 'lg:w-[68px]',
        ].join(' ')}
      >

        {/* ── Logo ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 h-14 px-3.5 border-b border-gray-100 shrink-0">
          {/* Isotipo */}
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
            <span className="text-white text-xs font-black tracking-tight">LN</span>
          </div>
          {/* Wordmark */}
          <div className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100 max-w-xs delay-100' : 'opacity-0 max-w-0'}`}>
            <p className="text-[13px] font-bold text-gray-900 leading-tight">
              Launcher<span className="text-blue-600">Net</span>
            </p>
            <p className="text-[10px] text-gray-400 leading-tight">Gestión de proyectos</p>
          </div>
        </div>

        {/* ── Navegación ───────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {categories.map((cat, idx) => {
            const isCatCollapsed = collapsed.has(cat.id);
            const CatIcon = cat.icon;

            return (
              <div key={cat.id}>
                {/* Cabecera de categoría */}
                <button
                  onClick={() => toggle(cat.id)}
                  onMouseEnter={(e) => showTip(e, cat.title)}
                  onMouseLeave={hideTip}
                  className={[
                    'group w-full flex items-center rounded-lg transition-all duration-200 mb-0.5',
                    'bg-blue-50/70 hover:bg-blue-100/80',
                    isOpen ? 'px-2.5 py-1.5' : 'justify-center px-2 py-2',
                  ].join(' ')}
                >
                  <CatIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />

                  <span className={[
                    'text-[9.5px] font-bold text-blue-600 uppercase tracking-[0.12em] whitespace-nowrap transition-all duration-200',
                    isOpen ? 'ml-2 opacity-100' : 'ml-0 w-0 opacity-0 overflow-hidden pointer-events-none',
                  ].join(' ')}>
                    {cat.title}
                  </span>

                  {isOpen && (
                    <span className="ml-auto text-blue-400">
                      {isCatCollapsed
                        ? <ChevronRight className="w-3 h-3" />
                        : <ChevronDown  className="w-3 h-3" />}
                    </span>
                  )}
                </button>

                {/* Ítems de la categoría */}
                <div className={[
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  isCatCollapsed ? 'max-h-0 opacity-0' : 'max-h-[600px] opacity-100',
                ].join(' ')}>
                  <div className="space-y-0.5 pb-1">
                    {cat.modules.map((mod) => {
                      const ModIcon = mod.icon;

                      /* Ítem externo (ej: Panel Admin) */
                      if (mod.external) {
                        return (
                          <button
                            key={mod.id}
                            onClick={() => { window.location.href = mod.path; }}
                            onMouseEnter={(e) => showTip(e, mod.name)}
                            onMouseLeave={hideTip}
                            className={[
                              'w-full flex items-center rounded-lg transition-all duration-150 text-left',
                              'text-red-500 hover:bg-red-50 hover:text-red-600',
                              isOpen ? 'px-3 py-2 gap-3' : 'justify-center px-2 py-2.5',
                            ].join(' ')}
                          >
                            <ModIcon className="w-[17px] h-[17px] shrink-0" />
                            <span className={[
                              'text-[13px] font-medium whitespace-nowrap transition-all duration-200',
                              isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden pointer-events-none',
                            ].join(' ')}>
                              {mod.name}
                            </span>
                          </button>
                        );
                      }

                      /* Ítem normal con NavLink */
                      return (
                        <NavLink
                          key={mod.id}
                          to={mod.path}
                          end={mod.exact}
                          onMouseEnter={(e) => showTip(e, mod.name)}
                          onMouseLeave={hideTip}
                          onClick={closeOnMobile}
                          className={({ isActive }) => [
                            'flex items-center rounded-lg transition-all duration-150',
                            isOpen ? 'px-3 py-2 gap-3' : 'justify-center px-2 py-2.5',
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
                          ].join(' ')}
                        >
                          {/* El ícono hereda el color del NavLink (text-white activo / text-gray-500 inactivo) */}
                          <ModIcon className="w-[17px] h-[17px] shrink-0 text-current" />
                          <span className={[
                            'text-[13px] font-medium whitespace-nowrap transition-all duration-200',
                            isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden pointer-events-none',
                          ].join(' ')}>
                            {mod.name}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>

                {/* Divisor entre secciones */}
                {idx < categories.length - 1 && (
                  <div className={`my-2 mx-1 h-px bg-gray-100 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Footer — usuario + logout ─────────────────────────────── */}
        <div className="border-t border-gray-100 px-2 py-3 shrink-0 space-y-1">

          {/* Tarjeta de usuario — solo en modo abierto */}
          {isOpen && user && (
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-gray-50 mb-1">
              {fotoPerfil ? (
                <img src={fotoPerfil} alt="avatar" className="w-7 h-7 rounded-full object-cover shrink-0 shadow-sm" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                  {user.nombre?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-gray-800 truncate leading-tight">
                  {user.nombre}
                </p>
                <p className="text-[10px] text-gray-400 capitalize leading-tight">{user.rol}</p>
              </div>
            </div>
          )}

          {/* Avatar solo en modo icono */}
          {!isOpen && user && (
            <div
              onMouseEnter={(e) => showTip(e, user.nombre)}
              onMouseLeave={hideTip}
              className="flex justify-center mb-1"
            >
              {fotoPerfil ? (
                <img src={fotoPerfil} alt="avatar" className="w-8 h-8 rounded-full object-cover shadow-sm" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {user.nombre?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            onMouseEnter={(e) => showTip(e, 'Cerrar sesión')}
            onMouseLeave={hideTip}
            className={[
              'w-full flex items-center rounded-lg text-[13px] font-medium',
              'text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200',
              isOpen ? 'px-3 py-2 gap-3' : 'justify-center px-2 py-2.5',
            ].join(' ')}
          >
            <LogOut className="w-[17px] h-[17px] shrink-0" />
            <span className={[
              'whitespace-nowrap transition-all duration-200',
              isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden pointer-events-none',
            ].join(' ')}>
              Cerrar sesión
            </span>
          </button>
        </div>
      </aside>

      {/* ── Tooltip flotante (desktop, modo icono) ──────────────────── */}
      {!isOpen && tooltip && (
        <div
          className="fixed z-[9999] pointer-events-none hidden lg:block"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translateY(-50%)' }}
        >
          <div className="relative bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            {tooltip.label}
            {/* Flecha izquierda */}
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900" />
          </div>
        </div>
      )}
    </>
  );
}
