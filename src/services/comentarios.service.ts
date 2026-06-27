import { comentariosApi } from './api.service';
import { useAuthStore } from '../store/auth.store';
import type { ComentarioIncidencia } from '../types';

const comentariosService = {
  async getByIncidencia(incidenciaId: string): Promise<ComentarioIncidencia[]> {
    return comentariosApi.getByIncidencia(incidenciaId);
  },

  async create(data: { incidenciaId: string; contenido: string }): Promise<ComentarioIncidencia> {
    const autorId = useAuthStore.getState().user?.id ?? '';
    return comentariosApi.create({ ...data, autorId });
  },

  async update(id: string, contenido: string): Promise<ComentarioIncidencia> {
    return comentariosApi.update(id, { contenido });
  },

  async remove(id: string): Promise<void> {
    return comentariosApi.remove(id);
  },
};

export default comentariosService;
