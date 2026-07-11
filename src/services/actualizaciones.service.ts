import { actualizacionesApi } from './api.service';
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

const actualizacionesService = {
  async getAll(): Promise<ActualizacionProyecto[]> {
    return actualizacionesApi.getAll({ limit: 100 });
  },

  async getByProyecto(proyectoId: string): Promise<ActualizacionProyecto[]> {
    return actualizacionesApi.getByProyecto(proyectoId);
  },

  async getOne(id: string): Promise<ActualizacionProyecto> {
    return actualizacionesApi.getOne(id);
  },

  async create(data: CreateActualizacionData): Promise<ActualizacionProyecto> {
    return actualizacionesApi.create(data);
  },

  async update(id: string, data: UpdateActualizacionData): Promise<ActualizacionProyecto> {
    return actualizacionesApi.update(id, data);
  },

  async remove(id: string): Promise<void> {
    return actualizacionesApi.remove(id);
  },
};

export default actualizacionesService;
