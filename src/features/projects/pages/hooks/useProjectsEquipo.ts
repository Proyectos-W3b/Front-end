import { useQueries } from '@tanstack/react-query';
import { asignacionesTrabajadorApi } from '../../../../services/api.service';
import type { AsignacionTrabajador } from '../../../../types';

/** Equipo asignado por proyecto, reutilizando la misma query key que useEquipo.ts (EquipoTab). */
export function useProjectsEquipo(projectIds: string[]) {
  const results = useQueries({
    queries: projectIds.map((id) => ({
      queryKey: ['equipo', id],
      queryFn: () => asignacionesTrabajadorApi.getByProyecto(id),
      staleTime: 30_000,
    })),
  });

  const equipoPorProyecto: Record<string, AsignacionTrabajador[]> = {};
  projectIds.forEach((id, idx) => {
    equipoPorProyecto[id] = results[idx]?.data ?? [];
  });

  return equipoPorProyecto;
}
