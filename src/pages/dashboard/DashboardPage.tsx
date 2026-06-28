import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, AlertTriangle, Users, TrendingUp, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import projectsService from '../../services/projects.service';
import incidentsService from '../../services/incidents.service';
import clientesService from '../../services/clientes.service';
import Badge from '../../components/ui/Badge';
import { FullPageSpinner } from '../../components/ui/Spinner';
import type { Project, Incidencia, ClienteStats } from '../../types';

export default function DashboardPage() {
  const user    = useAuthStore((s) => s.user);
  const isAdmin = user?.rol === 'admin';

  const [projects,  setProjects]  = useState<Project[]>([]);
  const [incidents, setIncidents] = useState<Incidencia[]>([]);
  const [stats,     setStats]     = useState<ClienteStats | null>(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, i, s] = await Promise.allSettled([
          projectsService.getAll(),
          incidentsService.getAll(),
          isAdmin ? clientesService.getStats() : Promise.resolve(null),
        ]);
        if (p.status === 'fulfilled') setProjects(p.value);
        if (i.status === 'fulfilled') setIncidents(i.value);
        if (s.status === 'fulfilled') setStats(s.value);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <FullPageSpinner />;

  const openIncidents      = incidents.filter((i) => i.estado === 'abierta' || i.estado === 'en_proceso');
  const resolvedIncidents  = incidents.filter((i) => i.estado === 'resuelta' || i.estado === 'cerrada');
  const recentProjects     = [...projects].slice(0, 5);
  const recentIncidents    = [...incidents].slice(0, 5);

  /* ── Bar chart data ── */
  const bars = [
    { label: 'Activos',   count: projects.filter((p) => p.estado === 'activo').length,     color: 'bg-blue-500',   hover: 'hover:bg-blue-600' },
    { label: 'Complet.',  count: projects.filter((p) => p.estado === 'completado').length,  color: 'bg-indigo-500', hover: 'hover:bg-indigo-600' },
    { label: 'Inactivos', count: projects.filter((p) => p.estado === 'inactivo').length,    color: 'bg-slate-300',  hover: 'hover:bg-slate-400' },
    { label: 'Baja',      count: incidents.filter((i) => i.prioridad === 'baja').length,    color: 'bg-sky-400',    hover: 'hover:bg-sky-500' },
    { label: 'Media',     count: incidents.filter((i) => i.prioridad === 'media').length,   color: 'bg-amber-400',  hover: 'hover:bg-amber-500' },
    { label: 'Alta',      count: incidents.filter((i) => i.prioridad === 'alta').length,    color: 'bg-orange-500', hover: 'hover:bg-orange-600' },
    { label: 'Crítica',   count: incidents.filter((i) => i.prioridad === 'critica').length, color: 'bg-red-500',    hover: 'hover:bg-red-600' },
  ];
  const maxBar = Math.max(...bars.map((b) => b.count), 1);

  /* ── Donut ── */
  const donutSegments = [
    { label: 'Abierta',    count: incidents.filter((i) => i.estado === 'abierta').length,    color: '#f97316', bg: 'bg-orange-500' },
    { label: 'En proceso', count: incidents.filter((i) => i.estado === 'en_proceso').length, color: '#eab308', bg: 'bg-amber-400'  },
    { label: 'Resuelta',   count: incidents.filter((i) => i.estado === 'resuelta').length,   color: '#10b981', bg: 'bg-emerald-500' },
    { label: 'Cerrada',    count: incidents.filter((i) => i.estado === 'cerrada').length,    color: '#94a3b8', bg: 'bg-slate-400'  },
  ];
  const donutTotal = incidents.length || 1;
  let cum = 0;
  const donutGradient = `conic-gradient(${
    donutSegments.map((s) => {
      const pct = (s.count / donutTotal) * 100;
      const part = `${s.color} ${cum}% ${cum + pct}%`;
      cum += pct;
      return part;
    }).join(', ')
  })`;

  /* ── Cliente: progreso por proyecto ── */
  const projectProgress = projects.map((p) => {
    const proj    = incidents.filter((i) => i.proyectoId === p.id);
    const total   = proj.length;
    const cerradas = proj.filter((i) => i.estado === 'resuelta' || i.estado === 'cerrada').length;
    return { ...p, totalInc: total, cerradasInc: cerradas };
  });

  /* ════════════════════════════════════════════════════════════ */
  /*  VISTA CLIENTE                                               */
  /* ════════════════════════════════════════════════════════════ */
  if (!isAdmin) {
    return (
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Mi Panel</h2>
            <p className="text-xs text-slate-500 mt-0.5">Bienvenido, {user?.nombre}</p>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-700">Sistema operativo</span>
          </div>
        </div>

        {/* KPI Strip cliente */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">

            <Link to="/projects"
              className="group px-6 py-5 hover:bg-slate-50/80 transition-colors flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Mis proyectos</span>
                <FolderOpen className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900 tabular-nums leading-none">{projects.length}</span>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full mb-0.5">
                  {projects.filter((p) => p.estado === 'activo').length} activos
                </span>
              </div>
            </Link>

            <Link to="/incidents"
              className="group px-6 py-5 hover:bg-slate-50/80 transition-colors flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">En proceso</span>
                <AlertTriangle className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-400 transition-colors" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900 tabular-nums leading-none">{openIncidents.length}</span>
                <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full mb-0.5">abiertas</span>
              </div>
            </Link>

            <Link to="/incidents"
              className="group px-6 py-5 hover:bg-slate-50/80 transition-colors flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Resueltas</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900 tabular-nums leading-none">{resolvedIncidents.length}</span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full mb-0.5">de {incidents.length}</span>
              </div>
            </Link>

            <div className="px-6 py-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Completados</span>
                <Clock className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900 tabular-nums leading-none">
                  {projects.filter((p) => p.estado === 'completado').length}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 mb-0.5">proyectos</span>
              </div>
            </div>

          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Progreso de proyectos */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] p-6">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-900">Progreso de mis proyectos</h3>
              <p className="text-xs text-slate-500 mt-0.5">Incidencias resueltas por proyecto</p>
            </div>
            {projectProgress.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Sin proyectos asignados</p>
            ) : (
              <div className="space-y-4">
                {projectProgress.map((p) => {
                  const pct = p.totalInc > 0 ? Math.round((p.cerradasInc / p.totalInc) * 100) : 0;
                  return (
                    <div key={p.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <Link to={`/projects/${p.id}`}
                          className="text-sm font-medium text-slate-800 hover:text-blue-600 transition-colors truncate max-w-[60%]">
                          {p.nombre}
                        </Link>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge value={p.estado} />
                          <span className="text-xs font-semibold text-slate-500 tabular-nums">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {p.cerradasInc} de {p.totalInc} incidencias resueltas
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Donut estado incidencias */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Mis incidencias</h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribución por estado</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36">
                <div className="w-36 h-36 rounded-full" style={{ background: donutGradient }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white shadow-sm flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900 leading-none">{incidents.length}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-medium">TOTAL</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 w-full space-y-2">
                {donutSegments.map((seg) => (
                  <div key={seg.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-sm ${seg.bg} shrink-0`} />
                      <span className="text-xs text-slate-600">{seg.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${seg.bg}`}
                          style={{ width: `${incidents.length ? (seg.count / incidents.length) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 tabular-nums w-4 text-right">{seg.count}</span>
                    </div>
                  </div>
                ))}
                {incidents.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">Sin incidencias</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tables row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Mis proyectos */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Mis proyectos</h3>
              <Link to="/projects" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:gap-1.5 transition-all">
                Ver todos <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            {recentProjects.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Sin proyectos asignados</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="table-th">Proyecto</th>
                    <th className="table-th">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="table-td">
                        <Link to={`/projects/${p.id}`} className="font-medium text-slate-800 hover:text-blue-600 transition-colors">
                          {p.nombre}
                        </Link>
                      </td>
                      <td className="table-td"><Badge value={p.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mis incidencias recientes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Mis incidencias recientes</h3>
              <Link to="/incidents" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:gap-1.5 transition-all">
                Ver todas <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            {recentIncidents.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Sin incidencias registradas</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="table-th">Título</th>
                    <th className="table-th">Prioridad</th>
                    <th className="table-th">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentIncidents.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="table-td font-medium text-slate-800 max-w-[160px] truncate">{i.titulo}</td>
                      <td className="table-td"><Badge value={i.prioridad} /></td>
                      <td className="table-td"><Badge value={i.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════ */
  /*  VISTA ADMIN                                                 */
  /* ════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Bienvenido, {user?.nombre}</p>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-700">Sistema operativo</span>
        </div>
      </div>

      {/* KPI Strip admin */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">

          <Link to="/projects"
            className="group px-6 py-5 hover:bg-slate-50/80 transition-colors flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Proyectos</span>
              <FolderOpen className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900 tabular-nums leading-none">{projects.length}</span>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full mb-0.5">
                {projects.filter((p) => p.estado === 'activo').length} activos
              </span>
            </div>
          </Link>

          <Link to="/incidents"
            className="group px-6 py-5 hover:bg-slate-50/80 transition-colors flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Incid. abiertas</span>
              <AlertTriangle className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-400 transition-colors" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900 tabular-nums leading-none">{openIncidents.length}</span>
              <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full mb-0.5">
                de {incidents.length}
              </span>
            </div>
          </Link>

          <div className="px-6 py-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Total incid.</span>
              <TrendingUp className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900 tabular-nums leading-none">{incidents.length}</span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full mb-0.5">
                {incidents.filter((i) => i.estado === 'resuelta').length} resueltas
              </span>
            </div>
          </div>

          <Link to="/clientes"
            className="group px-6 py-5 hover:bg-slate-50/80 transition-colors flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Clientes</span>
              <Users className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900 tabular-nums leading-none">{stats?.activos ?? '—'}</span>
              <span className="text-[11px] font-semibold text-slate-500 mb-0.5">activos</span>
            </div>
          </Link>

        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Estadísticas del sistema</h3>
              <p className="text-xs text-slate-500 mt-0.5">Proyectos por estado · Incidencias por prioridad</p>
            </div>
            <div className="flex gap-3 text-[10px] font-medium text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />Proyectos</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />Incidencias</span>
            </div>
          </div>
          <div className="flex items-end gap-3 mt-6" style={{ height: '140px' }}>
            {bars.map((bar, idx) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                <span className="text-[11px] font-bold text-slate-600 tabular-nums">{bar.count}</span>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t-lg ${bar.color} ${bar.hover} transition-all duration-500 cursor-default`}
                    style={{ height: `${Math.max((bar.count / maxBar) * 100, bar.count > 0 ? 10 : 2)}%` }}
                    title={`${bar.label}: ${bar.count}`}
                  />
                </div>
                {idx === 2 && <div className="w-px h-full bg-slate-100 absolute" />}
                <span className="text-[10px] text-slate-400 whitespace-nowrap">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Estado de incidencias</h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribución actual</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36">
              <div className="w-36 h-36 rounded-full" style={{ background: donutGradient }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white shadow-sm flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900 leading-none">{incidents.length}</span>
                  <span className="text-[9px] text-slate-400 mt-0.5 font-medium">TOTAL</span>
                </div>
              </div>
            </div>
            <div className="mt-5 w-full space-y-2">
              {donutSegments.map((seg) => (
                <div key={seg.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-sm ${seg.bg} shrink-0`} />
                    <span className="text-xs text-slate-600">{seg.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${seg.bg}`}
                        style={{ width: `${incidents.length ? (seg.count / incidents.length) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 tabular-nums w-4 text-right">{seg.count}</span>
                  </div>
                </div>
              ))}
              {incidents.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">Sin incidencias</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Proyectos recientes</h3>
            <Link to="/projects" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:gap-1.5 transition-all">
              Ver todos <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Sin proyectos registrados</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="table-th">Proyecto</th>
                  <th className="table-th">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td">
                      <Link to={`/projects/${p.id}`} className="font-medium text-slate-800 hover:text-blue-600 transition-colors">
                        {p.nombre}
                      </Link>
                    </td>
                    <td className="table-td"><Badge value={p.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Incidencias recientes</h3>
            <Link to="/incidents" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:gap-1.5 transition-all">
              Ver todas <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {recentIncidents.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Sin incidencias registradas</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="table-th">Título</th>
                  <th className="table-th">Prioridad</th>
                  <th className="table-th">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentIncidents.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td font-medium text-slate-800 max-w-[160px] truncate">{i.titulo}</td>
                    <td className="table-td"><Badge value={i.prioridad} /></td>
                    <td className="table-td"><Badge value={i.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
