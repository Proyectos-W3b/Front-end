import { useEffect, useState, FormEvent } from 'react';
import { MessageSquare, Paperclip, Trash2, ExternalLink, Send, Eye } from 'lucide-react';
import incidentsService from '../../services/incidents.service';
import projectsService from '../../services/projects.service';
import clientesService from '../../services/clientes.service';
import comentariosService from '../../services/comentarios.service';
import archivosIncidenciaService, { CreateArchivoIncidenciaData } from '../../services/archivos-incidencia.service';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import KanbanBoard, { type KanbanColumn } from '../../components/ui/KanbanBoard';
import { FullPageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/auth.store';
import type {
  Incidencia, Project, Cliente,
  ComentarioIncidencia, ArchivoIncidencia,
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
  const [detailTab,      setDetailTab]      = useState<'comentarios' | 'archivos'>('comentarios');

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
    } finally { setLoading(false); }
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
      const [c, a] = await Promise.all([
        comentariosService.getByIncidencia(inc.id),
        archivosIncidenciaService.getByIncidencia(inc.id),
      ]);
      setComentarios(c);
      setArchivos(a);
    } finally { setLoadingDetail(false); }
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta incidencia?')) return;
    await incidentsService.remove(id); load(filterProject || undefined);
  };

  const handleMove = async (incidenciaId: string, newEstado: string) => {
    const inc = incidents.find((i) => i.id === incidenciaId);
    if (!inc || inc.estado === newEstado) return;
    setIncidents((prev) =>
      prev.map((i) => i.id === incidenciaId ? { ...i, estado: newEstado as any } : i),
    );
    try {
      await incidentsService.update(incidenciaId, { estado: newEstado as any });
    } catch {
      setIncidents((prev) =>
        prev.map((i) => i.id === incidenciaId ? { ...i, estado: inc.estado } : i),
      );
    }
  };

  const sendComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !newComment.trim()) return;
    setSendingComment(true);
    try {
      await comentariosService.create({ incidenciaId: selected.id, contenido: newComment.trim() });
      setNewComment('');
      setComentarios(await comentariosService.getByIncidencia(selected.id));
    } finally { setSendingComment(false); }
  };

  const deleteComment = async (id: string) => {
    if (!selected) return;
    await comentariosService.remove(id);
    setComentarios(await comentariosService.getByIncidencia(selected.id));
  };

  const saveArc = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSavingArc(true);
    try {
      await archivosIncidenciaService.create({ ...arcForm, incidenciaId: selected.id });
      setArcForm({ ...EMPTY_ARC, incidenciaId: selected.id });
      setArchivos(await archivosIncidenciaService.getByIncidencia(selected.id));
    } finally { setSavingArc(false); }
  };

  const deleteArc = async (id: string) => {
    if (!selected) return;
    await archivosIncidenciaService.remove(id);
    setArchivos(await archivosIncidenciaService.getByIncidencia(selected.id));
  };

  const projectName  = (id: string) =>
    projects.find((p) => p.id === id)?.nombre ?? id.slice(0, 8) + '…';

  const clienteName = (proyectoId: string) => {
    const cid = projects.find((p) => p.id === proyectoId)?.clienteId;
    return cid ? (clientes.find((c) => c.id === cid)?.empresa ?? null) : null;
  };

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
            <div className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 flex-1">
                  {inc.titulo}
                </p>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${PRIORIDAD_DOT[inc.prioridad]}`} title={inc.prioridad} />
              </div>
              <p className="text-[11px] text-slate-500 truncate">{projectName(inc.proyectoId)}</p>
              {isAdmin && clienteName(inc.proyectoId) && (
                <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                  {clienteName(inc.proyectoId)}
                </p>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <Badge value={inc.prioridad} />
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
            <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-100">
              <Badge value={selected.estado} />
              <Badge value={selected.prioridad} />
              <span className="text-xs text-slate-400">{projectName(selected.proyectoId)}</span>
            </div>
            {selected.descripcion && (
              <p className="text-sm text-slate-600">{selected.descripcion}</p>
            )}
            <div className="flex gap-1 border-b border-slate-100">
              {(['comentarios', 'archivos'] as const).map((tab) => (
                <button key={tab} onClick={() => setDetailTab(tab)}
                  className={[
                    'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                    detailTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800',
                  ].join(' ')}
                >
                  {tab === 'comentarios'
                    ? <><MessageSquare className="w-3.5 h-3.5" /> Comentarios {comentarios.length > 0 && `(${comentarios.length})`}</>
                    : <><Paperclip className="w-3.5 h-3.5" /> Archivos {archivos.length > 0 && `(${archivos.length})`}</>
                  }
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
                      <div className="flex gap-2">
                        <input className="input flex-1 text-sm" placeholder="URL del archivo (https://…)"
                          value={arcForm.url} onChange={(e) => setArcForm({ ...arcForm, url: e.target.value })} required />
                        <button type="submit" disabled={savingArc}
                          className="btn-primary px-3 py-2 text-sm shrink-0">
                          {savingArc ? 'Guardando…' : 'Adjuntar'}
                        </button>
                      </div>
                    </form>
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
