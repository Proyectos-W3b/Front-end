import { useQueries, useQuery } from '@tanstack/react-query';
import archivosIncidenciaService from '../../../services/archivos-incidencia.service';
import clientesService from '../../clientes/services/clientes.service';
import comentariosService from '../../../services/comentarios.service';
import incidentsService from '../services/incidents.service';
import projectsService from '../../projects/services/projects.service';
import type { Incidencia } from '../../../types';

export function useIncidentsPageData(filterProject: string, isAdmin: boolean) {
  const incidents = useQuery({
    queryKey: ['incidencias', 'all', filterProject || null],
    queryFn: () => incidentsService.getAll(filterProject || undefined),
    initialData: [] as Incidencia[],
  });

  const projects = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: () => projectsService.getAll(),
    initialData: [],
  });

  const clientes = useQuery({
    queryKey: ['clientes', 'all'],
    queryFn: () => clientesService.getAll(),
    enabled: isAdmin,
    initialData: [],
  });

  /** Reutiliza las mismas query keys que useComentarios/useArchivosIncidencia, así el modal
   * de detalle abre con datos ya en caché en vez de volver a pedirlos. */
  const commentCounts = useQueries({
    queries: incidents.data.map((inc) => ({
      queryKey: ['comentarios', inc.id],
      queryFn: () => comentariosService.getByIncidencia(inc.id),
      staleTime: 30_000,
    })),
  });
  const archivoCounts = useQueries({
    queries: incidents.data.map((inc) => ({
      queryKey: ['archivos-incidencia', inc.id],
      queryFn: () => archivosIncidenciaService.getByIncidencia(inc.id),
      staleTime: 30_000,
    })),
  });

  const commentCountById: Record<string, number> = {};
  const archivoCountById: Record<string, number> = {};
  incidents.data.forEach((inc, idx) => {
    commentCountById[inc.id] = commentCounts[idx]?.data?.length ?? 0;
    archivoCountById[inc.id] = archivoCounts[idx]?.data?.length ?? 0;
  });

  return {
    incidents: incidents.data,
    projects: projects.data,
    clientes: clientes.data,
    loading: incidents.isLoading || projects.isLoading,
    commentCountById,
    archivoCountById,
  };
}
