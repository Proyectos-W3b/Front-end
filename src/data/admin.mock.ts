import type { UserRole } from '../types';

export interface MockUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  accion: string;
  usuario: string;
  modulo: string;
  ip: string;
  fecha: string;
  resultado: 'exitoso' | 'fallido' | 'advertencia';
}

export interface Permission {
  modulo: string;
  admin: boolean;
  manager: boolean;
  employee: boolean;
  client: boolean;
}

export const MOCK_USERS: MockUser[] = [
  { id: '1', nombre: 'Carlos',   apellido: 'Ramírez',  email: 'carlos@launchernet.com',  role: 'admin',    isActive: true,  lastLogin: '2026-06-18T08:32:00Z', createdAt: '2025-01-10' },
  { id: '2', nombre: 'Sofía',    apellido: 'Torres',   email: 'sofia@launchernet.com',   role: 'manager',  isActive: true,  lastLogin: '2026-06-17T16:45:00Z', createdAt: '2025-02-14' },
  { id: '3', nombre: 'Miguel',   apellido: 'Herrera',  email: 'miguel@launchernet.com',  role: 'employee', isActive: true,  lastLogin: '2026-06-18T07:10:00Z', createdAt: '2025-03-01' },
  { id: '4', nombre: 'Valentina',apellido: 'López',    email: 'valentina@empresa.com',   role: 'client',   isActive: true,  lastLogin: '2026-06-15T11:20:00Z', createdAt: '2025-03-15' },
  { id: '5', nombre: 'Andrés',   apellido: 'Morales',  email: 'andres@launchernet.com',  role: 'employee', isActive: false, lastLogin: '2026-05-30T09:00:00Z', createdAt: '2025-04-02' },
  { id: '6', nombre: 'Laura',    apellido: 'Jiménez',  email: 'laura@launchernet.com',   role: 'manager',  isActive: true,  lastLogin: '2026-06-18T06:55:00Z', createdAt: '2025-04-20' },
  { id: '7', nombre: 'Diego',    apellido: 'Castro',   email: 'diego@empresa2.com',      role: 'client',   isActive: true,  lastLogin: '2026-06-10T14:30:00Z', createdAt: '2025-05-05' },
  { id: '8', nombre: 'Camila',   apellido: 'Vargas',   email: 'camila@launchernet.com',  role: 'employee', isActive: true,  lastLogin: '2026-06-17T18:00:00Z', createdAt: '2025-05-18' },
];

export const MOCK_LOGS: AuditLog[] = [
  { id: '1',  accion: 'Inicio de sesión',          usuario: 'carlos@launchernet.com',    modulo: 'Auth',      ip: '192.168.1.10',  fecha: '2026-06-18T08:32:14Z', resultado: 'exitoso' },
  { id: '2',  accion: 'Crear proyecto',             usuario: 'sofia@launchernet.com',     modulo: 'Proyectos', ip: '192.168.1.22',  fecha: '2026-06-18T08:15:00Z', resultado: 'exitoso' },
  { id: '3',  accion: 'Intento de acceso denegado', usuario: 'unknown@hack.com',          modulo: 'Auth',      ip: '203.0.113.55',  fecha: '2026-06-18T07:58:32Z', resultado: 'fallido' },
  { id: '4',  accion: 'Eliminar incidencia',        usuario: 'miguel@launchernet.com',    modulo: 'Incidencias',ip:'192.168.1.30', fecha: '2026-06-18T07:45:00Z', resultado: 'exitoso' },
  { id: '5',  accion: 'Actualizar empleado',        usuario: 'laura@launchernet.com',     modulo: 'RRHH',      ip: '192.168.1.45',  fecha: '2026-06-17T18:22:11Z', resultado: 'exitoso' },
  { id: '6',  accion: 'Exportar reporte',           usuario: 'sofia@launchernet.com',     modulo: 'Reportes',  ip: '192.168.1.22',  fecha: '2026-06-17T17:10:00Z', resultado: 'advertencia' },
  { id: '7',  accion: 'Dar de baja empleado',       usuario: 'carlos@launchernet.com',    modulo: 'RRHH',      ip: '192.168.1.10',  fecha: '2026-06-17T16:50:00Z', resultado: 'exitoso' },
  { id: '8',  accion: 'Inicio de sesión fallido',   usuario: 'miguel@launchernet.com',    modulo: 'Auth',      ip: '10.0.0.5',      fecha: '2026-06-17T15:30:00Z', resultado: 'fallido' },
  { id: '9',  accion: 'Crear departamento',         usuario: 'carlos@launchernet.com',    modulo: 'RRHH',      ip: '192.168.1.10',  fecha: '2026-06-17T14:20:00Z', resultado: 'exitoso' },
  { id: '10', accion: 'Actualizar proyecto',        usuario: 'sofia@launchernet.com',     modulo: 'Proyectos', ip: '192.168.1.22',  fecha: '2026-06-17T13:05:00Z', resultado: 'exitoso' },
  { id: '11', accion: 'Registrar asistencia',       usuario: 'camila@launchernet.com',    modulo: 'RRHH',      ip: '192.168.1.60',  fecha: '2026-06-17T08:01:00Z', resultado: 'exitoso' },
  { id: '12', accion: 'Cierre de sesión',           usuario: 'diego@empresa2.com',        modulo: 'Auth',      ip: '10.10.5.8',     fecha: '2026-06-16T17:59:00Z', resultado: 'exitoso' },
];

export const PERMISSIONS: Permission[] = [
  { modulo: 'Dashboard',          admin: true,  manager: true,  employee: true,  client: true  },
  { modulo: 'Proyectos — ver',    admin: true,  manager: true,  employee: true,  client: true  },
  { modulo: 'Proyectos — crear',  admin: true,  manager: true,  employee: false, client: false },
  { modulo: 'Proyectos — editar', admin: true,  manager: true,  employee: false, client: false },
  { modulo: 'Proyectos — eliminar',admin: true, manager: false, employee: false, client: false },
  { modulo: 'Incidencias — ver',  admin: true,  manager: true,  employee: true,  client: true  },
  { modulo: 'Incidencias — crear',admin: true,  manager: true,  employee: true,  client: false },
  { modulo: 'Incidencias — eliminar',admin: true,manager: false,employee: false, client: false },
  { modulo: 'RRHH — ver',         admin: true,  manager: true,  employee: false, client: false },
  { modulo: 'RRHH — gestionar',   admin: true,  manager: false, employee: false, client: false },
  { modulo: 'Admin — usuarios',   admin: true,  manager: false, employee: false, client: false },
  { modulo: 'Admin — auditoría',  admin: true,  manager: false, employee: false, client: false },
  { modulo: 'Admin — configuración',admin: true,manager: false, employee: false, client: false },
];

export const SYSTEM_STATS = {
  totalUsuarios: 8,
  usuariosActivos: 6,
  totalProyectos: 14,
  proyectosActivos: 9,
  totalIncidencias: 37,
  incidenciasAbiertas: 12,
  uptimeDias: 127,
  versionSistema: '1.0.0',
};
