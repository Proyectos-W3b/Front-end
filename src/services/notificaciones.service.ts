import api from '../lib/api';
import type { Notificacion } from '../types';

const notificacionesService = {
  async getAll(): Promise<Notificacion[]> {
    const { data } = await api.get('/notificaciones');
    return Array.isArray(data) ? data : data.data ?? [];
  },

  async contarNoLeidas(): Promise<number> {
    const { data } = await api.get('/notificaciones/no-leidas/contador');
    return data.total ?? 0;
  },

  async marcarLeida(id: string): Promise<void> {
    await api.patch(`/notificaciones/${id}/leida`);
  },

  async marcarTodasLeidas(): Promise<void> {
    await api.patch('/notificaciones/marcar-todas');
  },
};

export default notificacionesService;
