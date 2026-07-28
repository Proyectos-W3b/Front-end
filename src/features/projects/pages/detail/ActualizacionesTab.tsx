import { FormEvent, useState } from 'react';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import Modal from '../../../../components/ui/Modal';
import ProgressBar from '../../../../components/ui/ProgressBar';
import PercentageSlider from '../../../../components/ui/PercentageSlider';
import { useToast } from '../../../../components/ui/Toast';
import { CreateActualizacionData, UpdateActualizacionData } from '../../services/actualizaciones.service';
import type { ActualizacionProyecto } from '../../../../types';
import { useActualizaciones } from './hooks/useActualizaciones';

const EMPTY_ACT = (proyectoId: string): CreateActualizacionData => ({
  proyectoId, titulo: '', descripcion: '', porcentajeAvance: 0,
});

export default function ActualizacionesTab({ projectId, isAdmin }: { projectId: string; isAdmin: boolean }) {
  const { success } = useToast();
  const { data: actualizaciones, create, update, remove } = useActualizaciones(projectId);

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<ActualizacionProyecto | null>(null);
  const [form, setForm] = useState<CreateActualizacionData>(EMPTY_ACT(projectId));
  const [error, setError] = useState('');

  const close = () => { setModal(null); setSelected(null); setError(''); };
  const openCreate = () => { setForm(EMPTY_ACT(projectId)); setError(''); setModal('create'); };
  const openEdit = (a: ActualizacionProyecto) => {
    setSelected(a);
    setForm({ proyectoId: a.proyectoId, titulo: a.titulo, descripcion: a.descripcion, porcentajeAvance: a.porcentajeAvance });
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
        success('Actualización registrada', `Avance del proyecto: ${form.porcentajeAvance}%.`);
      } else if (selected) {
        const { proyectoId: _, ...rest } = form;
        await update.mutateAsync({ id: selected.id, data: rest as UpdateActualizacionData });
        success('Actualización guardada');
      }
      close();
    } catch (err: any) { setError(err?.message ?? 'Error al guardar actualización'); }
  };

  const onDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta actualización?')) return;
    await remove.mutateAsync(id);
    success('Actualización eliminada');
  };

  const ordenadas = [...actualizaciones].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Actualizaciones del proyecto</h3>
        {isAdmin && (
          <button className="btn-primary btn-sm flex items-center gap-1.5" onClick={openCreate}>
            <Plus className="w-3.5 h-3.5" /> Nueva actualización
          </button>
        )}
      </div>

      {ordenadas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center">
          <p className="text-sm text-slate-400">No hay actualizaciones registradas</p>
        </div>
      ) : (
        <div>
          {ordenadas.map((a, idx) => (
            <div key={a.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className={`w-3 h-3 rounded-full shrink-0 mt-2 ring-4 ring-white ${idx === 0 ? 'bg-blue-500' : 'bg-slate-300'}`} />
                {idx < ordenadas.length - 1 && <span className="w-px flex-1 bg-slate-200 my-0.5" />}
              </div>
              <div className="flex-1 pb-4 min-w-0">
                <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_6px_rgba(15,23,42,0.04)] p-5">
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{a.titulo}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(a.fecha).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-2xl font-bold tabular-nums text-blue-600">{a.porcentajeAvance}%</span>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(a)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => onDelete(a.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {a.descripcion && <p className="text-xs text-slate-500 mb-3">{a.descripcion}</p>}
                  <ProgressBar value={a.porcentajeAvance} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal === 'create' || modal === 'edit'} onClose={close}
        title={modal === 'create' ? 'Nueva actualización' : 'Editar actualización'}
        description="Registra un avance del proyecto para que el cliente lo vea reflejado.">
        <form onSubmit={save} className="space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="label">Título *</label>
              <input className="input" placeholder="Ej: Avance de diseño" value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
            </div>
            <div>
              <label className="label">Descripción *</label>
              <textarea className="input resize-none" rows={3} placeholder="Cuéntale al cliente qué se hizo…"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <PercentageSlider value={form.porcentajeAvance} onChange={(v) => setForm({ ...form, porcentajeAvance: v })} />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" className="btn-secondary" onClick={close}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
