import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, RefreshCw, Paperclip, Trash2, ExternalLink, Plus, Eye, MessageSquare, Send, Clock, AlertTriangle, CircleCheck, ListChecks, Users, Pencil, CalendarDays, Tag, Flag } from 'lucide-react';
import projectsService from '../../services/projects.service';
import incidentsService, { CreateIncidenciaData } from '../../services/incidents.service';
import actualizacionesService, { CreateActualizacionData, UpdateActualizacionData } from '../../services/actualizaciones.service';
import archivosProyectoService, { CreateArchivoProyectoData } from '../../services/archivos-proyecto.service';
import comentariosService from '../../services/comentarios.service';
import archivosIncidenciaService, { CreateArchivoIncidenciaData } from '../../services/archivos-incidencia.service';
import fasesService from '../../services/fases.service';
import { uploadsApi, asignacionesTrabajadorApi, asignacionesIncidenciaApi, usuariosApi } from '../../services/api.service';
import { inferirTipoArchivo } from '../../lib/fileType';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import KanbanBoard, { type KanbanColumn } from '../../components/ui/KanbanBoard';
import { FullPageSpinner } from '../../components/ui/Spinner';
import ProgressBar from '../../components/ui/ProgressBar';
import Sparkline from '../../components/ui/Sparkline';
import PhaseTracker from '../../components/ui/PhaseTracker';
import PercentageSlider from '../../components/ui/PercentageSlider';
import StatCard from '../../components/ui/StatCard';
import ProgressRing from '../../components/ui/ProgressRing';
import MetaChip from '../../components/ui/MetaChip';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/auth.store';
import { extractIdMatcher } from '../../lib/slug';
import type {
  Project, Incidencia, Prioridad, EstadoIncidencia,
  ActualizacionProyecto, ArchivoProyecto, Fase, EstadoFase,
  ComentarioIncidencia, ArchivoIncidencia, AsignacionTrabajador, AsignacionIncidencia, User,
} from '../../types';

type Tab = 'fases' | 'incidencias' | 'actualizaciones' | 'archivos' | 'equipo';
type DetailTab = 'comentarios' | 'archivos' | 'asignados';

const EMPTY_INC: CreateIncidenciaData = {
  titulo: '', descripcion: '', proyectoId: '', prioridad: 'media', estado: 'abierta',
};
const EMPTY_ACT: CreateActualizacionData = {
  proyectoId: '', titulo: '', descripcion: '', porcentajeAvance: 0,
};
const EMPTY_ARC: CreateArchivoProyectoData = {
  proyectoId: '', nombre: '', url: '', tipo: 'documento',
};
const EMPTY_INC_ARC: CreateArchivoIncidenciaData = {
  incidenciaId: '', nombre: '', url: '', tipo: 'documento',
};

const INCIDENT_COLUMNS: KanbanColumn[] = [
  { key: 'abierta',    label: 'Abierta',     headerClass: 'bg-orange-50 border-orange-100',  dotClass: 'bg-orange-500',  labelClass: 'text-orange-700',  accentClass: 'border-l-orange-400' },
  { key: 'en_proceso', label: 'En proceso',  headerClass: 'bg-amber-50 border-amber-100',    dotClass: 'bg-amber-400',   labelClass: 'text-amber-700',   accentClass: 'border-l-amber-400'  },
  { key: 'resuelta',   label: 'Resuelta',    headerClass: 'bg-emerald-50 border-emerald-100',dotClass: 'bg-emerald-500', labelClass: 'text-emerald-700', accentClass: 'border-l-emerald-400'},
  { key: 'cerrada',    label: 'Cerrada',     headerClass: 'bg-slate-50 border-slate-200',    dotClass: 'bg-slate-400',   labelClass: 'text-slate-600',   accentClass: 'border-l-slate-300'  },
];

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [id,     setId]     = useState<string | null>(null);
  const user    = useAuthStore((s) => s.user);
  const isAdmin = user?.rol === 'admin';
  const { success, error: toastError } = useToast();
  const [project,       setProject]       = useState<Project | null>(null);
  const [incidents,     setIncidents]     = useState<Incidencia[]>([]);
  const [actualizaciones, setActualizaciones] = useState<ActualizacionProyecto[]>([]);
  const [archivos,      setArchivos]      = useState<ArchivoProyecto[]>([]);
  const [fases,         setFases]         = useState<Fase[]>([]);
  const [equipo,        setEquipo]        = useState<AsignacionTrabajador[]>([]);
  const [trabajadores,  setTrabajadores]  = useState<User[]>([]);
  const [asignandoTrabajadorId, setAsignandoTrabajadorId] = useState('');
  const [asignando,     setAsignando]     = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [tab,           setTab]           = useState<Tab>('fases');
  const [tabLoaded,     setTabLoaded]     = useState<Set<Tab>>(new Set(['fases', 'incidencias', 'actualizaciones']));

  const [modal,       setModal]       = useState<'editProject' | 'createInc' | 'editInc' | 'incDetail' | 'createAct' | 'editAct' | 'createArc' | 'createFase' | null>(null);
  const [selectedInc, setSelectedInc] = useState<Incidencia | null>(null);
  const [selectedAct, setSelectedAct] = useState<ActualizacionProyecto | null>(null);
  const [projForm, setProjForm] = useState({ nombre: '', descripcion: '', estado: 'activo' });
  const [incForm,  setIncForm]  = useState<CreateIncidenciaData>(EMPTY_INC);
  const [actForm,  setActForm]  = useState<CreateActualizacionData>(EMPTY_ACT);
  const [arcForm,  setArcForm]  = useState<CreateArchivoProyectoData>(EMPTY_ARC);
  const [subiendoArc, setSubiendoArc] = useState(false);
  const [faseNombre, setFaseNombre] = useState('');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  /* ── Incident detail (comentarios / archivos) ── */
  const [comentarios,    setComentarios]    = useState<ComentarioIncidencia[]>([]);
  const [incArchivos,    setIncArchivos]    = useState<ArchivoIncidencia[]>([]);
  const [incAsignados,   setIncAsignados]   = useState<AsignacionIncidencia[]>([]);
  const [asignandoIncTrabajadorId, setAsignandoIncTrabajadorId] = useState('');
  const [asignandoInc,   setAsignandoInc]   = useState(false);
  const [loadingDetail,  setLoadingDetail]  = useState(false);
  const [detailTab,      setDetailTab]      = useState<DetailTab>('comentarios');
  const [newComment,     setNewComment]     = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [incArcForm,     setIncArcForm]     = useState<CreateArchivoIncidenciaData>(EMPTY_INC_ARC);
  const [savingIncArc,   setSavingIncArc]   = useState(false);
  const [subiendoIncArc, setSubiendoIncArc] = useState(false);

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
    loadActualizaciones();
    loadFases();
  };

  const loadActualizaciones = async () => {
    if (!id) return;
    try {
      setActualizaciones(await actualizacionesService.getByProyecto(id));
    } catch {
      setActualizaciones([]);
    }
  };

  const loadFases = async () => {
    if (!id) return;
    try {
      setFases(await fasesService.getByProyecto(id));
    } catch {
      setFases([]);
    }
  };

  const loadArchivos = async () => {
    if (!id) return;
    setArchivos(await archivosProyectoService.getByProyecto(id));
  };

  const loadEquipo = async () => {
    if (!id) return;
    setEquipo(await asignacionesTrabajadorApi.getByProyecto(id));
  };

  const loadTrabajadores = async () => {
    if (trabajadores.length > 0) return;
    const usuarios = await usuariosApi.getAll();
    setTrabajadores(usuarios.filter((u) => u.rol === 'trabajador'));
  };

  useEffect(() => {
    if (!slug) return;
    const matcher = extractIdMatcher(slug);
    (async () => {
      setLoading(true);
      try {
        const all = await projectsService.getAll();
        const match = all.find((p) => p.id === matcher || p.id.startsWith(matcher));
        setId(match?.id ?? null);
        if (!match) setLoading(false);
      } catch {
        setId(null);
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => { if (id) loadProject(); }, [id]);

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (!tabLoaded.has(t)) {
      setTabLoaded((prev) => new Set(prev).add(t));
      if (t === 'actualizaciones') loadActualizaciones();
      if (t === 'archivos')        loadArchivos();
      if (t === 'equipo')          { loadEquipo(); loadTrabajadores(); }
    }
  };

  const asignarTrabajador = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !asignandoTrabajadorId) return;
    setAsignando(true);
    try {
      await asignacionesTrabajadorApi.create(id, asignandoTrabajadorId);
      setAsignandoTrabajadorId('');
      await loadEquipo();
      success('Trabajador asignado al equipo', 'Ya puede ver este proyecto en su bandeja.');
    } catch (err: any) { toastError('No se pudo asignar', err?.message); }
    finally { setAsignando(false); }
  };

  const quitarTrabajador = async (asignacionId: string) => {
    await asignacionesTrabajadorApi.remove(asignacionId);
    loadEquipo();
    success('Trabajador removido del equipo');
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
    e.preventDefault();
    if (incForm.titulo.trim().length < 3) { setError('El título debe tener al menos 3 caracteres'); return; }
    setSaving(true); setError('');
    try {
      if (modal === 'createInc') {
        await incidentsService.create(incForm);
        success('Incidencia creada', `"${incForm.titulo}" fue registrada en el proyecto.`);
      } else if (selectedInc) {
        await incidentsService.update(selectedInc.id, incForm);
        success('Incidencia actualizada');
      }
      closeModal(); loadProject();
    } catch (err: any) { setError(err?.message ?? 'Error al guardar incidencia'); }
    finally { setSaving(false); }
  };
  const deleteInc = async (incId: string) => {
    if (!confirm('¿Eliminar esta incidencia?')) return;
    await incidentsService.remove(incId); loadProject();
    success('Incidencia eliminada');
  };

  /* ── Incident detail: comentarios / archivos ── */
  const openIncDetail = async (inc: Incidencia) => {
    setSelectedInc(inc);
    setNewComment('');
    setIncArcForm({ ...EMPTY_INC_ARC, incidenciaId: inc.id });
    setDetailTab('comentarios');
    setModal('incDetail');
    setLoadingDetail(true);
    try {
      const [c, a, asig] = await Promise.all([
        comentariosService.getByIncidencia(inc.id),
        archivosIncidenciaService.getByIncidencia(inc.id),
        asignacionesIncidenciaApi.getByIncidencia(inc.id),
      ]);
      setComentarios(c);
      setIncArchivos(a);
      setIncAsignados(asig);
      loadTrabajadores();
    } finally { setLoadingDetail(false); }
  };

  const asignarIncTrabajador = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedInc || !asignandoIncTrabajadorId) return;
    setAsignandoInc(true);
    try {
      await asignacionesIncidenciaApi.create(selectedInc.id, asignandoIncTrabajadorId);
      setAsignandoIncTrabajadorId('');
      setIncAsignados(await asignacionesIncidenciaApi.getByIncidencia(selectedInc.id));
      success('Trabajador asignado', 'Ya puede ver esta incidencia en su bandeja.');
    } catch { toastError('No se pudo asignar el trabajador'); }
    finally { setAsignandoInc(false); }
  };

  const quitarIncTrabajador = async (asignacionId: string) => {
    if (!selectedInc) return;
    await asignacionesIncidenciaApi.remove(asignacionId);
    setIncAsignados(await asignacionesIncidenciaApi.getByIncidencia(selectedInc.id));
    success('Asignación removida');
  };
  const sendComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedInc || !newComment.trim()) return;
    setSendingComment(true);
    try {
      await comentariosService.create({ incidenciaId: selectedInc.id, contenido: newComment.trim() });
      setNewComment('');
      setComentarios(await comentariosService.getByIncidencia(selectedInc.id));
    } finally { setSendingComment(false); }
  };
  const deleteComment = async (commentId: string) => {
    if (!selectedInc) return;
    await comentariosService.remove(commentId);
    setComentarios(await comentariosService.getByIncidencia(selectedInc.id));
  };
  const saveIncArc = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedInc) return;
    setSavingIncArc(true);
    try {
      await archivosIncidenciaService.create({ ...incArcForm, incidenciaId: selectedInc.id });
      setIncArcForm({ ...EMPTY_INC_ARC, incidenciaId: selectedInc.id });
      setIncArchivos(await archivosIncidenciaService.getByIncidencia(selectedInc.id));
      success('Archivo adjuntado', 'El archivo quedó vinculado a la incidencia.');
    } catch { toastError('No se pudo adjuntar el archivo'); }
    finally { setSavingIncArc(false); }
  };
  const deleteIncArc = async (arcId: string) => {
    if (!selectedInc) return;
    await archivosIncidenciaService.remove(arcId);
    setIncArchivos(await archivosIncidenciaService.getByIncidencia(selectedInc.id));
  };
  const handleIncArcFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoIncArc(true);
    try {
      const objectPath = await uploadsApi.subirArchivo(file, 'incidencias');
      setIncArcForm((f) => ({ ...f, url: objectPath, nombre: f.nombre || file.name, tipo: inferirTipoArchivo(file) }));
    } finally {
      setSubiendoIncArc(false);
    }
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
    e.preventDefault();
    if (actForm.titulo.trim().length < 3) { setError('El título debe tener al menos 3 caracteres'); return; }
    setSaving(true); setError('');
    try {
      if (modal === 'createAct') {
        await actualizacionesService.create(actForm);
        success('Actualización registrada', `Avance del proyecto: ${actForm.porcentajeAvance}%.`);
      } else if (selectedAct) {
        const { proyectoId: _, ...rest } = actForm;
        await actualizacionesService.update(selectedAct.id, rest as UpdateActualizacionData);
        success('Actualización guardada');
      }
      closeModal(); loadActualizaciones();
    } catch (err: any) { setError(err?.message ?? 'Error al guardar actualización'); }
    finally { setSaving(false); }
  };
  const deleteAct = async (actId: string) => {
    if (!confirm('¿Eliminar esta actualización?')) return;
    await actualizacionesService.remove(actId); loadActualizaciones();
    success('Actualización eliminada');
  };

  /* ── Archivo handlers ── */
  const openCreateArc = () => { setArcForm({ ...EMPTY_ARC, proyectoId: id! }); setError(''); setModal('createArc'); };
  const saveArc = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await archivosProyectoService.create(arcForm);
      closeModal(); loadArchivos();
      success('Archivo agregado', `"${arcForm.nombre}" quedó disponible en el proyecto.`);
    } catch (err: any) { setError(err?.message ?? 'Error al guardar archivo'); }
    finally { setSaving(false); }
  };
  const handleArcFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoArc(true);
    try {
      const objectPath = await uploadsApi.subirArchivo(file, 'proyectos');
      setArcForm((f) => ({ ...f, url: objectPath, nombre: f.nombre || file.name, tipo: inferirTipoArchivo(file) }));
    } finally {
      setSubiendoArc(false);
    }
  };
  const deleteArc = async (arcId: string) => {
    if (!confirm('¿Eliminar este archivo?')) return;
    await archivosProyectoService.remove(arcId); loadArchivos();
    success('Archivo eliminado');
  };

  /* ── Fase handlers ── */
  const openCreateFase = () => { setFaseNombre(''); setError(''); setModal('createFase'); };
  const saveFase = async (e: FormEvent) => {
    e.preventDefault();
    if (!faseNombre.trim()) return;
    setSaving(true); setError('');
    try {
      const created = await fasesService.create({ proyectoId: id!, nombre: faseNombre.trim() });
      setFases((prev) => [...prev, created]);
      closeModal();
      success('Fase creada', `"${created.nombre}" se agregó al flujo del proyecto.`);
    } catch (err: any) { setError(err?.message ?? 'Error al crear fase'); }
    finally { setSaving(false); }
  };
  const NEXT_ESTADO_FASE: Record<EstadoFase, EstadoFase> = {
    pendiente: 'en_progreso', en_progreso: 'completado', completado: 'pendiente',
  };
  const cycleFaseEstado = async (fase: Fase) => {
    const next = NEXT_ESTADO_FASE[fase.estado];
    setFases((prev) => prev.map((f) => (f.id === fase.id ? { ...f, estado: next } : f)));
    try { await fasesService.setEstado(fase.id, next); } catch { loadFases(); }
  };
  const renameFase = async (fase: Fase, nombre: string) => {
    setFases((prev) => prev.map((f) => (f.id === fase.id ? { ...f, nombre } : f)));
    try { await fasesService.rename(fase.id, nombre); } catch { loadFases(); }
  };
  const deleteFase = async (fase: Fase) => {
    if (!confirm('¿Eliminar esta fase?')) return;
    setFases((prev) => prev.filter((f) => f.id !== fase.id));
    try { await fasesService.remove(fase.id); } catch { loadFases(); }
  };
  const reorderFases = async (orderedIds: string[]) => {
    const items = orderedIds.map((faseId, idx) => ({ id: faseId, orden: idx }));
    try { await fasesService.reorder(items); } catch { loadFases(); }
  };

  /* ── Project edit ── */
  const saveProject = async (e: FormEvent) => {
    e.preventDefault();
    if (projForm.nombre.trim().length < 3) { setError('El nombre debe tener al menos 3 caracteres'); return; }
    setSaving(true);
    try {
      await projectsService.update(id!, projForm);
      closeModal(); loadProject();
      success('Proyecto actualizado', 'Los cambios fueron guardados.');
    }
    catch (err: any) { setError(err?.message ?? 'Error al guardar'); }
    finally { setSaving(false); }
  };

  if (loading) return <FullPageSpinner />;
  if (!project) return <p className="text-center text-slate-500 py-16">Proyecto no encontrado</p>;

  const TABS: { key: Tab; label: string; count: number; icon: typeof FileText }[] = [
    { key: 'fases',           label: 'Fases',           count: fases.length,           icon: ListChecks },
    { key: 'incidencias',     label: 'Incidencias',     count: incidents.length,       icon: FileText   },
    { key: 'actualizaciones', label: 'Actualizaciones', count: actualizaciones.length, icon: RefreshCw  },
    { key: 'archivos',        label: 'Archivos',        count: archivos.length,        icon: Paperclip  },
    { key: 'equipo',          label: 'Equipo',          count: equipo.length,          icon: Users      },
  ];

  const actualizacionesOrdenadas = [...actualizaciones].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
  );
  const ultimaActualizacion = actualizacionesOrdenadas[0];
  const progresoActual = ultimaActualizacion?.porcentajeAvance ?? 0;

  const incidenciasAbiertas   = incidents.filter((i) => i.estado === 'abierta' || i.estado === 'en_proceso').length;
  const incidenciasResueltas  = incidents.filter((i) => i.estado === 'resuelta' || i.estado === 'cerrada').length;

  let plazo: { label: string; urgent: boolean } | null = null;
  if (project.fechaFin) {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const fin = new Date(project.fechaFin); fin.setHours(0, 0, 0, 0);
    const dias = Math.round((fin.getTime() - hoy.getTime()) / 86400000);
    if (dias > 0)       plazo = { label: `${dias} día${dias !== 1 ? 's' : ''} restante${dias !== 1 ? 's' : ''}`, urgent: dias <= 7 };
    else if (dias === 0) plazo = { label: 'Vence hoy', urgent: true };
    else                 plazo = { label: `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`, urgent: true };
  }

  return (
    <div className="space-y-5">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/projects" className="hover:text-blue-600 transition-colors">Proyectos</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-medium">{project.nombre}</span>
      </nav>

      {/* Distribución: contenido principal a la izquierda, resumen del proyecto a la derecha */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">

      {/* ── Columna principal ── */}
      <div className="space-y-4 min-w-0 order-2 xl:order-1">

      {/* Tabs — control segmentado */}
      <nav className="flex w-fit flex-wrap items-center gap-1 bg-white border border-slate-100 rounded-xl p-1 shadow-[0_1px_4px_rgba(15,23,42,0.04)]">
        {TABS.map(({ key, label, count, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={[
                'flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all',
                active
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50',
              ].join(' ')}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {count > 0 && (
                <span className={[
                  'text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full leading-none',
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
                ].join(' ')}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Tab: Fases ── */}
      {tab === 'fases' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] p-5">
          <PhaseTracker
            fases={fases}
            editable={isAdmin}
            onCycleEstado={cycleFaseEstado}
            onRename={renameFase}
            onDelete={deleteFase}
            onReorder={reorderFases}
            onAddClick={openCreateFase}
          />
        </div>
      )}

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
                      {new Date(inc.fechaCreacion).toLocaleDateString('es')}
                    </span>
                  </div>
                  <div className="flex gap-1 pt-2.5 border-t border-slate-50">
                    <button onClick={() => openIncDetail(inc)}
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                      <Eye className="w-3 h-3" /> Ver detalles
                    </button>
                    {isAdmin && (
                      <>
                        <button onClick={() => openEditInc(inc)}
                          className="text-[11px] font-medium text-slate-500 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                          Editar
                        </button>
                        <button onClick={() => deleteInc(inc.id)}
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
        </div>
      )}

      {/* ── Tab: Actualizaciones ── */}
      {tab === 'actualizaciones' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Actualizaciones del proyecto</h3>
            {isAdmin && (
              <button className="btn-primary btn-sm flex items-center gap-1.5" onClick={openCreateAct}>
                <Plus className="w-3.5 h-3.5" /> Nueva actualización
              </button>
            )}
          </div>
          {actualizaciones.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center">
              <p className="text-sm text-slate-400">No hay actualizaciones registradas</p>
            </div>
          ) : (
            <div>
              {actualizacionesOrdenadas.map((a, idx) => (
                <div key={a.id} className="flex gap-4">
                  {/* Riel: punto + línea conectora */}
                  <div className="flex flex-col items-center">
                    <span className={`w-3 h-3 rounded-full shrink-0 mt-2 ring-4 ring-white ${idx === 0 ? 'bg-blue-500' : 'bg-slate-300'}`} />
                    {idx < actualizacionesOrdenadas.length - 1 && (
                      <span className="w-px flex-1 bg-slate-200 my-0.5" />
                    )}
                  </div>

                  {/* Tarjeta de la actualización */}
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
                              <button onClick={() => openEditAct(a)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteAct(a.id)}
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
        </div>
      )}

      {/* ── Tab: Archivos ── */}
      {tab === 'archivos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Archivos del proyecto</h3>
            {isAdmin && (
              <button className="btn-primary btn-sm flex items-center gap-1.5" onClick={openCreateArc}>
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
                      <button onClick={() => deleteArc(arc.id)}
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
        </div>
      )}

      {/* ── Tab: Equipo ── */}
      {tab === 'equipo' && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Equipo asignado</h3>

          {equipo.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-10 text-center">
              <Users className="w-7 h-7 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aún no hay trabajadores asignados a este proyecto</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {equipo.map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {a.trabajador?.fotoUrl ? (
                      <img src={a.trabajador.fotoUrl} alt={a.trabajador.nombre} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(a.trabajador?.nombre?.[0] ?? '?').toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-800 truncate">{a.trabajador?.nombre ?? 'Trabajador'}</span>
                  </div>
                  {isAdmin && (
                    <button onClick={() => quitarTrabajador(a.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      title="Quitar del proyecto">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {isAdmin && (
            <form onSubmit={asignarTrabajador} className="flex gap-2 pt-2 border-t border-slate-100">
              <select className="input flex-1 text-sm" value={asignandoTrabajadorId}
                onChange={(e) => setAsignandoTrabajadorId(e.target.value)} required>
                <option value="">Seleccionar trabajador…</option>
                {trabajadores
                  .filter((t) => !equipo.some((a) => a.trabajadorId === t.id))
                  .map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
              <button type="submit" disabled={asignando || !asignandoTrabajadorId} className="btn-primary btn-sm shrink-0">
                {asignando ? 'Asignando…' : 'Asignar'}
              </button>
            </form>
          )}
        </div>
      )}

      </div>{/* fin columna principal */}

      {/* ── Barra lateral: resumen del proyecto ── */}
      <aside className="space-y-3 order-1 xl:order-2 xl:sticky xl:top-20">

        {/* Card proyecto */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">{project.nombre}</h2>
              <div className="mt-1.5"><Badge value={project.estado} /></div>
            </div>
            <ProgressRing value={progresoActual} size={72} strokeWidth={7} />
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

          {ultimaActualizacion && (
            <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-50">
              Última actualización: {new Date(ultimaActualizacion.fecha).toLocaleDateString('es', { day: 'numeric', month: 'long' })}
              {' — '}{ultimaActualizacion.titulo}
            </p>
          )}

          {isAdmin && (
            <button
              className="btn-secondary btn-sm w-full flex items-center justify-center gap-1.5"
              onClick={() => { setError(''); setModal('editProject'); }}
            >
              <Pencil className="w-3 h-3" /> Editar proyecto
            </button>
          )}
        </div>

        {/* Indicadores */}
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
      </aside>

      </div>{/* fin grid */}

      {/* ── Modal: Nueva fase ── */}
      <Modal open={modal === 'createFase'} onClose={closeModal} title="Nueva fase"
        description="Agrega una etapa al flujo de este proyecto.">
        <form onSubmit={saveFase} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div>
            <label className="label">Nombre de la fase *</label>
            <input className="input" placeholder="Ej: Diseño, Desarrollo, QA…" value={faseNombre}
              onChange={(e) => setFaseNombre(e.target.value)} required autoFocus />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creando…' : 'Crear fase'}</button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Editar proyecto ── */}
      <Modal open={modal === 'editProject'} onClose={closeModal} title="Editar proyecto"
        description="Actualiza la información visible del proyecto.">
        <form onSubmit={saveProject} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input className="input" value={projForm.nombre}
                onChange={(e) => setProjForm({ ...projForm, nombre: e.target.value })} required />
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="input" value={projForm.estado}
                onChange={(e) => setProjForm({ ...projForm, estado: e.target.value })}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea className="input resize-none" rows={3} value={projForm.descripcion}
              onChange={(e) => setProjForm({ ...projForm, descripcion: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
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

      {/* ── Modal: Detalle incidencia (comentarios / archivos) ── */}
      <Modal open={modal === 'incDetail'} onClose={closeModal} title={selectedInc?.titulo ?? ''} size="lg">
        {selectedInc && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-100">
              <Badge value={selectedInc.estado} />
              <Badge value={selectedInc.prioridad} />
            </div>
            {selectedInc.descripcion && (
              <p className="text-sm text-slate-600">{selectedInc.descripcion}</p>
            )}
            <div className="flex gap-1 border-b border-slate-100">
              {(['comentarios', 'archivos', 'asignados'] as const).map((t) => (
                <button key={t} onClick={() => setDetailTab(t)}
                  className={[
                    'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                    detailTab === t
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800',
                  ].join(' ')}
                >
                  {t === 'comentarios' && <><MessageSquare className="w-3.5 h-3.5" /> Comentarios {comentarios.length > 0 && `(${comentarios.length})`}</>}
                  {t === 'archivos'    && <><Paperclip className="w-3.5 h-3.5" /> Archivos {incArchivos.length > 0 && `(${incArchivos.length})`}</>}
                  {t === 'asignados'   && <><Users className="w-3.5 h-3.5" /> Asignados {incAsignados.length > 0 && `(${incAsignados.length})`}</>}
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
                    {incArchivos.length === 0
                      ? <p className="text-sm text-slate-400 text-center py-4">Sin archivos adjuntos</p>
                      : (
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                          {incArchivos.map((a) => (
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
                                  <button onClick={() => deleteIncArc(a.id)}
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
                    <form onSubmit={saveIncArc} className="space-y-2 pt-1 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Adjuntar archivo</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input className="input text-sm" placeholder="Nombre del archivo"
                          value={incArcForm.nombre} onChange={(e) => setIncArcForm({ ...incArcForm, nombre: e.target.value })} required />
                        <select className="input text-sm" value={incArcForm.tipo}
                          onChange={(e) => setIncArcForm({ ...incArcForm, tipo: e.target.value })}>
                          <option value="documento">Documento</option>
                          <option value="imagen">Imagen</option>
                          <option value="video">Video</option>
                          <option value="hoja_calculo">Hoja de cálculo</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input type="file" className="input flex-1 text-sm" onChange={handleIncArcFile} disabled={subiendoIncArc} />
                        <button type="submit" disabled={savingIncArc || subiendoIncArc || !incArcForm.url}
                          className="btn-primary px-3 py-2 text-sm shrink-0">
                          {subiendoIncArc ? 'Subiendo…' : savingIncArc ? 'Guardando…' : 'Adjuntar'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {detailTab === 'asignados' && (
                  <div className="space-y-3">
                    {incAsignados.length === 0
                      ? <p className="text-sm text-slate-400 text-center py-4">Nadie asignado a esta incidencia</p>
                      : (
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                          {incAsignados.map((a) => (
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
                                <button onClick={() => quitarIncTrabajador(a.id)}
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
                      <form onSubmit={asignarIncTrabajador} className="flex gap-2 pt-1 border-t border-slate-100">
                        <select className="input flex-1 text-sm" value={asignandoIncTrabajadorId}
                          onChange={(e) => setAsignandoIncTrabajadorId(e.target.value)} required>
                          <option value="">Seleccionar trabajador…</option>
                          {trabajadores
                            .filter((t) => !incAsignados.some((a) => a.trabajadorId === t.id))
                            .map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                        <button type="submit" disabled={asignandoInc || !asignandoIncTrabajadorId}
                          className="btn-primary px-3 py-2 text-sm shrink-0">
                          {asignandoInc ? 'Asignando…' : 'Asignar'}
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

      {/* ── Modal: Actualización ── */}
      <Modal open={modal === 'createAct' || modal === 'editAct'} onClose={closeModal}
        title={modal === 'createAct' ? 'Nueva actualización' : 'Editar actualización'}
        description="Registra un avance del proyecto para que el cliente lo vea reflejado.">
        <form onSubmit={saveAct} className="space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="label">Título *</label>
              <input className="input" placeholder="Ej: Avance de diseño" value={actForm.titulo}
                onChange={(e) => setActForm({ ...actForm, titulo: e.target.value })} required />
            </div>
            <div>
              <label className="label">Descripción *</label>
              <textarea className="input resize-none" rows={3} placeholder="Cuéntale al cliente qué se hizo…"
                value={actForm.descripcion}
                onChange={(e) => setActForm({ ...actForm, descripcion: e.target.value })} required />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <PercentageSlider
              value={actForm.porcentajeAvance}
              onChange={(v) => setActForm({ ...actForm, porcentajeAvance: v })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
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
            <label className="label">Archivo *</label>
            <input type="file" className="input" onChange={handleArcFile} disabled={subiendoArc} />
            {subiendoArc && <p className="text-xs text-slate-400 mt-1">Subiendo…</p>}
            {arcForm.url && !subiendoArc && <p className="text-xs text-emerald-600 mt-1">Archivo listo ✓</p>}
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
            <button type="submit" className="btn-primary" disabled={saving || subiendoArc || !arcForm.url}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
