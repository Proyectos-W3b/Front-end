import { incidenciasApi } from './api.service';
import type { Incidencia, Prioridad, EstadoIncidencia } from '../types';

export interface CreateIncidenciaData {
  titulo: string;
  descripcion: string;
  proyectoId: string;
  prioridad: Prioridad;
  estado: EstadoIncidencia;
}

const incidentsService = {
  async getAll(proyectoId?: string): Promise<Incidencia[]> {
    const all = await incidenciasApi.getAll({ limit: 100 });
    return proyectoId ? all.filter((i) => i.proyectoId === proyectoId) : all;
  },

  async getOne(id: string): Promise<Incidencia> {
    return incidenciasApi.getOne(id);
  },

  async create(data: CreateIncidenciaData): Promise<Incidencia> {
    return incidenciasApi.create(data);
  },

  async update(id: string, data: Partial<CreateIncidenciaData>): Promise<Incidencia> {
    return incidenciasApi.update(id, data);
  },

  async remove(id: string): Promise<void> {
    return incidenciasApi.remove(id);
  },
};

export default incidentsService;
