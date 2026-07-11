// ─── Auth ────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'cliente' | 'trabajador';

export interface User {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  rolId?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── Projects ────────────────────────────────────────────────────────────────
export interface Project {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  estado: string;
  fechaInicio: string;
  fechaFin?: string;
  clienteId: string;
}

// ─── Incidents ───────────────────────────────────────────────────────────────
export type Prioridad        = 'baja' | 'media' | 'alta' | 'critica';
export type EstadoIncidencia = 'abierta' | 'en_proceso' | 'resuelta' | 'cerrada';

export interface Incidencia {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: EstadoIncidencia;
  proyectoId: string;
  clienteId: string;
  reportadoPorId: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// ─── Clientes ─────────────────────────────────────────────────────────────────
export interface Cliente {
  id: string;
  usuarioId: string;
  empresa: string;
  telefono?: string;
  direccion?: string;
  estaActivo: boolean;
  creadoEn: string;
}

export interface ClienteStats {
  total: number;
  activos: number;
  inactivos: number;
}

// ─── Actualizaciones de proyecto ─────────────────────────────────────────────
export interface ActualizacionProyecto {
  id: string;
  proyectoId: string;
  titulo: string;
  descripcion: string;
  porcentajeAvance: number;
  fecha: string;
}

// ─── Archivos de proyecto ─────────────────────────────────────────────────────
export interface ArchivoProyecto {
  id: string;
  proyectoId: string;
  nombre: string;
  url: string;
  tipo: string;
  fecha: string;
}

// ─── Fases de proyecto ────────────────────────────────────────────────────────
export type EstadoFase = 'pendiente' | 'en_progreso' | 'completado';

export interface Fase {
  id: string;
  proyectoId: string;
  nombre: string;
  orden: number;
  estado: EstadoFase;
}

// ─── Comentarios de incidencia ────────────────────────────────────────────────
export interface ComentarioIncidencia {
  id: string;
  incidenciaId: string;
  autorId: string;
  contenido: string;
  fechaCreacion: string;
}

// ─── Archivos de incidencia ───────────────────────────────────────────────────
export interface ArchivoIncidencia {
  id: string;
  incidenciaId: string;
  nombre: string;
  url: string;
  tipo: string;
  fecha: string;
}

// ─── Trabajadores ─────────────────────────────────────────────────────────────
export type EstadoTrabajador = 'activo' | 'inactivo';
export type CargoTrabajador  = 'desarrollador' | 'diseñador' | 'gerente' | 'analista' | 'qa';

export interface Trabajador {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  cargo: CargoTrabajador;
  departamento: string;
  estado: EstadoTrabajador;
  proyectoId?: string;
  creadoEn: string;
}

export interface AsignacionTrabajador {
  id: string;
  trabajadorId: string;
  proyectoId: string;
  rol: string;
  fechaAsignacion: string;
}

// ─── UI helpers ──────────────────────────────────────────────────────────────
export interface SelectOption {
  value: string;
  label: string;
}
