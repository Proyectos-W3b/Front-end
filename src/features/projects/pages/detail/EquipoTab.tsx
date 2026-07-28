import { FormEvent, useState } from 'react';
import { Trash2, Users } from 'lucide-react';
import { useToast } from '../../../../components/ui/Toast';
import { useTrabajadores } from '../../../../hooks/useTrabajadores';
import { useEquipo } from './hooks/useEquipo';

export default function EquipoTab({ projectId, isAdmin, active }: { projectId: string; isAdmin: boolean; active: boolean }) {
  const { success, error: toastError } = useToast();
  const { data: equipo, asignar, quitar } = useEquipo(projectId, active);
  const trabajadores = useTrabajadores(active);
  const [asignandoId, setAsignandoId] = useState('');

  const onAsignar = async (e: FormEvent) => {
    e.preventDefault();
    if (!asignandoId) return;
    try {
      await asignar.mutateAsync(asignandoId);
      setAsignandoId('');
      success('Trabajador asignado al equipo', 'Ya puede ver este proyecto en su bandeja.');
    } catch (err: any) { toastError('No se pudo asignar', err?.message); }
  };

  const onQuitar = async (asignacionId: string) => {
    await quitar.mutateAsync(asignacionId);
    success('Trabajador removido del equipo');
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900">Equipo asignado</h3>

      {equipo.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-10 text-center">
          <Users className="w-7 h-7 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Aún no hay trabajadores asignados a este proyecto</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {equipo.map((a) => (
            <div key={a.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-3 min-w-0">
                {a.trabajador?.fotoUrl ? (
                  <img src={a.trabajador.fotoUrl} alt={a.trabajador.nombre} className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(a.trabajador?.nombre?.[0] ?? '?').toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-800 truncate">{a.trabajador?.nombre ?? 'Trabajador'}</span>
              </div>
              {isAdmin && (
                <button onClick={() => onQuitar(a.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                  title="Quitar del proyecto">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <form onSubmit={onAsignar} className="flex gap-2 pt-2 border-t border-slate-100">
          <select className="input flex-1 text-sm" value={asignandoId}
            onChange={(e) => setAsignandoId(e.target.value)} required>
            <option value="">Seleccionar trabajador…</option>
            {trabajadores.data
              .filter((t) => !equipo.some((a) => a.trabajadorId === t.id))
              .map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
          <button type="submit" disabled={asignar.isPending || !asignandoId} className="btn-primary btn-sm shrink-0">
            {asignar.isPending ? 'Asignando…' : 'Asignar'}
          </button>
        </form>
      )}
    </div>
  );
}
