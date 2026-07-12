// ─────────────────────────────────────────────────────────────────────────────
// Conexiones centralizadas con el API Gateway (http://localhost:3000/api)
// Organizado por dominio: auth · usuarios · clientes · proyects · incidencias
//                         actualizaciones · archivos · comentarios
// ─────────────────────────────────────────────────────────────────────────────
import api from '../lib/api';
import type {
  AuthResponse,
  User,
  Cliente,
  ClienteStats,
  Project,
  Incidencia,
  Prioridad,
  EstadoIncidencia,
  ActualizacionProyecto,
  ArchivoProyecto,
  Fase,
  ArchivoIncidencia,
  ComentarioIncidencia,
  Mensaje,
} from '../types';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  async login(correo: string, contrasena: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', { correo, contrasena });
    return { user: data.user, token: data.access_token };
  },
};

// ── Usuarios ──────────────────────────────────────────────────────────────────
// El backend devuelve entidades TypeORM: { idUsuario, correo: { correo }, rol: { nombre } }
// Esta función normaliza al tipo User del frontend: { id, correo (string), rol (string) }
function normalizeUsuario(raw: any): User {
  return {
    id:     raw.idUsuario ?? raw.id ?? '',
    nombre: raw.nombre ?? '',
    correo: typeof raw.correo === 'string' ? raw.correo : (raw.correo?.correo ?? ''),
    rol:    typeof raw.rol    === 'string' ? raw.rol    : (raw.rol?.nombre    ?? ''),
    rolId:  typeof raw.rol    === 'object' ? (raw.rol?.idRol ?? '') : '',
    fotoUrl: raw.fotoUrl,
  };
}

export const usuariosApi = {
  async getAll(): Promise<User[]> {
    const { data } = await api.get('/usuarios');
    return (Array.isArray(data) ? data : []).map(normalizeUsuario);
  },

  async getOne(id: string): Promise<User> {
    const { data } = await api.get(`/usuarios/${id}`);
    return normalizeUsuario(data);
  },

  async create(payload: {
    nombre: string;
    correo: string;
    contrasena: string;
    rolId: string;
  }): Promise<User> {
    const { data } = await api.post('/usuarios', payload);
    return normalizeUsuario(data);
  },

  async update(id: string, payload: Partial<{ nombre: string; correo: string; contrasena: string; rolId: string; fotoUrl: string }>): Promise<User> {
    const { data } = await api.patch(`/usuarios/${id}`, payload);
    return normalizeUsuario(data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },
};

// ── Roles ─────────────────────────────────────────────────────────────────────
export const rolesApi = {
  async getAll(): Promise<{ idRol: string; nombre: string }[]> {
    const { data } = await api.get('/roles');
    return data;
  },
};

// ── Clientes ──────────────────────────────────────────────────────────────────
export const clientesApi = {
  async getAll(): Promise<Cliente[]> {
    const { data } = await api.get('/clientes');
    return data;
  },

  async getOne(id: string): Promise<Cliente> {
    const { data } = await api.get(`/clientes/${id}`);
    return data;
  },

  async miPerfil(): Promise<Cliente> {
    const { data } = await api.get('/clientes/mi-perfil');
    return data;
  },

  async getStats(): Promise<ClienteStats> {
    const all = await clientesApi.getAll();
    const activos   = all.filter((c) => c.estaActivo).length;
    const inactivos = all.filter((c) => !c.estaActivo).length;
    return { total: all.length, activos, inactivos };
  },

  async create(payload: {
    usuarioId: string;
    empresa: string;
    telefono?: string;
    direccion?: string;
  }): Promise<Cliente> {
    const { data } = await api.post('/clientes', payload);
    return data;
  },

  async update(id: string, payload: Partial<{ empresa: string; telefono: string; direccion: string }>): Promise<Cliente> {
    const { data } = await api.patch(`/clientes/${id}`, { ...payload, id });
    return data;
  },

  async desactivar(id: string): Promise<void> {
    await api.delete(`/clientes/${id}`);
  },
};

// ── Proyectos ─────────────────────────────────────────────────────────────────
export const proyectsApi = {
  async getAll(params?: { page?: number; limit?: number }): Promise<Project[]> {
    const { data } = await api.get('/proyects', { params });
    return Array.isArray(data) ? data : data.data ?? [];
  },

  async getOne(id: string): Promise<Project> {
    const { data } = await api.get(`/proyects/${id}`);
    return data;
  },

  async create(payload: {
    clienteId: string;
    nombre: string;
    descripcion: string;
    tipo: string;
    estado: string;
    fechaInicio: string;
    fechaFin?: string;
  }): Promise<Project> {
    const { data } = await api.post('/proyects', payload);
    return data;
  },

  async update(id: string, payload: Partial<{ nombre: string; descripcion: string; tipo: string; estado: string; fechaInicio: string; fechaFin: string }>): Promise<Project> {
    const { data } = await api.patch(`/proyects/${id}`, { ...payload, id });
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/proyects/${id}`);
  },
};

// ── Incidencias ───────────────────────────────────────────────────────────────
export const incidenciasApi = {
  async getAll(params?: { page?: number; limit?: number }): Promise<Incidencia[]> {
    const { data } = await api.get('/incidencias', { params });
    return Array.isArray(data) ? data : data.data ?? [];
  },

  async getOne(id: string): Promise<Incidencia> {
    const { data } = await api.get(`/incidencias/${id}`);
    return data;
  },

  async create(payload: {
    titulo: string;
    descripcion: string;
    proyectoId: string;
    prioridad: Prioridad;
    estado: EstadoIncidencia;
  }): Promise<Incidencia> {
    const { data } = await api.post('/incidencias', payload);
    return data;
  },

  async update(id: string, payload: Partial<{ titulo: string; descripcion: string; prioridad: Prioridad; estado: EstadoIncidencia }>): Promise<Incidencia> {
    const { data } = await api.patch(`/incidencias/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/incidencias/${id}`);
  },
};

// ── Actualizaciones de proyecto ───────────────────────────────────────────────
export const actualizacionesApi = {
  async getAll(params?: { page?: number; limit?: number }): Promise<ActualizacionProyecto[]> {
    const { data } = await api.get('/actualizaciones', { params });
    return Array.isArray(data) ? data : data.data ?? [];
  },

  async getByProyecto(proyectoId: string): Promise<ActualizacionProyecto[]> {
    const all = await actualizacionesApi.getAll({ limit: 100 });
    return all.filter((a) => a.proyectoId === proyectoId);
  },

  async getOne(id: string): Promise<ActualizacionProyecto> {
    const { data } = await api.get(`/actualizaciones/${id}`);
    return data;
  },

  async create(payload: {
    proyectoId: string;
    titulo: string;
    descripcion: string;
    porcentajeAvance: number;
  }): Promise<ActualizacionProyecto> {
    const { data } = await api.post('/actualizaciones', payload);
    return data;
  },

  async update(id: string, payload: Partial<{ titulo: string; descripcion: string; porcentajeAvance: number }>): Promise<ActualizacionProyecto> {
    const { data } = await api.patch(`/actualizaciones/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/actualizaciones/${id}`);
  },
};

// ── Archivos de proyecto ──────────────────────────────────────────────────────
export const archivosProyectoApi = {
  async getByProyecto(proyectoId: string): Promise<ArchivoProyecto[]> {
    const { data } = await api.get(`/archivos/proyecto/${proyectoId}`);
    return Array.isArray(data) ? data : data.data ?? [];
  },

  async getOne(id: string): Promise<ArchivoProyecto> {
    const { data } = await api.get(`/archivos/${id}`);
    return data;
  },

  async create(payload: {
    proyectoId: string;
    nombre: string;
    url: string;
    tipo: string;
  }): Promise<ArchivoProyecto> {
    const { data } = await api.post('/archivos', payload);
    return data;
  },

  async update(id: string, payload: Partial<{ nombre: string; url: string; tipo: string }>): Promise<ArchivoProyecto> {
    const { data } = await api.patch(`/archivos/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/archivos/${id}`);
  },
};

// ── Fases de proyecto ─────────────────────────────────────────────────────────
export const fasesApi = {
  async getByProyecto(proyectoId: string): Promise<Fase[]> {
    const { data } = await api.get(`/fases/proyecto/${proyectoId}`);
    return Array.isArray(data) ? data : data.data ?? [];
  },

  async create(payload: { proyectoId: string; nombre: string; orden?: number }): Promise<Fase> {
    const { data } = await api.post('/fases', payload);
    return data;
  },

  async update(id: string, payload: Partial<{ nombre: string; orden: number; estado: string }>): Promise<Fase> {
    const { data } = await api.patch(`/fases/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/fases/${id}`);
  },

  async reorder(items: { id: string; orden: number }[]): Promise<void> {
    await api.patch('/fases/reorder', { items });
  },
};

// ── Archivos de incidencia ────────────────────────────────────────────────────
export const archivosIncidenciaApi = {
  async getByIncidencia(incidenciaId: string): Promise<ArchivoIncidencia[]> {
    const { data } = await api.get(`/archivos-incidencias/incidencia/${incidenciaId}`);
    return Array.isArray(data) ? data : data.data ?? [];
  },

  async create(payload: {
    incidenciaId: string;
    nombre: string;
    url: string;
    tipo: string;
  }): Promise<ArchivoIncidencia> {
    const { data } = await api.post('/archivos-incidencias', payload);
    return data;
  },

  async update(id: string, payload: Partial<{ nombre: string; url: string; tipo: string }>): Promise<ArchivoIncidencia> {
    const { data } = await api.patch(`/archivos-incidencias/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/archivos-incidencias/${id}`);
  },
};

// ── Comentarios de incidencia ─────────────────────────────────────────────────
export const comentariosApi = {
  async getByIncidencia(incidenciaId: string): Promise<ComentarioIncidencia[]> {
    const { data } = await api.get(`/comentarios-incidencias/incidencia/${incidenciaId}`);
    return Array.isArray(data) ? data : data.data ?? [];
  },

  async create(payload: {
    incidenciaId: string;
    autorId: string;
    contenido: string;
  }): Promise<ComentarioIncidencia> {
    const { data } = await api.post('/comentarios-incidencias', payload);
    return data;
  },

  async update(id: string, payload: { contenido: string }): Promise<ComentarioIncidencia> {
    const { data } = await api.patch(`/comentarios-incidencias/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/comentarios-incidencias/${id}`);
  },
};

// ── Uploads (Google Cloud Storage) ─────────────────────────────────────────────
export type CarpetaGCS = 'chat' | 'perfiles' | 'proyectos' | 'incidencias';

export const uploadsApi = {
  async getSignedUploadUrl(
    nombre: string,
    contentType: string,
    carpeta: CarpetaGCS = 'chat',
  ): Promise<{ uploadUrl: string; objectPath: string }> {
    const { data } = await api.post('/uploads/signed-url', { nombre, contentType, carpeta });
    return data;
  },

  /** Sube un archivo directo a GCS vía URL firmada y devuelve el objectPath a persistir. */
  async subirArchivo(file: File, carpeta: CarpetaGCS): Promise<string> {
    const contentType = file.type || 'application/octet-stream';
    const { uploadUrl, objectPath } = await this.getSignedUploadUrl(file.name, contentType, carpeta);
    await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file });
    return objectPath;
  },
};

// ── Mensajes (chat cliente ↔ admin) ────────────────────────────────────────────
export const mensajesApi = {
  async getAll(): Promise<Mensaje[]> {
    const { data } = await api.get('/mensajes');
    return Array.isArray(data) ? data : data.data ?? [];
  },

  async getByCliente(clienteId: string): Promise<Mensaje[]> {
    const { data } = await api.get(`/mensajes/cliente/${clienteId}`);
    return Array.isArray(data) ? data : data.data ?? [];
  },

  async marcarLeidos(clienteId: string): Promise<void> {
    await api.patch(`/mensajes/cliente/${clienteId}/leer`);
  },
};
