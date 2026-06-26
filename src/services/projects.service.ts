import type { Project, EstadoProyecto } from '../types';
import { MOCK_PROJECTS } from '../lib/mock-data';

export interface CreateProjectData {
  nombre: string;
  descripcion?: string;
  estado: EstadoProyecto;
  clienteId?: string;
}

const store: Project[] = [...MOCK_PROJECTS];

function delay() { return new Promise((r) => setTimeout(r, 200)); }

const projectsService = {
  async getAll(): Promise<Project[]> {
    await delay();
    return [...store];
  },
  async getOne(id: string): Promise<Project> {
    await delay();
    const p = store.find((p) => p.id === id);
    if (!p) throw new Error('Proyecto no encontrado');
    return { ...p };
  },
  async create(data: CreateProjectData): Promise<Project> {
    await delay();
    const p: Project = {
      id:          `p${Date.now()}`,
      nombre:      data.nombre,
      descripcion: data.descripcion,
      estado:      data.estado,
      clienteId:   data.clienteId,
      fecha:       new Date().toISOString().split('T')[0],
      actualizado: new Date().toISOString().split('T')[0],
    };
    store.push(p);
    return p;
  },
  async update(id: string, data: Partial<CreateProjectData>): Promise<Project> {
    await delay();
    const idx = store.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Proyecto no encontrado');
    store[idx] = { ...store[idx], ...data, actualizado: new Date().toISOString().split('T')[0] };
    return store[idx];
  },
  async remove(id: string): Promise<void> {
    await delay();
    const idx = store.findIndex((p) => p.id === id);
    if (idx !== -1) store.splice(idx, 1);
  },
};

export default projectsService;
