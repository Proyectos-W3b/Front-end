import { fasesApi } from './api.service';
import type { Fase, EstadoFase } from '../types';

export interface CreateFaseData {
  proyectoId: string;
  nombre: string;
  orden?: number;
}

const fasesService = {
  async getByProyecto(proyectoId: string): Promise<Fase[]> {
    return fasesApi.getByProyecto(proyectoId);
  },

  async create(data: CreateFaseData): Promise<Fase> {
    return fasesApi.create(data);
  },

  async rename(id: string, nombre: string): Promise<Fase> {
    return fasesApi.update(id, { nombre });
  },

  async setEstado(id: string, estado: EstadoFase): Promise<Fase> {
    return fasesApi.update(id, { estado });
  },

  async remove(id: string): Promise<void> {
    return fasesApi.remove(id);
  },

  async reorder(items: { id: string; orden: number }[]): Promise<void> {
    return fasesApi.reorder(items);
  },
};

export default fasesService;
