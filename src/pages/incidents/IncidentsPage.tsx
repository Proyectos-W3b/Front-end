import { useEffect, useState, FormEvent } from 'react';
import { MessageSquare, Paperclip, Trash2, ExternalLink, Send, Eye, Building2, Users } from 'lucide-react';
import incidentsService from '../../services/incidents.service';
import projectsService from '../../services/projects.service';
import clientesService from '../../services/clientes.service';
import comentariosService from '../../services/comentarios.service';
import archivosIncidenciaService, { CreateArchivoIncidenciaData } from '../../services/archivos-incidencia.service';
import { uploadsApi, asignacionesIncidenciaApi, usuariosApi } from '../../services/api.service';
import { inferirTipoArchivo } from '../../lib/fileType';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import KanbanBoard, { type KanbanColumn } from '../../components/ui/KanbanBoard';
import { FullPageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/auth.store';
import type {
  Incidencia, Project, Cliente,
  ComentarioIncidencia, ArchivoIncidencia, AsignacionIncidencia, User,
} from '../../types';

const EMPTY_ARC: CreateArchivoIncidenciaData = {
  incidenciaId: '', nombre: '', url: '', tipo: 'documento',
};

const INCIDENCIA_COLUMNS: KanbanColumn[] = [
  {
    key: 'abierta', label: 'Abierta',
    headerClass: 'bg-red-50 border-red-100',
    dotClass:    'bg-red-500',
    labelClass:  'text-red-700',
    accentClass: 'border-l-red-400',
  },
  {
    key: 'en_proceso', label: 'En proceso',
    headerClass: 'bg-amber-50 border-amber-100',
    dotClass:    'bg-amber-500',
    labelClass:  'text-amber-700',
    accentClass: 'border-l-amber-400',
  },
  {
    key: 'resuelta', label: 'Resuelta',
    headerClass: 'bg-blue-50 border-blue-100',
    dotClass:    'bg-blue-500',
    labelClass:  'text-blue-700',
    accentClass: 'border-l-blue-400',
  },
  {
    key: 'cerrada', label: 'Cerrada',
    headerClass: 'bg-slate-50 border-slate-200',
    dotClass:    'bg-slate-400',
    labelClass:  'text-slate-600',
    accentClass: 'border-l-slate-300',
  },
];

const PRIORIDAD_DOT: Record<string, string> = {
  baja:    'bg-slate-300',
  media:   'bg-amber-400',
  alta:    'bg-orange-500',
  critica: 'bg-red-600',
};

export default function IncidentsPage() {
  const user    = useAuthStore((s) => s.user);
  const isAdmin = user?.rol === 'admin';
  const { success, error: toastError } = useToast();

  const [incidents, setIncidents] = useState<Incidencia[]>([]);
  const [projects,  setProjects]  = useState<Project[]>([]);
  const [clientes,  setClientes]  = useState<Cliente[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filterProject, setFilter] = useState('');
  const [modal, setModal]         = useState<'detail' | null>(null);
  const [selected, setSelected]   = useState<Incidencia | null>(null);

  const [comentarios,    setComentarios]    = useState<ComentarioIncidencia[]>([]);
  const [archivos,       setArchivos]       = useState<ArchivoIncidencia[]>([]);
  const [loadingDetail,  setLoadingDetail]  = useState(false);
  const [newComment,     setNewComment]     = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [arcForm,        setArcForm]        = useState<CreateArchivoIncidenciaData>(EMPTY_ARC);
  const [savingArc,      setSavingArc]      = useState(false);
  const [subiendoArc,    setSubiendoArc]    = useState(false);
  const [detailTab,      setDetailTab]      = useState<'comentarios' | 'archivos' | 'asignados'>('comentarios');
  const [asignados,      setAsignados]      = useState<AsignacionIncidencia[]>([]);
  const [trabajadores,   setTrabajadores]   = useState<User[]>([]);
  const [asignandoTrabajadorId, setAsignandoTrabajadorId] = useState('');
  const [asignando,      setAsignando]      = useState(false);

  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [archivoCounts, setArchivoCounts] = useState<Record<string, number>>({});

  const load = async (proyectoId?: string) => {
    setLoading(true);
    try {
      const [i, p, c] = await Promise.all([
        incidentsService.getAll(proyectoId || undefined),
        projectsService.getAll(),
        isAdmin ? clientesService.getAll() : Promise.resolve([]),
      ]);
      setIncidents(i);
      setProjects(p);
      setClientes(c);
      loadCounts(i);
    } finally { setLoading(false); }
  };

  const loadCounts = async (list: Incidencia[]) => {
    try {
      const results = await Promise.all(
        list.map(async (inc) => {
          const [c, a] = await Promise.all([
            comentariosService.getByIncidencia(inc.id),
            archivosIncidenciaService.getByIncidencia(inc.id),
          ]);
          return { id: inc.id, comentarios: c.length, archivos: a.length };
        }),
      );
      setCommentCounts(Object.fromEntries(results.map((r) => [r.id, r.comentarios])));
      setArchivoCounts(Object.fromEntries(results.map((r) => [r.id, r.archivos])));
    } catch {
      // conteos son informativos; si fallan no bloquean la vista
    }
  };

  useEffect(() => { load(); }, []);

  const handleFilter = (pid: string) => { setFilter(pid); load(pid || undefined); };

  const openDetail = async (inc: Incidencia) => {
    setSelected(inc);
    setNewComment('');
    setArcForm({ ...EMPTY_ARC, incidenciaId: inc.id });
    setDetailTab('comentarios');
    setModal('detail');
    setLoadingDetail(true);
    try {
      const [c, a, asig] = await Promise.all([
        comentariosService.getByIncidencia(inc.id),
        archivosIncidenciaService.getByIncidencia(inc.id),
        asignacionesIncidenciaApi.getByIncidencia(inc.id),
      ]);
      setComentarios(c);
      setArchivos(a);
      setAsignados(asig);
      if (trabajadores.length === 0) {
        const usuarios = await usuariosApi.getAll();
        setTrabajadores(usuarios.filter((u) => u.rol === 'trabajador'));
      }
    } finally { setLoadingDetail(false); }
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const asignarTrabajador = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !asignandoTrabajadorId) return;
    setAsignando(true);
    try {
      await asignacionesIncidenciaApi.create(selected.id, asignandoTrabajadorId);
      setAsignandoTrabajadorId('');
      setAsignados(await asignacionesIncidenciaApi.getByIncidencia(selected.id));
      success('Trabajador asignado', 'Ya puede ver esta incidencia en su bandeja.');
    } catch { toastError('No se pudo asignar el trabajador'); }
    finally { setAsignando(false); }
  };

  const quitarTrabajador = async (asignacionId: string) => {
    if (!selected) return;
    await asignacionesIncidenciaApi.remove(asignacionId);
    setAsignados(await asignacionesIncidenciaApi.getByIncidencia(selected.id));
    success('Asignación removida');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta incidencia?')) return;
    await incidentsService.remove(id); load(filterProject || undefined);
    success('Incidencia eliminada');
  };

  const handleMove = async (incidenciaId: string, newEstado: string) => {
    const inc = incidents.find((i) => i.id === incidenciaId);
    if (!inc || inc.estado === newEstado) return;
    setIncidents((prev) =>
      prev.map((i) => i.id === incidenciaId ? { ...i, estado: newEstado as any } : i),
    );
    try {
      await incidentsService.update(incidenciaId, { estado: newEstado as any });
      success('Estado actualizado', `"${inc.titulo}" pasó a ${newEstado.replace('_', ' ')}.`);
    } catch {
      setIncidents((prev) =>
        prev.map((i) => i.id === incidenciaId ? { ...i, estado: inc.estado } : i),
      );
      toastError('No se pudo cambiar el estado');
    }
  };

  const sendComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !newComment.trim()) return;
    setSendingComment(true);
    try {
      await comentariosService.create({ incidenciaId: selected.id, contenido: newComment.trim() });
      setNewComment('');
      const fresh = await comentariosService.getByIncidencia(selected.id);
      setComentarios(fresh);
      setCommentCounts((prev) => ({ ...prev, [selected.id]: fresh.length }));
    } finally { setSendingComment(false); }
  };

  const deleteComment = async (id: string) => {
    if (!selected) return;
    await comentariosService.remove(id);
    const fresh = await comentariosService.getByIncidencia(selected.id);
    setComentarios(fresh);
    setCommentCounts((prev) => ({ ...prev, [selected.id]: fresh.length }));
  };

  const saveArc = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSavingArc(true);
    try {
      await archivosIncidenciaService.create({ ...arcForm, incidenciaId: selected.id });
      setArcForm({ ...EMPTY_ARC, incidenciaId: selected.id });
      const fresh = await archivosIncidenciaService.getByIncidencia(selected.id);
      setArchivos(fresh);
      setArchivoCounts((prev) => ({ ...prev, [selected.id]: fresh.length }));
      success('Archivo adjuntado');
    } catch { toastError('No se pudo adjuntar el archivo'); }
    finally { setSavingArc(false); }
  };
  const handleArcFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoArc(true);
    try {
      const objectPath = await uploadsApi.subirArchivo(file, 'incidencias');
      setArcForm((f) => ({ ...f, url: objectPath, nombre: f.nombre || file.name, tipo: inferirTipoArchivo(file) }));
    } finally {
      setSubiendoArc(false);
    }
  };

  const deleteArc = async (id: string) => {
    if (!selected) return;
    await archivosIncidenciaService.remove(id);
    const fresh = await archivosIncidenciaService.getByIncidencia(selected.id);
    setArchivos(fresh);
    setArchivoCounts((prev) => ({ ...prev, [selected.id]: fresh.length }));
  };

  const projectName  = (id: string) =>
    projects.find((p) => p.id === id)?.nombre ?? 'Proyecto eliminado';

  const clienteName = (clienteId: string) =>
    clientes.find((c) => c.id === clienteId)?.empresa ?? null;

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Incidencias</h2>
          <p className="text-sm text-slate-500">{incidents.length} registro{incidents.length !== 1 ? 's' : ''}</p>
        </div>
        <select className="input w-52" value={filterProject} onChange={(e) => handleFilter(e.target.value)}>
          <option value="">Todos los proyectos</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>

      {/* Kanban */}
      {incidents.length === 0 ? (
        <EmptyState
          title="Sin incidencias"
          description="No hay incidencias registradas"
        />
      ) : (
        <KanbanBoard<Incidencia>
          columns={INCIDENCIA_COLUMNS}
          items={incidents}
          getColumnKey={(inc) => inc.estado}
          onMove={isAdmin ? handleMove : undefined}
          renderCard={(inc) => (
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 flex-1">
                  {inc.titulo}
                </p>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${PRIORIDAD_DOT[inc.prioridad]}`} title={inc.prioridad} />
              </div>
              {inc.descripcion && (
                <p className="text-xs text-slate-500 line-clamp-2">{inc.descripcion}</p>
              )}
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
                  {(commentCounts[inc.id] > 0 || archivoCounts[inc.id] > 0) && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      {commentCounts[inc.id] > 0 && (
                        <span className="flex items-center gap-0.5">
                          <MessageSquare className="w-3 h-3" />{commentCounts[inc.id]}
                        </span>
                      )}
                      {archivoCounts[inc.id] > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Paperclip className="w-3 h-3" />{archivoCounts[inc.id]}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openDetail(inc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(inc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        />
      )}

      {/* ── Modal detalle: comentarios + archivos ── */}
      <Modal open={modal === 'detail'} onClose={closeModal} title={selected?.titulo ?? ''} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100">
              <Badge value={selected.estado} />
              <Badge value={selected.prioridad} />
              <span className="text-xs text-slate-400">{projectName(selected.proyectoId)}</span>
              {isAdmin && clienteName(selected.clienteId) && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded-full">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  {clienteName(selected.clienteId)}
                </span>
              )}
            </div>
            {selected.descripcion && (
              <p className="text-sm text-slate-600">{selected.descripcion}</p>
            )}
            <div className="flex gap-1 border-b border-slate-100">
              {(['comentarios', 'archivos', 'asignados'] as const).map((tab) => (
                <button key={tab} onClick={() => setDetailTab(tab)}
                  className={[
                    'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                    detailTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800',
                  ].join(' ')}
                >
                  {tab === 'comentarios' && <><MessageSquare className="w-3.5 h-3.5" /> Comentarios {comentarios.length > 0 && `(${comentarios.length})`}</>}
                  {tab === 'archivos'    && <><Paperclip className="w-3.5 h-3.5" /> Archivos {archivos.length > 0 && `(${archivos.length})`}</>}
                  {tab === 'asignados'   && <><Users className="w-3.5 h-3.5" /> Asignados {asignados.length > 0 && `(${asignados.length})`}</>}
                </button>
              ))}
            </div>

            {loadingDetail ? (
              <p className="text-sm text-slate-400 text-center py-6">Cargando…</p>
            ) : (
              <>
                {detailTab === 'comentarios' && (
                  <div className="space-y-3">
                    {comentarios.length === 0
                      ? <p className="text-sm text-slate-400 text-center py-4">Sin comentarios aún</p>
                      : (
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {comentarios.map((c) => (
                            <div key={c.id} className="bg-slate-50 rounded-lg px-3 py-2.5 flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-800 break-words">{c.contenido}</p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {new Date(c.fechaCreacion).toLocaleString('es')}
                                </p>
                              </div>
                              {isAdmin && (
                                <button onClick={() => deleteComment(c.id)}
                                  className="p-1 rounded text-slate-300 hover:text-red-500 transition-colors shrink-0">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    }
                    <form onSubmit={sendComment} className="flex gap-2 pt-1">
                      <input className="input flex-1 text-sm" placeholder="Escribe un comentario…"
                        value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                      <button type="submit" disabled={sendingComment || !newComment.trim()}
                        className="btn-primary px-3 py-2 flex items-center gap-1.5 text-sm">
                        <Send className="w-3.5 h-3.5" />
                        {sendingComment ? 'Enviando…' : 'Enviar'}
                      </button>
                    </form>
                  </div>
                )}

                {detailTab === 'archivos' && (
                  <div className="space-y-3">
                    {archivos.length === 0
                      ? <p className="text-sm text-slate-400 text-center py-4">Sin archivos adjuntos</p>
                      : (
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                          {archivos.map((a) => (
                            <div key={a.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="text-sm text-slate-800 truncate">{a.nombre}</span>
                                <span className="text-[10px] text-slate-400 shrink-0">{a.tipo}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <a href={a.url} target="_blank" rel="noopener noreferrer"
                                  className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                {isAdmin && (
                                  <button onClick={() => deleteArc(a.id)}
                                    className="p-1 rounded text-slate-300 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    <form onSubmit={saveArc} className="space-y-2 pt-1 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Adjuntar archivo</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input className="input text-sm" placeholder="Nombre del archivo"
                          value={arcForm.nombre} onChange={(e) => setArcForm({ ...arcForm, nombre: e.target.value })} required />
                        <select className="input text-sm" value={arcForm.tipo}
                          onChange={(e) => setArcForm({ ...arcForm, tipo: e.target.value })}>
                          <option value="documento">Documento</option>
                          <option value="imagen">Imagen</option>
                          <option value="video">Video</option>
                          <option value="hoja_calculo">Hoja de cálculo</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input type="file" className="input flex-1 text-sm" onChange={handleArcFile} disabled={subiendoArc} />
                        <button type="submit" disabled={savingArc || subiendoArc || !arcForm.url}
                          className="btn-primary px-3 py-2 text-sm shrink-0">
                          {subiendoArc ? 'Subiendo…' : savingArc ? 'Guardando…' : 'Adjuntar'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {detailTab === 'asignados' && (
                  <div className="space-y-3">
                    {asignados.length === 0
                      ? <p className="text-sm text-slate-400 text-center py-4">Nadie asignado a esta incidencia</p>
                      : (
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                          {asignados.map((a) => (
                            <div key={a.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {a.trabajador?.fotoUrl ? (
                                  <img src={a.trabajador.fotoUrl} alt={a.trabajador.nombre} className="w-6 h-6 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                    {(a.trabajador?.nombre?.[0] ?? '?').toUpperCase()}
                                  </div>
                                )}
                                <span className="text-sm text-slate-800 truncate">{a.trabajador?.nombre ?? 'Trabajador'}</span>
                              </div>
                              {isAdmin && (
                                <button onClick={() => quitarTrabajador(a.id)}
                                  className="p-1 rounded text-slate-300 hover:text-red-500 transition-colors shrink-0">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    }
                    {isAdmin && (
                      <form onSubmit={asignarTrabajador} className="flex gap-2 pt-1 border-t border-slate-100">
                        <select className="input flex-1 text-sm" value={asignandoTrabajadorId}
                          onChange={(e) => setAsignandoTrabajadorId(e.target.value)} required>
                          <option value="">Seleccionar trabajador…</option>
                          {trabajadores
                            .filter((t) => !asignados.some((a) => a.trabajadorId === t.id))
                            .map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                        <button type="submit" disabled={asignando || !asignandoTrabajadorId}
                          className="btn-primary px-3 py-2 text-sm shrink-0">
                          {asignando ? 'Asignando…' : 'Asignar'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
