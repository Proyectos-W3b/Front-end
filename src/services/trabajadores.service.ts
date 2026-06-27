import { usuariosApi } from './api.service';
import type { User, Trabajador, AsignacionTrabajador, CargoTrabajador, EstadoTrabajador } from '../types';

export interface CreateTrabajadorData {
  nombre: string;
  correo: string;
  contrasena: string;
  rolId?: string;
}

function userToTrabajador(u: User): Trabajador {
  return {
    id:           u.id,
    nombre:       u.nombre,
    apellido:     '',
    correo:       u.correo,
    cargo:        'desarrollador' as CargoTrabajador,
    departamento: '',
    estado:       'activo' as EstadoTrabajador,
    creadoEn:     new Date().toISOString(),
  };
}

const trabajadoresService = {
  async getAll(): Promise<Trabajador[]> {
    const users = await usuariosApi.getAll();
    return users.filter((u) => u.rol === 'trabajador').map(userToTrabajador);
  },

  async getOne(id: string): Promise<Trabajador> {
    const u = await usuariosApi.getOne(id);
    return userToTrabajador(u);
  },

  async create(data: CreateTrabajadorData): Promise<Trabajador> {
    const u = await usuariosApi.create({
      nombre:    data.nombre,
      correo:    data.correo,
      contrasena: data.contrasena,
      rolId:     data.rolId ?? '',
    });
    return userToTrabajador(u);
  },

  async update(id: string, data: Partial<CreateTrabajadorData>): Promise<Trabajador> {
    const u = await usuariosApi.update(id, {
      nombre:    data.nombre,
      correo:    data.correo,
      contrasena: data.contrasena,
      rolId:     data.rolId,
    });
    return userToTrabajador(u);
  },

  async remove(id: string): Promise<void> {
    return usuariosApi.remove(id);
  },

  async getAsignaciones(): Promise<AsignacionTrabajador[]> {
    return [];
  },

  async asignar(_data: { trabajadorId: string; proyectoId: string; rol: string }): Promise<void> {
    throw new Error('Asignaciones no disponibles en este sistema.');
  },

  async desasignar(_id: string): Promise<void> {
    throw new Error('Asignaciones no disponibles en este sistema.');
  },
};

export default trabajadoresService;
