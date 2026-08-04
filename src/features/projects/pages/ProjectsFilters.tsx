import FiltersPanel from '../../../components/ui/FiltersPanel';
import { useTrabajadores } from '../../../hooks/useTrabajadores';
import type { Cliente } from '../../../types';
import { PROJECT_ESTADO_LABELS } from '../constants';

export interface ProjectsFiltersState {
  search: string;
  estado: string;
  clienteId: string;
  trabajadorId: string;
}

export const EMPTY_FILTERS: ProjectsFiltersState = {
  search: '', estado: '', clienteId: '', trabajadorId: '',
};

export default function ProjectsFilters({
  filters, onChange, onClear, clientes, showEstado,
}: {
  filters: ProjectsFiltersState;
  onChange: (patch: Partial<ProjectsFiltersState>) => void;
  onClear: () => void;
  clientes: Cliente[];
  showEstado: boolean;
}) {
  const trabajadores = useTrabajadores(true);

  return (
    <FiltersPanel onClear={onClear}>
      <div>
        <label className="label">Buscar</label>
        <input
          className="input"
          placeholder="Nombre del proyecto"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      {showEstado && (
        <div>
          <label className="label">Estado</label>
          <select className="input" value={filters.estado} onChange={(e) => onChange({ estado: e.target.value })}>
            <option value="">Todos</option>
            {Object.entries(PROJECT_ESTADO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="label">Cliente</label>
        <select className="input" value={filters.clienteId} onChange={(e) => onChange({ clienteId: e.target.value })}>
          <option value="">Todos</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.empresa}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Responsable</label>
        <select className="input" value={filters.trabajadorId} onChange={(e) => onChange({ trabajadorId: e.target.value })}>
          <option value="">Todos</option>
          {trabajadores.data.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
      </div>
    </FiltersPanel>
  );
}
