import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface HeaderProps {
  title: string;
  onToggle: () => void;
  sidebarOpen: boolean;
}

export default function Header({ title, onToggle, sidebarOpen }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [fotoPerfil, setFotoPerfil] = useState(() =>
    user?.id ? (localStorage.getItem(`foto_perfil_${user.id}`) ?? '') : '',
  );

  useEffect(() => {
    const handler = () =>
      setFotoPerfil(user?.id ? (localStorage.getItem(`foto_perfil_${user.id}`) ?? '') : '');
    window.addEventListener('foto-perfil-updated', handler);
    return () => window.removeEventListener('foto-perfil-updated', handler);
  }, [user?.id]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="h-14 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between px-5 flex-shrink-0 z-10 sticky top-0">

      {/* Left — toggle + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {sidebarOpen
            ? <X    className="w-5 h-5" />
            : <Menu className="w-5 h-5" />}
        </button>
        <h1 className="hidden sm:block text-sm font-semibold text-slate-900">{title}</h1>
      </div>

      {/* Right — notifications + user */}
      <div className="flex items-center gap-1">

        {/* Bell */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-2" />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-semibold text-slate-900 leading-tight">
              {user?.nombre}
            </p>
            <p className="text-[11px] text-slate-500 leading-tight capitalize">{user?.rol}</p>
          </div>
          {fotoPerfil ? (
            <img src={fotoPerfil} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm shadow-blue-200/60">
              {user?.nombre?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="ml-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-50"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
