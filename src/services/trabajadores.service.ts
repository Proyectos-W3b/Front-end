import type { Trabajador, AsignacionTrabajador, CargoTrabajador, EstadoTrabajador } from '../types';

const tStore: Trabajador[] = [
  { id: 't1', nombre: 'Carlos', apellido: 'Ramírez', correo: 'carlos.r@empresa.com', cargo: 'desarrollador', departamento: 'Tecnología', estado: 'activo',   proyectoId: 'p1', creadoEn: '2025-01-10' },
  { id: 't2', nombre: 'Sofía',  apellido: 'Torres',  correo: 'sofia.t@empresa.com',  cargo: 'diseñador',     departamento: 'Diseño',     estado: 'activo',   proyectoId: 'p2', creadoEn: '2025-02-01' },
  { id: 't3', nombre: 'Miguel', apellido: 'Herrera', correo: 'miguel.h@empresa.com', cargo: 'gerente',       departamento: 'Tecnología', estado: 'activo',   creadoEn: '2025-03-01' },
  { id: 't4', nombre: 'Laura',  apellido: 'Jiménez', correo: 'laura.j@empresa.com',  cargo: 'analista',      departamento: 'QA',         estado: 'inactivo', creadoEn: '2025-04-01' },
];

const aStore: AsignacionTrabajador[] = [
  { id: 'as1', trabajadorId: 't1', proyectoId: 'p1', rol: 'Desarrollador Backend', fechaAsignacion: '2025-01-15' },
  { id: 'as2', trabajadorId: 't2', proyectoId: 'p2', rol: 'UI/UX Designer',        fechaAsignacion: '2025-02-05' },
];

function delay() { return new Promise((r) => setTimeout(r, 200)); }

const trabajadoresService = {
  async getAll(): Promise<Trabajador[]> {
    await delay();
    return [...tStore];
  },
  async getAsignaciones(): Promise<AsignacionTrabajador[]> {
    await delay();
    return [...aStore];
  },
  async create(data: {
    nombre: string; apellido: string; correo: string;
    cargo: CargoTrabajador; departamento: string; estado?: EstadoTrabajador;
  }): Promise<Trabajador> {
    await delay();
    const t: Trabajador = {
      id:           `t${Date.now()}`,
      nombre:       data.nombre,
      apellido:     data.apellido,
      correo:       data.correo,
      cargo:        data.cargo,
      departamento: data.departamento,
      estado:       data.estado ?? 'activo',
      creadoEn:     new Date().toISOString().split('T')[0],
    };
    tStore.push(t);
    return t;
  },
  async update(id: string, data: Partial<Omit<Trabajador, 'id' | 'creadoEn'>>): Promise<Trabajador> {
    await delay();
    const idx = tStore.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Trabajador no encontrado');
    tStore[idx] = { ...tStore[idx], ...data };
    return tStore[idx];
  },
  async remove(id: string): Promise<void> {
    await delay();
    const idx = tStore.findIndex((t) => t.id === id);
    if (idx !== -1) tStore.splice(idx, 1);
  },
  async asignar(data: { trabajadorId: string; proyectoId: string; rol: string }): Promise<AsignacionTrabajador> {
    await delay();
    const a: AsignacionTrabajador = {
      id:               `as${Date.now()}`,
      trabajadorId:     data.trabajadorId,
      proyectoId:       data.proyectoId,
      rol:              data.rol,
      fechaAsignacion:  new Date().toISOString().split('T')[0],
    };
    aStore.push(a);
    const tIdx = tStore.findIndex((t) => t.id === data.trabajadorId);
    if (tIdx !== -1) tStore[tIdx].proyectoId = data.proyectoId;
    return a;
  },
  async desasignar(id: string): Promise<void> {
    await delay();
    const idx = aStore.findIndex((a) => a.id === id);
    if (idx !== -1) {
      const tIdx = tStore.findIndex((t) => t.id === aStore[idx].trabajadorId);
      if (tIdx !== -1) tStore[tIdx].proyectoId = undefined;
      aStore.splice(idx, 1);
    }
  },
};

export default trabajadoresService;
