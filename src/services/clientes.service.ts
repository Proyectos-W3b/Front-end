import { clientesApi } from './api.service';
import type { Cliente, ClienteStats } from '../types';

export interface CreateClienteData {
  usuarioId: string;
  empresa: string;
  telefono?: string;
  direccion?: string;
}

export interface UpdateClienteData {
  empresa?: string;
  telefono?: string;
  direccion?: string;
}

const clientesService = {
  async getAll(): Promise<Cliente[]> {
    return clientesApi.getAll();
  },

  async getOne(id: string): Promise<Cliente> {
    return clientesApi.getOne(id);
  },

  async getMiPerfil(): Promise<Cliente> {
    return clientesApi.miPerfil();
  },

  async getStats(): Promise<ClienteStats> {
    return clientesApi.getStats();
  },

  async create(data: CreateClienteData): Promise<Cliente> {
    return clientesApi.create(data);
  },

  async update(id: string, data: UpdateClienteData): Promise<Cliente> {
    return clientesApi.update(id, data);
  },

  async desactivar(id: string): Promise<void> {
    return clientesApi.desactivar(id);
  },
};

export default clientesService;
