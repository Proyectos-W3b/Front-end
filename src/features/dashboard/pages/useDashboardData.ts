import { useQuery } from '@tanstack/react-query';
import clientesService from '../../clientes/services/clientes.service';
import incidentsService from '../../incidents/services/incidents.service';
import projectsService from '../../projects/services/projects.service';
import type { ClienteStats, Incidencia, Project } from '../../../types';

export function useDashboardData(isAdmin: boolean) {
  const projects = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: () => projectsService.getAll(),
    initialData: [] as Project[],
  });

  const incidents = useQuery({
    queryKey: ['incidencias', 'all', null],
    queryFn: () => incidentsService.getAll(),
    initialData: [] as Incidencia[],
  });

  const stats = useQuery({
    queryKey: ['clientes', 'stats'],
    queryFn: () => clientesService.getStats(),
    enabled: isAdmin,
  });

  return {
    projects: projects.data,
    incidents: incidents.data,
    stats: (stats.data ?? null) as ClienteStats | null,
    loading: projects.isLoading || incidents.isLoading,
  };
}
