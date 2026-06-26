import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, RefreshCw, Paperclip, Trash2, ExternalLink, Plus } from 'lucide-react';
import projectsService from '../../services/projects.service';
import incidentsService, { CreateIncidenciaData } from '../../services/incidents.service';
import actualizacionesService, { CreateActualizacionData, UpdateActualizacionData } from '../../services/actualizaciones.service';
import archivosProyectoService, { CreateArchivoProyectoData } from '../../services/archivos-proyecto.service';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import KanbanBoard, { type KanbanColumn } from '../../components/ui/KanbanBoard';
import { FullPageSpinner } from '../../components/ui/Spinner';
import type {
  Project, Incidencia, EstadoProyecto, Prioridad, EstadoIncidencia,
  ActualizacionProyecto, ArchivoProyecto,
} from '../../types';

type Tab = 'incidencias' | 'actualizaciones' | 'archivos';

const EMPTY_INC: CreateIncidenciaData = {
  titulo: '', descripcion: '', proyectoId: '', prioridad: 'media', estado: 'abierta',
};
const EMPTY_ACT: CreateActualizacionData = {
  proyectoId: '', titulo: '', descripcion: '', porcentajeAvance: 0,
};
const EMPTY_ARC: CreateArchivoProyectoData = {
  proyectoId: '', nombre: '', url: '', tipo: 'documento',
};

const INCIDENT_COLUMNS: KanbanColumn[] = [
  { key: 'abierta',    label: 'Abierta',     headerClass: 'bg-orange-50 border-orange-100',  dotClass: 'bg-orange-500',  labelClass: 'text-orange-700',  accentClass: 'border-l-orange-400' },
  { key: 'en_proceso', label: 'En proceso',  headerClass: 'bg-amber-50 border-amber-100',    dotClass: 'bg-amber-400',   labelClass: 'text-amber-700',   accentClass: 'border-l-amber-400'  },
  { key: 'resuelta',   label: 'Resuelta',    headerClass: 'bg-emerald-50 border-emerald-100',dotClass: 'bg-emerald-500', labelClass: 'text-emerald-700', accentClass: 'border-l-emerald-400'},
  { key: 'cerrada',    label: 'Cerrada',     headerClass: 'bg-slate-50 border-slate-200',    dotClass: 'bg-slate-400',   labelClass: 'text-slate-600',   accentClass: 'border-l-slate-300'  },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project,       setProject]       = useState<Project | null>(null);
  const [incidents,     setIncidents]     = useState<Incidencia[]>([]);
  const [actualizaciones, setActualizaciones] = useState<ActualizacionProyecto[]>([]);
  const [archivos,      setArchivos]      = useState<ArchivoProyecto[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [tab,           setTab]           = useState<Tab>('incidencias');
  const [tabLoaded,     setTabLoaded]     = useState<Set<Tab>>(new Set(['incidencias']));

  const [modal,       setModal]       = useState<'editProject' | 'createInc' | 'editInc' | 'createAct' | 'editAct' | 'createArc' | null>(null);
  const [selectedInc, setSelectedInc] = useState<Incidencia | null>(null);
  const [selectedAct, setSelectedAct] = useState<ActualizacionProyecto | null>(null);
  const [projForm, setProjForm] = useState({ nombre: '', descripcion: '', estado: 'activo' as EstadoProyecto });
  const [incForm,  setIncForm]  = useState<CreateIncidenciaData>(EMPTY_INC);
  const [actForm,  setActForm]  = useState<CreateActualizacionData>(EMPTY_ACT);
  const [arcForm,  setArcForm]  = useState<CreateArchivoProyectoData>(EMPTY_ARC);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const loadProject = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [p, i] = await Promise.all([
        projectsService.getOne(id),
        incidentsService.getAll(id),
      ]);
      setProject(p);
      setIncidents(i);
      setProjForm({ nombre: p.nombre, descripcion: p.descripcion ?? '', estado: p.estado });
    } finally {
      setLoading(false);
    }
  };

  const loadActualizaciones = async () => {
    if (!id) return;
    setActualizaciones(await actualizacionesService.getByProyecto(id));
  };

  const loadArchivos = async () => {
    if (!id) return;
    setArchivos(await archivosProyectoService.getByProyecto(id));
  };

  useEffect(() => { loadProject(); }, [id]);

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (!tabLoaded.has(t)) {
      setTabLoaded((prev) => new Set(prev).add(t));
      if (t === 'actualizaciones') loadActualizaciones();
      if (t === 'archivos')        loadArchivos();
    }
  };

  const closeModal = () => { setModal(null); setSelectedInc(null); setSelectedAct(null); setError(''); };

  /* ── Incident handlers ── */
  const openCreateInc = () => { setIncForm({ ...EMPTY_INC, proyectoId: id! }); setError(''); setModal('createInc'); };
  const openEditInc   = (inc: Incidencia) => {
    setSelectedInc(inc);
    setIncForm({ titulo: inc.titulo, descripcion: inc.descripcion ?? '', proyectoId: inc.proyectoId, prioridad: inc.prioridad, estado: inc.estado });
    setError('');
    setModal('editInc');
  };
  const saveIncident = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (modal === 'createInc') await incidentsService.create(incForm);
      else if (selectedInc)       await incidentsService.update(selectedInc.id, incForm);
      closeModal(); loadProject();
    } catch (err: any) { setError(err?.message ?? 'Error al guardar incidencia'); }
    finally { setSaving(false); }
  };
  const deleteInc = async (incId: string) => {
    if (!confirm('¿Eliminar esta incidencia?')) return;
    await incidentsService.remove(incId); loadProject();
  };

  /* ── Actualizacion handlers ── */
  const openCreateAct = () => { setActForm({ ...EMPTY_ACT, proyectoId: id! }); setError(''); setModal('createAct'); };
  const openEditAct   = (a: ActualizacionProyecto) => {
    setSelectedAct(a);
    setActForm({ proyectoId: a.proyectoId, titulo: a.titulo, descripcion: a.descripcion, porcentajeAvance: a.porcentajeAvance });
    setError('');
    setModal('editAct');
  };
  const saveAct = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (modal === 'createAct') await actualizacionesService.create(actForm);
      else if (selectedAct) {
        const { proyectoId: _, ...rest } = actForm;
        await actualizacionesService.update(selectedAct.id, rest as UpdateActualizacionData);
      }
      closeModal(); loadActualizaciones();
    } catch (err: any) { setError(err?.message ?? 'Error al guardar actualización'); }
    finally { setSaving(false); }
  };
  const deleteAct = async (actId: string) => {
    if (!confirm('¿Eliminar esta actualización?')) return;
    await actualizacionesService.remove(actId); loadActualizaciones();
  };

  /* ── Archivo handlers ── */
  const openCreateArc = () => { setArcForm({ ...EMPTY_ARC, proyectoId: id! }); setError(''); setModal('createArc'); };
  const saveArc = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await archivosProyectoService.create(arcForm);
      closeModal(); loadArchivos();
    } catch (err: any) { setError(err?.message ?? 'Error al guardar archivo'); }
    finally { setSaving(false); }
  };
  const deleteArc = async (arcId: string) => {
    if (!confirm('¿Eliminar este archivo?')) return;
    await archivosProyectoService.remove(arcId); loadArchivos();
  };

  /* ── Project edit ── */
  const saveProject = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await projectsService.update(id!, projForm); closeModal(); loadProject(); }
    catch (err: any) { setError(err?.message ?? 'Error al guardar'); }
    finally { setSaving(false); }
  };

  if (loading) return <FullPageSpinner />;
  if (!project) return <p className="text-center text-slate-500 py-16">Proyecto no encontrado</p>;

  const TABS: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: 'incidencias',    label: `Incidencias (${incidents.length})`,            icon: FileText  },
    { key: 'actualizaciones',label: `Actualizaciones (${actualizaciones.length})`,  icon: RefreshCw },
    { key: 'archivos',       label: `Archivos (${archivos.length})`,                icon: Paperclip },
  ];

  return (
    <div className="space-y-5">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/projects" className="hover:text-blue-600 transition-colors">Proyectos</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-medium">{project.nombre}</span>
      </nav>

      {/* Card proyecto */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{project.nombre}</h2>
              <Badge value={project.estado} />
            </div>
            {project.descripcion && (
              <p className="text-sm text-slate-500 max-w-2xl">{project.descripcion}</p>
            )}
            <p className="text-xs text-slate-400">
              Creado: {new Date(project.fecha).toLocaleDateString('es')} ·{' '}
              Actualizado: {new Date(project.actualizado).toLocaleDateString('es')}
            </p>
          </div>
          <button className="btn-secondary btn-sm" onClick={() => { setError(''); setModal('editProject'); }}>
            Editar proyecto
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-100">
        <nav className="flex gap-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={[
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px',
                tab === key
                  ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50',
              ].join(' ')}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab: Incidencias ── */}
      {tab === 'incidencias' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Incidencias del proyecto</h3>
            <button className="btn-primary btn-sm flex items-center gap-1.5" onClick={openCreateInc}>
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
                      {new Date(inc.createdAt).toLocaleDateString('es')}
                    </span>
                  </div>
                  <div className="flex gap-1 pt-2.5 border-t border-slate-50">
                    <button onClick={() => openEditInc(inc)}
                      className="text-[11px] font-medium text-slate-500 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                      Editar
                    </button>
                    <button onClick={() => deleteInc(inc.id)}
                      className="text-[11px] font-medium text-slate-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      )}

      {/* ── Tab: Actualizaciones ── */}
      {tab === 'actualizaciones' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Actualizaciones del proyecto</h3>
            <button className="btn-primary btn-sm flex items-center gap-1.5" onClick={openCreateAct}>
              <Plus className="w-3.5 h-3.5" /> Nueva actualización
            </button>
          </div>
          {actualizaciones.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center">
              <p className="text-sm text-slate-400">No hay actualizaciones registradas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {actualizaciones.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_6px_rgba(15,23,42,0.04)] p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{a.titulo}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(a.fecha).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold tabular-nums text-blue-600">{a.porcentajeAvance}%</span>
                      <div className="flex gap-1">
                        <button onClick={() => openEditAct(a)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteAct(a.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {a.descripcion && <p className="text-xs text-slate-500 mb-3">{a.descripcion}</p>}
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(a.porcentajeAvance, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Archivos ── */}
      {tab === 'archivos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Archivos del proyecto</h3>
            <button className="btn-primary btn-sm flex items-center gap-1.5" onClick={openCreateArc}>
              <Plus className="w-3.5 h-3.5" /> Agregar archivo
            </button>
          </div>
          {archivos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center">
              <p className="text-sm text-slate-400">No hay archivos adjuntos</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="table-th">Nombre</th>
                    <th className="table-th">Tipo</th>
                    <th className="table-th">Fecha</th>
                    <th className="table-th text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {archivos.map((arc) => (
                    <tr key={arc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-800">{arc.nombre}</span>
                        </div>
                      </td>
                      <td className="table-td text-slate-500 text-xs">{arc.tipo}</td>
                      <td className="table-td text-slate-400 text-xs">
                        {new Date(arc.fecha).toLocaleDateString('es')}
                      </td>
                      <td className="table-td">
                        <div className="flex items-center justify-end gap-1">
                          <a href={arc.url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Abrir enlace">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button onClick={() => deleteArc(arc.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Eliminar">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Modal: Editar proyecto ── */}
      <Modal open={modal === 'editProject'} onClose={closeModal} title="Editar proyecto">
        <form onSubmit={saveProject} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div>
            <label className="label">Nombre *</label>
            <input className="input" value={projForm.nombre}
              onChange={(e) => setProjForm({ ...projForm, nombre: e.target.value })} required />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea className="input resize-none" rows={3} value={projForm.descripcion}
              onChange={(e) => setProjForm({ ...projForm, descripcion: e.target.value })} />
          </div>
          <div>
            <label className="label">Estado</label>
            <select className="input" value={projForm.estado}
              onChange={(e) => setProjForm({ ...projForm, estado: e.target.value as EstadoProyecto })}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="completado">Completado</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Incidencia ── */}
      <Modal open={modal === 'createInc' || modal === 'editInc'} onClose={closeModal}
        title={modal === 'createInc' ? 'Nueva incidencia' : 'Editar incidencia'}>
        <form onSubmit={saveIncident} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div>
            <label className="label">Título *</label>
            <input className="input" value={incForm.titulo}
              onChange={(e) => setIncForm({ ...incForm, titulo: e.target.value })} required />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea className="input resize-none" rows={3} value={incForm.descripcion ?? ''}
              onChange={(e) => setIncForm({ ...incForm, descripcion: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prioridad</label>
              <select className="input" value={incForm.prioridad}
                onChange={(e) => setIncForm({ ...incForm, prioridad: e.target.value as Prioridad })}>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="input" value={incForm.estado}
                onChange={(e) => setIncForm({ ...incForm, estado: e.target.value as EstadoIncidencia })}>
                <option value="abierta">Abierta</option>
                <option value="en_proceso">En proceso</option>
                <option value="resuelta">Resuelta</option>
                <option value="cerrada">Cerrada</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Actualización ── */}
      <Modal open={modal === 'createAct' || modal === 'editAct'} onClose={closeModal}
        title={modal === 'createAct' ? 'Nueva actualización' : 'Editar actualización'}>
        <form onSubmit={saveAct} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div>
            <label className="label">Título *</label>
            <input className="input" value={actForm.titulo}
              onChange={(e) => setActForm({ ...actForm, titulo: e.target.value })} required />
          </div>
          <div>
            <label className="label">Descripción *</label>
            <textarea className="input resize-none" rows={3} value={actForm.descripcion}
              onChange={(e) => setActForm({ ...actForm, descripcion: e.target.value })} required />
          </div>
          <div>
            <label className="label">Porcentaje de avance: {actForm.porcentajeAvance}%</label>
            <input type="range" min={0} max={100} className="w-full accent-blue-600" value={actForm.porcentajeAvance}
              onChange={(e) => setActForm({ ...actForm, porcentajeAvance: Number(e.target.value) })} />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>0%</span><span>100%</span></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Archivo ── */}
      <Modal open={modal === 'createArc'} onClose={closeModal} title="Agregar archivo">
        <form onSubmit={saveArc} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div>
            <label className="label">Nombre *</label>
            <input className="input" placeholder="Ej: Contrato firmado" value={arcForm.nombre}
              onChange={(e) => setArcForm({ ...arcForm, nombre: e.target.value })} required />
          </div>
          <div>
            <label className="label">URL / Enlace *</label>
            <input className="input" placeholder="https://..." value={arcForm.url}
              onChange={(e) => setArcForm({ ...arcForm, url: e.target.value })} required />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={arcForm.tipo}
              onChange={(e) => setArcForm({ ...arcForm, tipo: e.target.value })}>
              <option value="documento">Documento</option>
              <option value="imagen">Imagen</option>
              <option value="video">Video</option>
              <option value="hoja_calculo">Hoja de cálculo</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
