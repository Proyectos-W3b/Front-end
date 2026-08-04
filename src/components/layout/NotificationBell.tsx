import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotificaciones } from '../../hooks/useNotificaciones';

export default function NotificationBell() {
  const { notificaciones, noLeidas, marcarLeida, marcarTodas } = useNotificaciones();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {noLeidas > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.12)] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
            <span className="text-sm font-semibold text-slate-800">Notificaciones</span>
            {noLeidas > 0 && (
              <button
                onClick={() => marcarTodas.mutate()}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Sin notificaciones</p>
            ) : (
              notificaciones.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { if (!n.leido) marcarLeida.mutate(n.id); }}
                  className={[
                    'w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 transition-colors',
                    n.leido ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-2">
                    {!n.leido && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800">{n.titulo}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.mensaje}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(n.fecha).toLocaleString('es')}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
