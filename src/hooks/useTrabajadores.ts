import { useQuery } from '@tanstack/react-query';
import { usuariosApi } from '../services/api.service';

/** Lista de usuarios con rol 'trabajador', usada por las asignaciones de proyectos e incidencias. */
export function useTrabajadores(enabled: boolean) {
  return useQuery({
    queryKey: ['usuarios', 'trabajadores'],
    queryFn: async () => (await usuariosApi.getAll()).filter((u) => u.rol === 'trabajador'),
    enabled,
    initialData: [],
  });
}
