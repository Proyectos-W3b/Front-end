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

const store: Cliente[] = [
  { id: 'cli-001', usuarioId: 'usr-004', empresa: 'Acme Corp',        telefono: '+1 555 0101',  direccion: 'New York, USA',         estaActivo: true,  creadoEn: '2025-01-10' },
  { id: 'cli-002', usuarioId: 'usr-005', empresa: 'Tech Solutions IO', telefono: '+1 555 0202',  direccion: 'San Francisco, USA',    estaActivo: true,  creadoEn: '2025-02-05' },
  { id: 'cli-003', usuarioId: 'usr-006', empresa: 'Buildex Colombia',  telefono: '+57 310 0303', direccion: 'Bogotá, Colombia',      estaActivo: true,  creadoEn: '2024-11-01' },
  { id: 'cli-004', usuarioId: 'usr-007', empresa: 'Grupo Norma MX',    telefono: '+52 55 0404',  direccion: 'Ciudad de México, MX',  estaActivo: false, creadoEn: '2025-03-20' },
  { id: 'cli-005', usuarioId: 'usr-008', empresa: 'Visión 360 España', telefono: '+34 91 0505',  direccion: 'Madrid, España',        estaActivo: true,  creadoEn: '2025-04-15' },
];

function delay() { return new Promise((r) => setTimeout(r, 200)); }

const clientesService = {
  async getAll(): Promise<Cliente[]> {
    await delay();
    return [...store];
  },
  async getMiPerfil(): Promise<Cliente | null> {
    await delay();
    return store[0] ?? null;
  },
  async getStats(): Promise<ClienteStats> {
    await delay();
    const activos   = store.filter((c) => c.estaActivo).length;
    const inactivos = store.filter((c) => !c.estaActivo).length;
    return { total: store.length, activos, inactivos };
  },
  async create(data: CreateClienteData): Promise<Cliente> {
    await delay();
    const c: Cliente = {
      id:         `cli-${Date.now()}`,
      usuarioId:  data.usuarioId,
      empresa:    data.empresa,
      telefono:   data.telefono,
      direccion:  data.direccion,
      estaActivo: true,
      creadoEn:   new Date().toISOString().split('T')[0],
    };
    store.push(c);
    return c;
  },
  async update(id: string, data: UpdateClienteData): Promise<Cliente> {
    await delay();
    const idx = store.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Cliente no encontrado');
    store[idx] = { ...store[idx], ...data };
    return store[idx];
  },
  async desactivar(id: string): Promise<void> {
    await delay();
    const c = store.find((c) => c.id === id);
    if (c) c.estaActivo = false;
  },
};

export default clientesService;
