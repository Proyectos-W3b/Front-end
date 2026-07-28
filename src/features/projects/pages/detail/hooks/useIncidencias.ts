import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import incidentsService, { CreateIncidenciaData } from '../../../../incidents/services/incidents.service';
import type { Incidencia } from '../../../../../types';

export function useIncidencias(projectId: string | null) {
  const queryClient = useQueryClient();
  const key = ['incidencias', projectId];

  const query = useQuery({
    queryKey: key,
    queryFn: () => incidentsService.getAll(projectId!),
    enabled: !!projectId,
    initialData: [] as Incidencia[],
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const create = useMutation({
    mutationFn: (data: CreateIncidenciaData) => incidentsService.create(data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateIncidenciaData }) => incidentsService.update(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => incidentsService.remove(id),
    onSuccess: invalidate,
  });

  return { ...query, create, update, remove };
}
