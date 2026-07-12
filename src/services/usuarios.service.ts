import { usuariosApi, rolesApi } from './api.service';
import type { User } from '../types';

export interface CreateUsuarioData {
  nombre: string;
  correo: string;
  contrasena: string;
}

const usuariosService = {
  async getAll(): Promise<User[]> {
    return usuariosApi.getAll();
  },

  async getOne(id: string): Promise<User> {
    return usuariosApi.getOne(id);
  },

  async getRoles(): Promise<{ idRol: string; nombre: string }[]> {
    return rolesApi.getAll();
  },

  async create(data: CreateUsuarioData & { rolId: string }): Promise<User> {
    return usuariosApi.create(data);
  },

  async update(id: string, data: Partial<{ nombre: string; correo: string; contrasena: string; rolId: string }>): Promise<User> {
    return usuariosApi.update(id, data);
  },

  async remove(id: string): Promise<void> {
    return usuariosApi.remove(id);
  },
};

export default usuariosService;
