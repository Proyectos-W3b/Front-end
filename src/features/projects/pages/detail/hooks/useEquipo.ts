import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { asignacionesTrabajadorApi } from '../../../../../services/api.service';
import type { AsignacionTrabajador } from '../../../../../types';

export function useEquipo(projectId: string | null, enabled: boolean) {
  const queryClient = useQueryClient();
  const key = ['equipo', projectId];

  const query = useQuery({
    queryKey: key,
    queryFn: () => asignacionesTrabajadorApi.getByProyecto(projectId!),
    enabled: !!projectId && enabled,
    initialData: [] as AsignacionTrabajador[],
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const asignar = useMutation({
    mutationFn: (trabajadorId: string) => asignacionesTrabajadorApi.create(projectId!, trabajadorId),
    onSuccess: invalidate,
  });

  const quitar = useMutation({
    mutationFn: (asignacionId: string) => asignacionesTrabajadorApi.remove(asignacionId),
    onSuccess: invalidate,
  });

  return { ...query, asignar, quitar };
}
