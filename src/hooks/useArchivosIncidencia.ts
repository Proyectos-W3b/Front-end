import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import archivosIncidenciaService, { CreateArchivoIncidenciaData } from '../services/archivos-incidencia.service';
import type { ArchivoIncidencia } from '../types';

export function useArchivosIncidencia(incidenciaId: string | null, enabled: boolean) {
  const queryClient = useQueryClient();
  const key = ['archivos-incidencia', incidenciaId];

  const query = useQuery({
    queryKey: key,
    queryFn: () => archivosIncidenciaService.getByIncidencia(incidenciaId!),
    enabled: !!incidenciaId && enabled,
    initialData: [] as ArchivoIncidencia[],
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const create = useMutation({
    mutationFn: (data: Omit<CreateArchivoIncidenciaData, 'incidenciaId'>) =>
      archivosIncidenciaService.create({ ...data, incidenciaId: incidenciaId! }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (arcId: string) => archivosIncidenciaService.remove(arcId),
    onSuccess: invalidate,
  });

  return { ...query, create, remove };
}
