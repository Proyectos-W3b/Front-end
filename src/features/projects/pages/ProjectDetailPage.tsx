import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, ListChecks, Paperclip, RefreshCw, Users } from 'lucide-react';
import { FullPageSpinner } from '../../../components/ui/Spinner';
import { useAuthStore } from '../../../store/auth.store';
import ActualizacionesTab from './detail/ActualizacionesTab';
import ArchivosTab from './detail/ArchivosTab';
import EquipoTab from './detail/EquipoTab';
import FasesTab from './detail/FasesTab';
import { useActualizaciones } from './detail/hooks/useActualizaciones';
import { useArchivosProyecto } from './detail/hooks/useArchivosProyecto';
import { useEquipo } from './detail/hooks/useEquipo';
import { useFases } from './detail/hooks/useFases';
import { useIncidencias } from './detail/hooks/useIncidencias';
import { useProject } from './detail/hooks/useProject';
import { useProjectIdFromSlug } from './detail/hooks/useProjectIdFromSlug';
import IncidenciasTab from './detail/IncidenciasTab';
import ProjectSidebar from './detail/ProjectSidebar';

type Tab = 'fases' | 'incidencias' | 'actualizaciones' | 'archivos' | 'equipo';

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.rol === 'admin';

  const { id, isLoading: resolvingSlug, notFound } = useProjectIdFromSlug(slug);
  const { data: project, isLoading: loadingProject } = useProject(id);

  const [tab, setTab] = useState<Tab>('fases');
  const [visited, setVisited] = useState<Set<Tab>>(new Set(['fases', 'incidencias', 'actualizaciones']));

  const { data: fases } = useFases(id);
  const { data: incidents } = useIncidencias(id);
  const { data: actualizaciones } = useActualizaciones(id);
  const { data: archivos } = useArchivosProyecto(id, visited.has('archivos'));
  const { data: equipo } = useEquipo(id, visited.has('equipo'));

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (!visited.has(t)) setVisited((prev) => new Set(prev).add(t));
  };

  if (resolvingSlug || loadingProject) return <FullPageSpinner />;
  if (notFound || !project) return <p className="text-center text-slate-500 py-16">Proyecto no encontrado</p>;

  const TABS: { key: Tab; label: string; count: number; icon: typeof FileText }[] = [
    { key: 'fases',           label: 'Fases',           count: fases.length,           icon: ListChecks },
    { key: 'incidencias',     label: 'Incidencias',     count: incidents.length,       icon: FileText   },
    { key: 'actualizaciones', label: 'Actualizaciones', count: actualizaciones.length, icon: RefreshCw  },
    { key: 'archivos',        label: 'Archivos',        count: archivos.length,        icon: Paperclip  },
    { key: 'equipo',          label: 'Equipo',          count: equipo.length,          icon: Users      },
  ];

  return (
    <div className="space-y-5">

      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/projects" className="hover:text-blue-600 transition-colors">Proyectos</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-medium">{project.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">

        <div className="space-y-4 min-w-0 order-2 xl:order-1">
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

          {tab === 'fases' && <FasesTab projectId={id!} isAdmin={isAdmin} />}
          {tab === 'incidencias' && <IncidenciasTab projectId={id!} isAdmin={isAdmin} />}
          {tab === 'actualizaciones' && <ActualizacionesTab projectId={id!} isAdmin={isAdmin} />}
          {tab === 'archivos' && <ArchivosTab projectId={id!} isAdmin={isAdmin} active={visited.has('archivos')} />}
          {tab === 'equipo' && <EquipoTab projectId={id!} isAdmin={isAdmin} active={visited.has('equipo')} />}
        </div>

        <ProjectSidebar project={project} isAdmin={isAdmin} incidents={incidents} actualizaciones={actualizaciones} fases={fases} />

      </div>
    </div>
  );
}
