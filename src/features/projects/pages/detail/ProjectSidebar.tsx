import { FormEvent, useState } from 'react';
import { AlertTriangle, CalendarDays, CircleCheck, Clock, ListChecks, Pencil, Tag, Flag } from 'lucide-react';
import Badge from '../../../../components/ui/Badge';
import Modal from '../../../../components/ui/Modal';
import ProgressRing from '../../../../components/ui/ProgressRing';
import Sparkline from '../../../../components/ui/Sparkline';
import StatCard from '../../../../components/ui/StatCard';
import MetaChip from '../../../../components/ui/MetaChip';
import { useToast } from '../../../../components/ui/Toast';
import type { ActualizacionProyecto, Fase, Incidencia, Project } from '../../../../types';
import { useProject } from './hooks/useProject';

export default function ProjectSidebar({
  project, isAdmin, incidents, actualizaciones, fases,
}: {
  project: Project;
  isAdmin: boolean;
  incidents: Incidencia[];
  actualizaciones: ActualizacionProyecto[];
  fases: Fase[];
}) {
  const { success } = useToast();
  const { update } = useProject(project.id);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nombre: project.nombre, descripcion: project.descripcion ?? '', estado: project.estado });
  const [error, setError] = useState('');

  const openEdit = () => {
    setForm({ nombre: project.nombre, descripcion: project.descripcion ?? '', estado: project.estado });
    setError('');
    setOpen(true);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (form.nombre.trim().length < 3) { setError('El nombre debe tener al menos 3 caracteres'); return; }
    setError('');
    try {
      await update.mutateAsync(form);
      setOpen(false);
      success('Proyecto actualizado', 'Los cambios fueron guardados.');
    } catch (err: any) { setError(err?.message ?? 'Error al guardar'); }
  };

  const ordenadas = [...actualizaciones].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  const ultima = ordenadas[0];
  const progreso = ultima?.porcentajeAvance ?? 0;

  const incidenciasAbiertas = incidents.filter((i) => i.estado === 'abierta' || i.estado === 'en_proceso').length;
  const incidenciasResueltas = incidents.filter((i) => i.estado === 'resuelta' || i.estado === 'cerrada').length;

  let plazo: { label: string; urgent: boolean } | null = null;
  if (project.fechaFin) {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const fin = new Date(project.fechaFin); fin.setHours(0, 0, 0, 0);
    const dias = Math.round((fin.getTime() - hoy.getTime()) / 86400000);
    if (dias > 0) plazo = { label: `${dias} día${dias !== 1 ? 's' : ''} restante${dias !== 1 ? 's' : ''}`, urgent: dias <= 7 };
    else if (dias === 0) plazo = { label: 'Vence hoy', urgent: true };
    else plazo = { label: `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`, urgent: true };
  }

  return (
    <aside className="space-y-3 order-1 xl:order-2 xl:sticky xl:top-20">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">{project.nombre}</h2>
            <div className="mt-1.5"><Badge value={project.estado} /></div>
          </div>
          <ProgressRing value={progreso} size={72} strokeWidth={7} />
        </div>

        {project.descripcion && (
          <p className="text-xs text-slate-500 leading-relaxed">{project.descripcion}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <MetaChip icon={CalendarDays} label="Inicio" value={new Date(project.fechaInicio).toLocaleDateString('es')} />
          {project.fechaFin && (
            <MetaChip icon={Flag} label="Fin" value={new Date(project.fechaFin).toLocaleDateString('es')} />
          )}
          <MetaChip icon={Tag} label="Tipo" value={project.tipo} />
        </div>

        {actualizaciones.length >= 2 && (
          <div className="pt-3 border-t border-slate-50">
            <p className="text-[11px] font-medium text-slate-400 mb-1">Tendencia de avance</p>
            <Sparkline data={actualizaciones} />
          </div>
        )}

        {ultima && (
          <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-50">
            Última actualización: {new Date(ultima.fecha).toLocaleDateString('es', { day: 'numeric', month: 'long' })}
            {' — '}{ultima.titulo}
          </p>
        )}

        {isAdmin && (
          <button className="btn-secondary btn-sm w-full flex items-center justify-center gap-1.5" onClick={openEdit}>
            <Pencil className="w-3 h-3" /> Editar proyecto
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={AlertTriangle} label="Inc. abiertas" value={incidenciasAbiertas}
          accent={incidenciasAbiertas > 0 ? 'orange' : 'slate'} />
        <StatCard icon={CircleCheck} label="Resueltas" value={incidenciasResueltas}
          accent={incidenciasResueltas > 0 ? 'emerald' : 'slate'} />
        <StatCard icon={ListChecks} label="Fases"
          value={`${fases.filter((f) => f.estado === 'completado').length}/${fases.length}`}
          accent="blue" />
        <StatCard icon={Clock} label="Plazo" value={plazo?.label ?? 'Sin fecha'}
          accent={plazo?.urgent ? 'red' : 'slate'} />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Editar proyecto"
        description="Actualiza la información visible del proyecto.">
        <form onSubmit={save} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input className="input" value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="input" value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea className="input resize-none" rows={3} value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={update.isPending}>
              {update.isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </aside>
  );
}
