import { archivosProyectoApi } from './api.service';
import type { ArchivoProyecto } from '../types';

export interface CreateArchivoProyectoData {
  proyectoId: string;
  nombre: string;
  url: string;
  tipo: string;
}

const archivosProyectoService = {
  async getByProyecto(proyectoId: string): Promise<ArchivoProyecto[]> {
    return archivosProyectoApi.getByProyecto(proyectoId);
  },

  async getOne(id: string): Promise<ArchivoProyecto> {
    return archivosProyectoApi.getOne(id);
  },

  async create(data: CreateArchivoProyectoData): Promise<ArchivoProyecto> {
    return archivosProyectoApi.create(data);
  },

  async update(id: string, data: Partial<{ nombre: string; url: string; tipo: string }>): Promise<ArchivoProyecto> {
    return archivosProyectoApi.update(id, data);
  },

  async remove(id: string): Promise<void> {
    return archivosProyectoApi.remove(id);
  },
};

export default archivosProyectoService;
