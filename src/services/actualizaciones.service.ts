import type { ActualizacionProyecto } from '../types';

export interface CreateActualizacionData {
  proyectoId: string;
  titulo: string;
  descripcion: string;
  porcentajeAvance: number;
}

export interface UpdateActualizacionData {
  titulo?: string;
  descripcion?: string;
  porcentajeAvance?: number;
}

const store: ActualizacionProyecto[] = [];

function delay() { return new Promise((r) => setTimeout(r, 200)); }

const actualizacionesService = {
  async getByProyecto(proyectoId: string): Promise<ActualizacionProyecto[]> {
    await delay();
    return store.filter((a) => a.proyectoId === proyectoId);
  },
  async create(data: CreateActualizacionData): Promise<ActualizacionProyecto> {
    await delay();
    const a: ActualizacionProyecto = {
      id:               `act-${Date.now()}`,
      proyectoId:       data.proyectoId,
      titulo:           data.titulo,
      descripcion:      data.descripcion,
      porcentajeAvance: data.porcentajeAvance,
      fecha:            new Date().toISOString().split('T')[0],
    };
    store.push(a);
    return a;
  },
  async update(id: string, data: UpdateActualizacionData): Promise<ActualizacionProyecto> {
    await delay();
    const idx = store.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Actualización no encontrada');
    store[idx] = { ...store[idx], ...data };
    return store[idx];
  },
  async remove(id: string): Promise<void> {
    await delay();
    const idx = store.findIndex((a) => a.id === id);
    if (idx !== -1) store.splice(idx, 1);
  },
};

export default actualizacionesService;
