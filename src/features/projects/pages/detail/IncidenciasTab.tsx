import { FormEvent, useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import Badge from '../../../../components/ui/Badge';
import Modal from '../../../../components/ui/Modal';
import KanbanBoard, { type KanbanColumn } from '../../../../components/ui/KanbanBoard';
import { useToast } from '../../../../components/ui/Toast';
import { CreateIncidenciaData } from '../../../incidents/services/incidents.service';
import type { EstadoIncidencia, Incidencia, Prioridad } from '../../../../types';
import { useIncidencias } from './hooks/useIncidencias';
import IncidenciaDetailModal from '../../../../components/incidencias/IncidenciaDetailModal';

const EMPTY_INC = (proyectoId: string): CreateIncidenciaData => ({
  titulo: '', descripcion: '', proyectoId, prioridad: 'media', estado: 'abierta',
});

const INCIDENT_COLUMNS: KanbanColumn[] = [
  { key: 'abierta',    label: 'Abierta',     headerClass: 'bg-orange-50 border-orange-100',  dotClass: 'bg-orange-500',  labelClass: 'text-orange-700',  accentClass: 'border-l-orange-400' },
  { key: 'en_proceso', label: 'En proceso',  headerClass: 'bg-amber-50 border-amber-100',    dotClass: 'bg-amber-400',   labelClass: 'text-amber-700',   accentClass: 'border-l-amber-400'  },
  { key: 'resuelta',   label: 'Resuelta',    headerClass: 'bg-emerald-50 border-emerald-100',dotClass: 'bg-emerald-500', labelClass: 'text-emerald-700', accentClass: 'border-l-emerald-400'},
  { key: 'cerrada',    label: 'Cerrada',     headerClass: 'bg-slate-50 border-slate-200',    dotClass: 'bg-slate-400',   labelClass: 'text-slate-600',   accentClass: 'border-l-slate-300'  },
];

export default function IncidenciasTab({ projectId, isAdmin }: { projectId: string; isAdmin: boolean }) {
  const { success, error: toastError } = useToast();
  const { data: incidents, create, update, remove } = useIncidencias(projectId);

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Incidencia | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateIncidenciaData>(EMPTY_INC(projectId));
  const [error, setError] = useState('');

  const close = () => { setModal(null); setSelected(null); setError(''); };
  const openCreate = () => { setForm(EMPTY_INC(projectId)); setError(''); setModal('create'); };
  const openEdit = (inc: Incidencia) => {
    setSelected(inc);
    setForm({ titulo: inc.titulo, descripcion: inc.descripcion ?? '', proyectoId: inc.proyectoId, prioridad: inc.prioridad, estado: inc.estado });
    setError('');
    setModal('edit');
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (form.titulo.trim().length < 3) { setError('El título debe tener al menos 3 caracteres'); return; }
    setError('');
    try {
      if (modal === 'create') {
        await create.mutateAsync(form);
        success('Incidencia creada', `"${form.titulo}" fue registrada en el proyecto.`);
      } else if (selected) {
        await update.mutateAsync({ id: selected.id, data: form });
        success('Incidencia actualizada');
      }
      close();
    } catch (err: any) { setError(err?.message ?? 'Error al guardar incidencia'); }
  };

  const onDelete = async (incId: string) => {
    if (!confirm('¿Eliminar esta incidencia?')) return;
    await remove.mutateAsync(incId);
    success('Incidencia eliminada');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Incidencias del proyecto</h3>
        <button className="btn-primary btn-sm flex items-center gap-1.5" onClick={openCreate}>
          <Plus className="w-3.5 h-3.5" /> Nueva incidencia
        </button>
      </div>

      {incidents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center">
          <p className="text-sm text-slate-400">No hay incidencias para este proyecto</p>
        </div>
      ) : (
        <KanbanBoard<Incidencia>
          columns={INCIDENT_COLUMNS}
          items={incidents}
          getColumnKey={(inc) => inc.estado}
          renderCard={(inc) => (
            <div className="p-4">
              <p className="text-sm font-semibold text-slate-800 leading-snug mb-2.5">{inc.titulo}</p>
              {inc.descripcion && (
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{inc.descripcion}</p>
              )}
              <div className="flex items-center justify-between mb-3">
                <Badge value={inc.prioridad} />
                <span className="text-[10px] text-slate-400">
                  {new Date(inc.fechaCreacion).toLocaleDateString('es')}
                </span>
              </div>
              <div className="flex gap-1 pt-2.5 border-t border-slate-50">
                <button onClick={() => setDetailId(inc.id)}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                  <Eye className="w-3 h-3" /> Ver detalles
                </button>
                {isAdmin && (
                  <>
                    <button onClick={() => openEdit(inc)}
                      className="text-[11px] font-medium text-slate-500 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                      Editar
                    </button>
                    <button onClick={() => onDelete(inc.id)}
                      className="text-[11px] font-medium text-slate-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        />
      )}

      <Modal open={modal === 'create' || modal === 'edit'} onClose={close}
        title={modal === 'create' ? 'Nueva incidencia' : 'Editar incidencia'}>
        <form onSubmit={save} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div>
            <label className="label">Título *</label>
            <input className="input" value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea className="input resize-none" rows={3} value={form.descripcion ?? ''}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prioridad</label>
              <select className="input" value={form.prioridad}
                onChange={(e) => setForm({ ...form, prioridad: e.target.value as Prioridad })}>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="input" value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoIncidencia })}>
                <option value="abierta">Abierta</option>
                <option value="en_proceso">En proceso</option>
                <option value="resuelta">Resuelta</option>
                <option value="cerrada">Cerrada</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={close}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <IncidenciaDetailModal
        incidenciaId={detailId}
        incidencia={incidents.find((i) => i.id === detailId) ?? null}
        isAdmin={isAdmin}
        onClose={() => setDetailId(null)}
        onNotifyError={toastError}
        onNotifySuccess={success}
      />
    </div>
  );
}
