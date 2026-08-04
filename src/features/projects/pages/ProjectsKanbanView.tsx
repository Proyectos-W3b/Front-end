import { Link } from 'react-router-dom';
import { Building2, ExternalLink, Users } from 'lucide-react';
import KanbanBoard, { type KanbanColumn } from '../../../components/ui/KanbanBoard';
import ProgressBar from '../../../components/ui/ProgressBar';
import type { AsignacionTrabajador, Project } from '../../../types';
import { toProjectPath } from '../../../lib/slug';
import { PROJECT_ESTADO_LABELS } from '../constants';

const COLUMNS: KanbanColumn[] = [
  { key: 'planificado', label: PROJECT_ESTADO_LABELS.planificado, headerClass: 'bg-indigo-50 border-indigo-100',  dotClass: 'bg-indigo-500',  labelClass: 'text-indigo-700',  accentClass: 'border-l-indigo-400' },
  { key: 'activo',      label: PROJECT_ESTADO_LABELS.activo,      headerClass: 'bg-blue-50 border-blue-100',     dotClass: 'bg-blue-500',    labelClass: 'text-blue-700',    accentClass: 'border-l-blue-400'   },
  { key: 'inactivo',    label: PROJECT_ESTADO_LABELS.inactivo,    headerClass: 'bg-slate-50 border-slate-200',   dotClass: 'bg-slate-400',   labelClass: 'text-slate-600',   accentClass: 'border-l-slate-300'  },
  { key: 'completado',  label: PROJECT_ESTADO_LABELS.completado,  headerClass: 'bg-emerald-50 border-emerald-100', dotClass: 'bg-emerald-500', labelClass: 'text-emerald-700', accentClass: 'border-l-emerald-400' },
];

export default function ProjectsKanbanView({
  projects, clienteName, avanceMap, equipoPorProyecto, onMove,
}: {
  projects: Project[];
  clienteName: (id?: string) => string;
  avanceMap: Record<string, number>;
  equipoPorProyecto: Record<string, AsignacionTrabajador[]>;
  onMove: (project: Project, nuevoEstado: string) => void;
}) {
  return (
    <KanbanBoard<Project>
      columns={COLUMNS}
      items={projects}
      getColumnKey={(p) => p.estado}
      onMove={(id, estado) => {
        const project = projects.find((p) => p.id === id);
        if (project) onMove(project, estado);
      }}
      renderCard={(p) => (
        <div className="p-4 space-y-2">
          <Link to={toProjectPath(p)} className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors inline-flex items-center gap-1">
            {p.nombre} <ExternalLink className="w-3 h-3 opacity-40" />
          </Link>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />{clienteName(p.clienteId)}
          </p>
          {avanceMap[p.id] !== undefined && <ProgressBar value={avanceMap[p.id]} showLabel />}
          {equipoPorProyecto[p.id]?.length > 0 && (
            <p className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-50">
              <Users className="w-3.5 h-3.5" /> {equipoPorProyecto[p.id].length} asignado{equipoPorProyecto[p.id].length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    />
  );
}
