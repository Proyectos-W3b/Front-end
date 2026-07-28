import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import fasesService from '../../../services/fases.service';
import type { EstadoFase, Fase } from '../../../../../types';

const NEXT_ESTADO_FASE: Record<EstadoFase, EstadoFase> = {
  pendiente: 'en_progreso', en_progreso: 'completado', completado: 'pendiente',
};

export function useFases(projectId: string | null) {
  const queryClient = useQueryClient();
  const key = ['fases', projectId];

  const query = useQuery({
    queryKey: key,
    queryFn: () => fasesService.getByProyecto(projectId!),
    enabled: !!projectId,
    initialData: [] as Fase[],
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const create = useMutation({
    mutationFn: (nombre: string) => fasesService.create({ proyectoId: projectId!, nombre }),
    onSuccess: (created) => {
      queryClient.setQueryData<Fase[]>(key, (prev = []) => [...prev, created]);
    },
  });

  const cycleEstado = useMutation({
    mutationFn: (fase: Fase) => fasesService.setEstado(fase.id, NEXT_ESTADO_FASE[fase.estado]),
    onMutate: (fase) => {
      queryClient.setQueryData<Fase[]>(key, (prev = []) =>
        prev.map((f) => (f.id === fase.id ? { ...f, estado: NEXT_ESTADO_FASE[fase.estado] } : f)));
    },
    onError: invalidate,
  });

  const rename = useMutation({
    mutationFn: ({ fase, nombre }: { fase: Fase; nombre: string }) => fasesService.rename(fase.id, nombre),
    onMutate: ({ fase, nombre }) => {
      queryClient.setQueryData<Fase[]>(key, (prev = []) =>
        prev.map((f) => (f.id === fase.id ? { ...f, nombre } : f)));
    },
    onError: invalidate,
  });

  const remove = useMutation({
    mutationFn: (fase: Fase) => fasesService.remove(fase.id),
    onMutate: (fase) => {
      queryClient.setQueryData<Fase[]>(key, (prev = []) => prev.filter((f) => f.id !== fase.id));
    },
    onError: invalidate,
  });

  const reorder = useMutation({
    mutationFn: (orderedIds: string[]) =>
      fasesService.reorder(orderedIds.map((faseId, idx) => ({ id: faseId, orden: idx }))),
    onError: invalidate,
  });

  return { ...query, create, cycleEstado, rename, remove, reorder };
}
