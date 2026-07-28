import api from '../lib/api';
import type { Departamento, Cargo, Empleado, AsistenciaRecord, Genero, TipoContrato, EstadoAsistencia } from '../types';

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateEmpleadoData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender: Genero;
  hireDate: string;
  contractType: TipoContrato;
  baseSalary: number;
  departmentId: string;
  positionId: string;
}

export interface CreateAsistenciaData {
  employeeId: string;
  date: string;
  status: EstadoAsistencia;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

const rrhhService = {

  // Departamentos
  async getDepartamentos(): Promise<Departamento[]> {
    const { data } = await api.get('/rrhh/departamentos');
    return data;
  },
  async createDepartamento(payload: { name: string; description?: string }): Promise<Departamento> {
    const { data } = await api.post('/rrhh/departamentos', payload);
    return data;
  },
  async updateDepartamento(id: string, payload: Partial<{ name: string; description: string }>): Promise<Departamento> {
    const { data } = await api.patch(`/rrhh/departamentos/${id}`, payload);
    return data;
  },
  async deleteDepartamento(id: string): Promise<void> {
    await api.delete(`/rrhh/departamentos/${id}`);
  },

  // Cargos
  async getCargos(departmentId?: string): Promise<Cargo[]> {
    const { data } = await api.get('/rrhh/cargos', { params: departmentId ? { departmentId } : undefined });
    return data;
  },
  async createCargo(payload: { title: string; description?: string; departmentId: string; baseSalary?: number; maxSalary?: number }): Promise<Cargo> {
    const { data } = await api.post('/rrhh/cargos', payload);
    return data;
  },
  async updateCargo(id: string, payload: Partial<{ title: string; description: string; departmentId: string; baseSalary: number; maxSalary: number }>): Promise<Cargo> {
    const { data } = await api.patch(`/rrhh/cargos/${id}`, payload);
    return data;
  },
  async deleteCargo(id: string): Promise<void> {
    await api.delete(`/rrhh/cargos/${id}`);
  },

  // Empleados
  async getEmpleados(params?: { search?: string }): Promise<Empleado[]> {
    const { data } = await api.get('/rrhh/empleados', { params });
    return data;
  },
  async createEmpleado(payload: CreateEmpleadoData): Promise<Empleado> {
    const { data } = await api.post('/rrhh/empleados', payload);
    return data;
  },
  async updateEmpleado(id: string, payload: Partial<CreateEmpleadoData>): Promise<Empleado> {
    const { data } = await api.patch(`/rrhh/empleados/${id}`, payload);
    return data;
  },
  async terminarEmpleado(id: string): Promise<void> {
    await api.patch(`/rrhh/empleados/${id}/terminate`);
  },
  async deleteEmpleado(id: string): Promise<void> {
    await api.delete(`/rrhh/empleados/${id}`);
  },

  // Asistencia
  async getAsistencia(params?: { employeeId?: string }): Promise<AsistenciaRecord[]> {
    const { data } = await api.get('/rrhh/asistencia', { params });
    return data;
  },
  async createAsistencia(payload: CreateAsistenciaData): Promise<AsistenciaRecord> {
    const { data } = await api.post('/rrhh/asistencia', payload);
    return data;
  },
  async deleteAsistencia(id: string): Promise<void> {
    await api.delete(`/rrhh/asistencia/${id}`);
  },
  async getReporteMensual(employeeId: string, year: number, month: number): Promise<any> {
    const { data } = await api.get('/rrhh/asistencia/reporte', { params: { employeeId, year, month } });
    return data;
  },
};

export default rrhhService;
