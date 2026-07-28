import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, MessageSquare, Paperclip, Trash2, Eye } from 'lucide-react';
import incidentsService from '../services/incidents.service';
import Badge from '../../../components/ui/Badge';
import KanbanBoard, { type KanbanColumn } from '../../../components/ui/KanbanBoard';
import { FullPageSpinner } from '../../../components/ui/Spinner';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import { useAuthStore } from '../../../store/auth.store';
import IncidenciaDetailModal from '../../../components/incidencias/IncidenciaDetailModal';
import type { Incidencia } from '../../../types';
import { useIncidentsPageData } from './useIncidentsPageData';

const INCIDENCIA_COLUMNS: KanbanColumn[] = [
  { key: 'abierta',     label: 'Abierta',     headerClass: 'bg-red-50 border-red-100',     dotClass: 'bg-red-500',     labelClass: 'text-red-700',     accentClass: 'border-l-red-400' },
  { key: 'en_proceso',  label: 'En proceso',  headerClass: 'bg-amber-50 border-amber-100', dotClass: 'bg-amber-500',   labelClass: 'text-amber-700',   accentClass: 'border-l-amber-400' },
  { key: 'resuelta',    label: 'Resuelta',    headerClass: 'bg-blue-50 border-blue-100',   dotClass: 'bg-blue-500',    labelClass: 'text-blue-700',    accentClass: 'border-l-blue-400' },
  { key: 'cerrada',     label: 'Cerrada',     headerClass: 'bg-slate-50 border-slate-200', dotClass: 'bg-slate-400',   labelClass: 'text-slate-600',   accentClass: 'border-l-slate-300' },
];

const PRIORIDAD_DOT: Record<string, string> = {
  baja: 'bg-slate-300', media: 'bg-amber-400', alta: 'bg-orange-500', critica: 'bg-red-600',
};

export default function IncidentsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.rol === 'admin';
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const [filterProject, setFilterProject] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);

  const { incidents, projects, clientes, loading, commentCountById, archivoCountById } =
    useIncidentsPageData(filterProject, isAdmin);

  const invalidateList = () => queryClient.invalidateQueries({ queryKey: ['incidencias', 'all'] });

  const removeMutation = useMutation({
    mutationFn: (id: string) => incidentsService.remove(id),
    onSuccess: invalidateList,
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => incidentsService.update(id, { estado: estado as any }),
    onMutate: ({ id, estado }) => {
      queryClient.setQueryData<Incidencia[]>(['incidencias', 'all', filterProject || null], (prev = []) =>
        prev.map((i) => (i.id === id ? { ...i, estado: estado as any } : i)));
    },
    onError: invalidateList,
  });

  const projectName = (id: string) => projects.find((p) => p.id === id)?.nombre ?? 'Proyecto eliminado';
  const clienteName = (clienteId: string) => clientes.find((c) => c.id === clienteId)?.empresa ?? null;

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta incidencia?')) return;
    await removeMutation.mutateAsync(id);
    success('Incidencia eliminada');
  };

  const handleMove = (incidenciaId: string, newEstado: string) => {
    const inc = incidents.find((i) => i.id === incidenciaId);
    if (!inc || inc.estado === newEstado) return;
    moveMutation.mutate({ id: incidenciaId, estado: newEstado }, {
      onSuccess: () => success('Estado actualizado', `"${inc.titulo}" pasó a ${newEstado.replace('_', ' ')}.`),
      onError: () => toastError('No se pudo cambiar el estado'),
    });
  };

  const selected = incidents.find((i) => i.id === detailId) ?? null;

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Incidencias</h2>
          <p className="text-sm text-slate-500">{incidents.length} registro{incidents.length !== 1 ? 's' : ''}</p>
        </div>
        <select className="input w-52" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="">Todos los proyectos</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>

      {incidents.length === 0 ? (
        <EmptyState title="Sin incidencias" description="No hay incidencias registradas" />
      ) : (
        <KanbanBoard<Incidencia>
          columns={INCIDENCIA_COLUMNS}
          items={incidents}
          getColumnKey={(inc) => inc.estado}
          onMove={isAdmin ? handleMove : undefined}
          renderCard={(inc) => (
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 flex-1">{inc.titulo}</p>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${PRIORIDAD_DOT[inc.prioridad]}`} title={inc.prioridad} />
              </div>
              {inc.descripcion && <p className="text-xs text-slate-500 line-clamp-2">{inc.descripcion}</p>}
              <p className="text-[11px] text-slate-500 truncate">{projectName(inc.proyectoId)}</p>
              {isAdmin && clienteName(inc.clienteId) && (
                <p className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded-full truncate max-w-full">
                  <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{clienteName(inc.clienteId)}</span>
                </p>
              )}
              <p className="text-[10px] text-slate-400">
                {new Date(inc.fechaCreacion).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex items-center gap-2.5">
                  <Badge value={inc.prioridad} />
                  {(commentCountById[inc.id] > 0 || archivoCountById[inc.id] > 0) && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      {commentCountById[inc.id] > 0 && (
                        <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{commentCountById[inc.id]}</span>
                      )}
                      {archivoCountById[inc.id] > 0 && (
                        <span className="flex items-center gap-0.5"><Paperclip className="w-3 h-3" />{archivoCountById[inc.id]}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setDetailId(inc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Ver detalles">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {isAdmin && (
                    <button onClick={() => handleDelete(inc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        />
      )}

      <IncidenciaDetailModal
        incidenciaId={detailId}
        incidencia={selected}
        isAdmin={isAdmin}
        onClose={() => setDetailId(null)}
        onNotifySuccess={success}
        onNotifyError={toastError}
        extraHeader={selected && (
          <>
            <span className="text-xs text-slate-400">{projectName(selected.proyectoId)}</span>
            {isAdmin && clienteName(selected.clienteId) && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded-full">
                <Building2 className="w-3 h-3 text-slate-400" />
                {clienteName(selected.clienteId)}
              </span>
            )}
          </>
        )}
      />
    </div>
  );
}
