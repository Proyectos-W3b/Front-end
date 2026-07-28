import { FormEvent, useState } from 'react';
import { ExternalLink, Paperclip, Plus, Trash2 } from 'lucide-react';
import DataTable from '../../../../components/ui/DataTable';
import Modal from '../../../../components/ui/Modal';
import { useToast } from '../../../../components/ui/Toast';
import { inferirTipoArchivo } from '../../../../lib/fileType';
import { uploadsApi } from '../../../../services/api.service';
import { CreateArchivoProyectoData } from '../../services/archivos-proyecto.service';
import type { ArchivoProyecto } from '../../../../types';
import { useArchivosProyecto } from './hooks/useArchivosProyecto';

const EMPTY_ARC = (proyectoId: string): CreateArchivoProyectoData => ({
  proyectoId, nombre: '', url: '', tipo: 'documento',
});

export default function ArchivosTab({ projectId, isAdmin, active }: { projectId: string; isAdmin: boolean; active: boolean }) {
  const { success } = useToast();
  const { data: archivos, create, remove } = useArchivosProyecto(projectId, active);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateArchivoProyectoData>(EMPTY_ARC(projectId));
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');

  const close = () => setOpen(false);
  const openCreate = () => { setForm(EMPTY_ARC(projectId)); setError(''); setOpen(true); };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await create.mutateAsync(form);
      close();
      success('Archivo agregado', `"${form.nombre}" quedó disponible en el proyecto.`);
    } catch (err: any) { setError(err?.message ?? 'Error al guardar archivo'); }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    try {
      const objectPath = await uploadsApi.subirArchivo(file, 'proyectos');
      setForm((f) => ({ ...f, url: objectPath, nombre: f.nombre || file.name, tipo: inferirTipoArchivo(file) }));
    } finally {
      setSubiendo(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('¿Eliminar este archivo?')) return;
    await remove.mutateAsync(id);
    success('Archivo eliminado');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Archivos del proyecto</h3>
        {isAdmin && (
          <button className="btn-primary btn-sm flex items-center gap-1.5" onClick={openCreate}>
            <Plus className="w-3.5 h-3.5" /> Agregar archivo
          </button>
        )}
      </div>
      <DataTable<ArchivoProyecto>
        columns={[
          {
            key: 'nombre', header: 'Nombre',
            render: (arc) => (
              <div className="flex items-center gap-2.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-800">{arc.nombre}</span>
              </div>
            ),
          },
          { key: 'tipo', header: 'Tipo', render: (arc) => <span className="text-slate-500 text-xs">{arc.tipo}</span> },
          {
            key: 'fecha', header: 'Fecha',
            render: (arc) => <span className="text-slate-400 text-xs">{new Date(arc.fecha).toLocaleDateString('es')}</span>,
          },
          {
            key: 'acciones', header: 'Acciones', className: 'text-right',
            render: (arc) => (
              <div className="flex items-center justify-end gap-1">
                <a href={arc.url} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Abrir enlace">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                {isAdmin && (
                  <button onClick={() => onDelete(arc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Eliminar">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ),
          },
        ]}
        data={archivos}
        emptyText="No hay archivos adjuntos"
      />

      <Modal open={open} onClose={close} title="Agregar archivo">
        <form onSubmit={save} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div>
            <label className="label">Nombre *</label>
            <input className="input" placeholder="Ej: Contrato firmado" value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div>
            <label className="label">Archivo *</label>
            <input type="file" className="input" onChange={handleFile} disabled={subiendo} />
            {subiendo && <p className="text-xs text-slate-400 mt-1">Subiendo…</p>}
            {form.url && !subiendo && <p className="text-xs text-emerald-600 mt-1">Archivo listo ✓</p>}
          </div>
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as CreateArchivoProyectoData['tipo'] })}>
              <option value="documento">Documento</option>
              <option value="imagen">Imagen</option>
              <option value="video">Video</option>
              <option value="hoja_calculo">Hoja de cálculo</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={close}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={create.isPending || subiendo || !form.url}>
              {create.isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
