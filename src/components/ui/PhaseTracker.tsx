import { useState, useEffect, useMemo } from 'react';
import { GripVertical, Plus, X, Pencil } from 'lucide-react';
import type { Fase, EstadoFase } from '../../types';

interface PhaseTrackerProps {
  fases: Fase[];
  editable: boolean;
  onCycleEstado: (fase: Fase) => void;
  onRename: (fase: Fase, nombre: string) => void;
  onDelete: (fase: Fase) => void;
  onReorder: (orderedIds: string[]) => void;
  onAddClick: () => void;
}

const ESTADO_STYLES: Record<EstadoFase, { label: string; className: string }> = {
  pendiente:   { label: 'Sin iniciar', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  en_progreso: { label: 'En progreso', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  completado:  { label: 'Listo',       className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export default function PhaseTracker({ fases, editable, onCycleEstado, onRename, onDelete, onReorder, onAddClick }: PhaseTrackerProps) {
  const [order, setOrder] = useState(fases);
  const [dragId, setDragId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => { setOrder(fases); }, [fases]);

  const stats = useMemo(() => {
    const total = order.length;
    const completadas = order.filter((f) => f.estado === 'completado').length;
    const enProgreso = order.filter((f) => f.estado === 'en_progreso').length;
    const pendientes = total - completadas - enProgreso;
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
    return { total, completadas, enProgreso, pendientes, porcentaje };
  }, [order]);

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); return; }
    const next = [...order];
    const fromIdx = next.findIndex((f) => f.id === dragId);
    const toIdx = next.findIndex((f) => f.id === targetId);
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setOrder(next);
    onReorder(next.map((f) => f.id));
    setDragId(null);
  };

  const startEdit = (fase: Fase) => { setEditingId(fase.id); setEditValue(fase.nombre); };
  const commitEdit = (fase: Fase) => {
    if (editValue.trim() && editValue.trim() !== fase.nombre) onRename(fase, editValue.trim());
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Total fases" value={stats.total} />
        <StatTile label="Listas" value={stats.completadas} color="text-emerald-600" />
        <StatTile label="En progreso" value={stats.enProgreso} color="text-blue-600" />
        <StatTile label="Progreso" value={`${stats.porcentaje}%`} />
      </div>

      {/* Pills */}
      {order.length === 0 && !editable ? (
        <p className="text-sm text-slate-400">Aún no hay fases definidas para este proyecto.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {order.map((fase) => {
            const style = ESTADO_STYLES[fase.estado];
            const isEditing = editingId === fase.id;
            return (
              <div
                key={fase.id}
                draggable={editable && !isEditing}
                onDragStart={() => setDragId(fase.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(fase.id)}
                className={`group flex items-center gap-1 pl-2 pr-1.5 py-1 rounded-lg border text-xs font-medium transition-colors ${style.className} ${editable ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                {editable && <GripVertical className="w-3 h-3 opacity-30 group-hover:opacity-60 shrink-0" />}

                {isEditing ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => commitEdit(fase)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(fase);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                ) : (
                  <button
                    type="button"
                    disabled={!editable}
                    onClick={() => onCycleEstado(fase)}
                    className="flex items-center gap-1.5 disabled:cursor-default"
                    title={editable ? 'Clic para cambiar estado' : style.label}
                  >
                    <span>{fase.nombre}</span>
                    <span className="opacity-70">· {style.label}</span>
                  </button>
                )}

                {editable && !isEditing && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => startEdit(fase)}
                      className="p-0.5 rounded hover:bg-black/5">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={() => onDelete(fase)}
                      className="p-0.5 rounded hover:bg-black/5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {editable && (
            <button type="button" onClick={onAddClick}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-slate-300 text-xs font-medium text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
              <Plus className="w-3 h-3" /> Agregar fase
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, color = 'text-slate-900' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 px-4 py-3">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold tabular-nums mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}
