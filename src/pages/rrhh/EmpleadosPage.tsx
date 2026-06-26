import { useEffect, useState, FormEvent } from 'react';
import rrhhService, { CreateEmpleadoData } from '../../services/rrhh.service';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { FullPageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import type { Empleado, Departamento, Cargo, Genero, TipoContrato } from '../../types';

function normArray<T>(data: T[] | { data: T[] } | any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

const EMPTY: CreateEmpleadoData = {
  firstName: '', lastName: '', email: '', phone: '',
  gender: 'MASCULINO', hireDate: new Date().toISOString().split('T')[0],
  contractType: 'TIEMPO_COMPLETO', baseSalary: 0,
  departmentId: '', positionId: '',
};

export default function EmpleadosPage() {
  const [empleados, setEmpleados]   = useState<Empleado[]>([]);
  const [departamentos, setDeparts] = useState<Departamento[]>([]);
  const [cargos, setCargos]         = useState<Cargo[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [modal, setModal]           = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected]     = useState<Empleado | null>(null);
  const [form, setForm]             = useState<CreateEmpleadoData>(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [e, d, c] = await Promise.all([
        rrhhService.getEmpleados({ search: search || undefined }),
        rrhhService.getDepartamentos(),
        rrhhService.getCargos(),
      ]);
      setEmpleados(normArray(e));
      setDeparts(normArray(d));
      setCargos(normArray(c));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setError(''); setModal('create'); };
  const openEdit   = (emp: Empleado) => {
    setSelected(emp);
    setForm({
      firstName: emp.firstName, lastName: emp.lastName,
      email: emp.email, phone: emp.phone ?? '',
      gender: emp.gender, hireDate: emp.hireDate?.split('T')[0] ?? '',
      contractType: emp.contractType, baseSalary: emp.baseSalary,
      departmentId: emp.departmentId, positionId: emp.positionId,
    });
    setError('');
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, baseSalary: +form.baseSalary };
      if (modal === 'create') await rrhhService.createEmpleado(payload);
      else if (selected) await rrhhService.updateEmpleado(selected.id, payload);
      closeModal();
      load();
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleTerminate = async (id: string, name: string) => {
    if (!confirm(`¿Dar de baja a ${name}?`)) return;
    await rrhhService.terminarEmpleado(id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este empleado?')) return;
    await rrhhService.deleteEmpleado(id);
    load();
  };

  const deptName = (id: string) => departamentos.find((d) => d.id === id)?.name ?? '—';
  const cargoName = (id: string) => cargos.find((c) => c.id === id)?.title ?? '—';

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Empleados</h2>
          <p className="text-sm text-gray-500">{empleados.length} empleado{empleados.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input className="input w-52" placeholder="Buscar por nombre..." value={search}
              onChange={(e) => setSearch(e.target.value)} />
            <button type="submit" className="btn-secondary">Buscar</button>
          </form>
          <button className="btn-primary" onClick={openCreate}>+ Nuevo empleado</button>
        </div>
      </div>

      {empleados.length === 0 ? (
        <EmptyState icon="👥" title="Sin empleados"
          action={{ label: '+ Nuevo empleado', onClick: openCreate }} />
      ) : (
        <div className="card p-0 overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-th">Empleado</th>
                <th className="table-th">Email</th>
                <th className="table-th">Departamento</th>
                <th className="table-th">Cargo</th>
                <th className="table-th">Contrato</th>
                <th className="table-th">Estado</th>
                <th className="table-th text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {empleados.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50">
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                        {emp.firstName[0]}
                      </div>
                      <span className="font-medium">{emp.firstName} {emp.lastName}</span>
                    </div>
                  </td>
                  <td className="table-td text-gray-500">{emp.email}</td>
                  <td className="table-td text-gray-500">{deptName(emp.departmentId)}</td>
                  <td className="table-td text-gray-500">{cargoName(emp.positionId)}</td>
                  <td className="table-td text-xs text-gray-500">{emp.contractType?.replace(/_/g, ' ')}</td>
                  <td className="table-td"><Badge value={emp.status} /></td>
                  <td className="table-td text-right">
                    <div className="flex justify-end gap-1.5">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(emp)}>Editar</button>
                      {emp.status !== 'TERMINADO' && (
                        <button className="btn btn-sm bg-orange-100 text-orange-700 hover:bg-orange-200"
                          onClick={() => handleTerminate(emp.id, `${emp.firstName} ${emp.lastName}`)}>
                          Dar de baja
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal empleado */}
      <Modal open={modal !== null} onClose={closeModal} size="lg"
        title={modal === 'create' ? 'Nuevo empleado' : 'Editar empleado'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input className="input" value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div>
              <label className="label">Apellido *</label>
              <input className="input" value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input className="input" value={form.phone ?? ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Género *</label>
              <select className="input" value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as Genero })}>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div>
              <label className="label">Fecha contratación *</label>
              <input type="date" className="input" value={form.hireDate}
                onChange={(e) => setForm({ ...form, hireDate: e.target.value })} required />
            </div>
            <div>
              <label className="label">Tipo contrato *</label>
              <select className="input" value={form.contractType}
                onChange={(e) => setForm({ ...form, contractType: e.target.value as TipoContrato })}>
                <option value="TIEMPO_COMPLETO">Tiempo completo</option>
                <option value="MEDIO_TIEMPO">Medio tiempo</option>
                <option value="CONTRATISTA">Contratista</option>
                <option value="PRACTICANTE">Practicante</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Departamento *</label>
              <select className="input" value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {departamentos.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Cargo *</label>
              <select className="input" value={form.positionId}
                onChange={(e) => setForm({ ...form, positionId: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {cargos.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Salario base *</label>
              <input type="number" className="input" value={form.baseSalary}
                onChange={(e) => setForm({ ...form, baseSalary: +e.target.value })} min={0} required />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
