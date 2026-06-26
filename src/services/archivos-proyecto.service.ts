import type { ArchivoProyecto } from '../types';

export interface CreateArchivoProyectoData {
  proyectoId: string;
  nombre: string;
  url: string;
  tipo: string;
}

const store: ArchivoProyecto[] = [];

function delay() { return new Promise((r) => setTimeout(r, 200)); }

const archivosProyectoService = {
  async getByProyecto(proyectoId: string): Promise<ArchivoProyecto[]> {
    await delay();
    return store.filter((a) => a.proyectoId === proyectoId);
  },
  async create(data: CreateArchivoProyectoData): Promise<ArchivoProyecto> {
    await delay();
    const a: ArchivoProyecto = {
      id:         `arc-${Date.now()}`,
      proyectoId: data.proyectoId,
      nombre:     data.nombre,
      url:        data.url,
      tipo:       data.tipo,
      fecha:      new Date().toISOString().split('T')[0],
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

export default archivosProyectoService;
