import type { ArchivoIncidencia } from '../types';

export interface CreateArchivoIncidenciaData {
  incidenciaId: string;
  nombre: string;
  url: string;
  tipo: string;
}

const store: ArchivoIncidencia[] = [];

function delay() { return new Promise((r) => setTimeout(r, 200)); }

const archivosIncidenciaService = {
  async getByIncidencia(incidenciaId: string): Promise<ArchivoIncidencia[]> {
    await delay();
    return store.filter((a) => a.incidenciaId === incidenciaId);
  },
  async create(data: CreateArchivoIncidenciaData): Promise<ArchivoIncidencia> {
    await delay();
    const a: ArchivoIncidencia = {
      id:           `arc-inc-${Date.now()}`,
      incidenciaId: data.incidenciaId,
      nombre:       data.nombre,
      url:          data.url,
      tipo:         data.tipo,
      fecha:        new Date().toISOString().split('T')[0],
    };
    store.push(a);
    return a;
  },
  async remove(id: string): Promise<void> {
    await delay();
    const idx = store.findIndex((a) => a.id === id);
    if (idx !== -1) store.splice(idx, 1);
  },
};

export default archivosIncidenciaService;
