import { proyectsApi } from './api.service';
import type { Project } from '../types';

export interface CreateProjectData {
  clienteId: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  estado: string;
  fechaInicio: string;
  fechaFin?: string;
}

const projectsService = {
  async getAll(): Promise<Project[]> {
    return proyectsApi.getAll();
  },

  async getOne(id: string): Promise<Project> {
    return proyectsApi.getOne(id);
  },

  async create(data: CreateProjectData): Promise<Project> {
    return proyectsApi.create(data);
  },

  async update(id: string, data: Partial<CreateProjectData>): Promise<Project> {
    return proyectsApi.update(id, data);
  },

  async remove(id: string): Promise<void> {
    return proyectsApi.remove(id);
  },
};

export default projectsService;
