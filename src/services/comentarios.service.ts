import type { ComentarioIncidencia } from '../types';

const store: ComentarioIncidencia[] = [];

function delay() { return new Promise((r) => setTimeout(r, 200)); }

const comentariosService = {
  async getByIncidencia(incidenciaId: string): Promise<ComentarioIncidencia[]> {
    await delay();
    return store.filter((c) => c.incidenciaId === incidenciaId);
  },
  async create(data: { incidenciaId: string; contenido: string }): Promise<ComentarioIncidencia> {
    await delay();
    const c: ComentarioIncidencia = {
      id:            `com-${Date.now()}`,
      incidenciaId:  data.incidenciaId,
      autorId:       'usr-001',
      contenido:     data.contenido,
      fechaCreacion: new Date().toISOString(),
    };
    store.push(c);
    return c;
  },
  async remove(id: string): Promise<void> {
    await delay();
    const idx = store.findIndex((c) => c.id === id);
    if (idx !== -1) store.splice(idx, 1);
  },
};

export default comentariosService;
