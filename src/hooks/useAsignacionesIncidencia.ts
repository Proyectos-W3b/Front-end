import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { asignacionesIncidenciaApi } from '../services/api.service';
import type { AsignacionIncidencia } from '../types';

export function useAsignacionesIncidencia(incidenciaId: string | null, enabled: boolean) {
  const queryClient = useQueryClient();
  const key = ['asignaciones-incidencia', incidenciaId];

  const query = useQuery({
    queryKey: key,
    queryFn: () => asignacionesIncidenciaApi.getByIncidencia(incidenciaId!),
    enabled: !!incidenciaId && enabled,
    initialData: [] as AsignacionIncidencia[],
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const asignar = useMutation({
    mutationFn: (trabajadorId: string) => asignacionesIncidenciaApi.create(incidenciaId!, trabajadorId),
    onSuccess: invalidate,
  });

  const quitar = useMutation({
    mutationFn: (asignacionId: string) => asignacionesIncidenciaApi.remove(asignacionId),
    onSuccess: invalidate,
  });

  return { ...query, asignar, quitar };
}
