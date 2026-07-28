import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import projectsService from '../../../services/projects.service';

export function useProject(projectId: string | null) {
  const queryClient = useQueryClient();
  const key = ['project', projectId];

  const query = useQuery({
    queryKey: key,
    queryFn: () => projectsService.getOne(projectId!),
    enabled: !!projectId,
  });

  const update = useMutation({
    mutationFn: (data: { nombre: string; descripcion: string; estado: string }) =>
      projectsService.update(projectId!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  return { ...query, update };
}
