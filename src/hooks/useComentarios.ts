import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import comentariosService from '../services/comentarios.service';
import type { ComentarioIncidencia } from '../types';

export function useComentarios(incidenciaId: string | null, enabled: boolean) {
  const queryClient = useQueryClient();
  const key = ['comentarios', incidenciaId];

  const query = useQuery({
    queryKey: key,
    queryFn: () => comentariosService.getByIncidencia(incidenciaId!),
    enabled: !!incidenciaId && enabled,
    initialData: [] as ComentarioIncidencia[],
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const send = useMutation({
    mutationFn: (contenido: string) => comentariosService.create({ incidenciaId: incidenciaId!, contenido }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (commentId: string) => comentariosService.remove(commentId),
    onSuccess: invalidate,
  });

  return { ...query, send, remove };
}
