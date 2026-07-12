import { useState, useEffect, useMemo } from 'react';
import { GripVertical, Plus, X, Pencil, Check, ArrowRight, RotateCcw } from 'lucide-react';
import ProgressBar from './ProgressBar';
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

const ESTADO_STYLES: Record<EstadoFase, { label: string; badgeClass: string; lineClass: string }> = {
  pendiente:   { label: 'Sin iniciar', badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',   lineClass: 'bg-slate-200' },
  en_progreso: { label: 'En progreso', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',       lineClass: 'bg-slate-200' },
  completado:  { label: 'Listo',       badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', lineClass: 'bg-emerald-300' },
};

const NEXT_ESTADO: Record<EstadoFase, EstadoFase> = {
  pendiente: 'en_progreso', en_progreso: 'completado', completado: 'pendiente',
};

function NodeIcon({ estado }: { estado: EstadoFase }) {
  if (estado === 'completado') {
    return (
      <div className="w-6 h-6 rounded-full bg-emerald-500 ring-4 ring-emerald-50 flex items-center justify-center shrink-0">
        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
      </div>
    );
  }
  if (estado === 'en_progreso') {
    return (
      <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
        <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-40 animate-ping" />
        <span className="relative w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-50" />
      </div>
    );
  }
  return <div className="w-6 h-6 rounded-full border-2 border-slate-300 bg-white shrink-0" />;
}

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
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
    return { total, completadas, enProgreso, porcentaje };
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
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Total fases" value={stats.total} />
        <StatTile label="Listas" value={stats.completadas} color="text-emerald-600" />
        <StatTile label="En progreso" value={stats.enProgreso} color="text-blue-600" />
        <StatTile label="Progreso" value={`${stats.porcentaje}%`} />
      </div>

      {/* Barra de avance general — cuántas fases están completadas */}
      {order.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-slate-500">Avance de fases</p>
            <p className="text-xs text-slate-400">{stats.completadas} de {stats.total} completadas</p>
          </div>
          <ProgressBar value={stats.porcentaje} size="md" showLabel />
        </div>
      )}

      {/* Timeline vertical */}
      {order.length === 0 && !editable ? (
        <p className="text-sm text-slate-400">Aún no hay fases definidas para este proyecto.</p>
      ) : (
        <div>
          {order.map((fase, idx) => {
            const style = ESTADO_STYLES[fase.estado];
            const isEditing = editingId === fase.id;
            const isLast = idx === order.length - 1 && !editable;
            return (
              <div
                key={fase.id}
                draggable={editable && !isEditing}
                onDragStart={(e) => {
                  if (!(e.target as HTMLElement).closest('[data-drag-handle]')) { e.preventDefault(); return; }
                  setDragId(fase.id);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(fase.id)}
                className={`group relative pl-9 ${isLast ? 'pb-0' : 'pb-7'}`}
              >
                {!isLast && (
                  <div className={`absolute left-[11px] top-6 bottom-0 w-px ${style.lineClass}`} />
                )}
                <div className="absolute left-0 top-0">
                  <NodeIcon estado={fase.estado} />
                </div>

                <div className="flex items-center gap-2 flex-wrap min-h-6 -mt-0.5">
                  {editable && (
                    <GripVertical
                      data-drag-handle
                      className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 shrink-0 cursor-grab active:cursor-grabbing"
                    />
                  )}

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
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  ) : (
                    <span className="font-semibold text-sm text-slate-800">{fase.nombre}</span>
                  )}

                  {editable && fase.estado !== 'completado' ? (
                    <button
                      type="button"
                      onClick={() => onCycleEstado(fase)}
                      title={`Avanzar a: ${ESTADO_STYLES[NEXT_ESTADO[fase.estado]].label}`}
                      className={`flex items-center gap-1 text-[11px] font-medium pl-2 pr-1.5 py-0.5 rounded-full border shrink-0 transition-colors hover:brightness-95 ${style.badgeClass}`}
                    >
                      {style.label}
                      <ArrowRight className="w-3 h-3 opacity-60" />
                    </button>
                  ) : (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${style.badgeClass}`}>
                      {style.label}
                    </span>
                  )}

                  {editable && !isEditing && (
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {fase.estado === 'completado' && (
                        <button type="button" onClick={() => onCycleEstado(fase)}
                          title="Reiniciar a Sin iniciar"
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button type="button" onClick={() => startEdit(fase)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => onDelete(fase)}
                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {editable && (
            <div className="relative pl-9">
              <button
                type="button"
                onClick={onAddClick}
                className="absolute left-0 top-0 w-6 h-6 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onAddClick}
                className="text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors min-h-6 flex items-center"
              >
                Agregar fase
              </button>
            </div>
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
