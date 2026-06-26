import type { Incidencia, Prioridad, EstadoIncidencia } from '../types';
import { MOCK_INCIDENTS } from '../lib/mock-data';

export interface CreateIncidenciaData {
  titulo: string;
  descripcion?: string;
  proyectoId: string;
  prioridad: Prioridad;
  estado: EstadoIncidencia;
}

const store: Incidencia[] = [...MOCK_INCIDENTS];

function delay() { return new Promise((r) => setTimeout(r, 200)); }

const incidentsService = {
  async getAll(proyectoId?: string): Promise<Incidencia[]> {
    await delay();
    return proyectoId ? store.filter((i) => i.proyectoId === proyectoId) : [...store];
  },
  async create(data: CreateIncidenciaData): Promise<Incidencia> {
    await delay();
    const now = new Date().toISOString();
    const inc: Incidencia = {
      id:          `i${Date.now()}`,
      titulo:      data.titulo,
      descripcion: data.descripcion,
      proyectoId:  data.proyectoId,
      prioridad:   data.prioridad,
      estado:      data.estado,
      createdAt:   now,
      updatedAt:   now,
    };
    store.push(inc);
    return inc;
  },
  async update(id: string, data: Partial<CreateIncidenciaData>): Promise<Incidencia> {
    await delay();
    const idx = store.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Incidencia no encontrada');
    store[idx] = { ...store[idx], ...data, updatedAt: new Date().toISOString() };
    return store[idx];
  },
  async remove(id: string): Promise<void> {
    await delay();
    const idx = store.findIndex((i) => i.id === id);
    if (idx !== -1) store.splice(idx, 1);
  },
};

export default incidentsService;
