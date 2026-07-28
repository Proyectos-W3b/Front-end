import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import actualizacionesService, {
  CreateActualizacionData, UpdateActualizacionData,
} from '../../../services/actualizaciones.service';
import type { ActualizacionProyecto } from '../../../../../types';

export function useActualizaciones(projectId: string | null) {
  const queryClient = useQueryClient();
  const key = ['actualizaciones', projectId];

  const query = useQuery({
    queryKey: key,
    queryFn: () => actualizacionesService.getByProyecto(projectId!),
    enabled: !!projectId,
    initialData: [] as ActualizacionProyecto[],
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const create = useMutation({
    mutationFn: (data: CreateActualizacionData) => actualizacionesService.create(data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateActualizacionData }) => actualizacionesService.update(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => actualizacionesService.remove(id),
    onSuccess: invalidate,
  });

  return { ...query, create, update, remove };
}
