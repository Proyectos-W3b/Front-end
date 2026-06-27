import { archivosIncidenciaApi } from './api.service';
import type { ArchivoIncidencia } from '../types';

export interface CreateArchivoIncidenciaData {
  incidenciaId: string;
  nombre: string;
  url: string;
  tipo: string;
}

const archivosIncidenciaService = {
  async getByIncidencia(incidenciaId: string): Promise<ArchivoIncidencia[]> {
    return archivosIncidenciaApi.getByIncidencia(incidenciaId);
  },

  async create(data: CreateArchivoIncidenciaData): Promise<ArchivoIncidencia> {
    return archivosIncidenciaApi.create(data);
  },

  async update(id: string, data: Partial<{ nombre: string; url: string; tipo: string }>): Promise<ArchivoIncidencia> {
    return archivosIncidenciaApi.update(id, data);
  },

  async remove(id: string): Promise<void> {
    return archivosIncidenciaApi.remove(id);
  },
};

export default archivosIncidenciaService;
