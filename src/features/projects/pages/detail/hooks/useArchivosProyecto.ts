import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import archivosProyectoService, { CreateArchivoProyectoData } from '../../../services/archivos-proyecto.service';
import type { ArchivoProyecto } from '../../../../../types';

export function useArchivosProyecto(projectId: string | null, enabled: boolean) {
  const queryClient = useQueryClient();
  const key = ['archivos-proyecto', projectId];

  const query = useQuery({
    queryKey: key,
    queryFn: () => archivosProyectoService.getByProyecto(projectId!),
    enabled: !!projectId && enabled,
    initialData: [] as ArchivoProyecto[],
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const create = useMutation({
    mutationFn: (data: CreateArchivoProyectoData) => archivosProyectoService.create(data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => archivosProyectoService.remove(id),
    onSuccess: invalidate,
  });

  return { ...query, create, remove };
}
