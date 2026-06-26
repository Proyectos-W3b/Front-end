import { useEffect, useState, FormEvent } from 'react';
import rrhhService from '../../services/rrhh.service';
import Modal from '../../components/ui/Modal';
import { FullPageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import type { Cargo, Departamento } from '../../types';

function normArray<T>(data: T[] | { data: T[] }): T[] {
  return Array.isArray(data) ? data : (data as any).data ?? [];
}

const EMPTY = { title: '', description: '', departmentId: '', baseSalary: 0, maxSalary: 0 };

export default function CargosPage() {
  const [items, setItems]             = useState<Cargo[]>([]);
  const [departamentos, setDeparts]   = useState<Departamento[]>([]);
  const [filterDept, setFilterDept]   = useState('');
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected]       = useState<Cargo | null>(null);
  const [form, setForm]               = useState(EMPTY);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  const load = async (deptId?: string) => {
    setLoading(true);
    try {
      const [c, d] = await Promise.all([
        rrhhService.getCargos(deptId),
        rrhhService.getDepartamentos(),
      ]);
      setItems(normArray(c));
      setDeparts(normArray(d));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setError(''); setModal('create'); };
  const openEdit   = (c: Cargo) => {
    setSelected(c);
    setForm({ title: c.title, description: c.description ?? '', departmentId: c.departmentId,
              baseSalary: c.baseSalary ?? 0, maxSalary: c.maxSalary ?? 0 });
    setError('');
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleFilter = (id: string) => {
    setFilterDept(id);
    load(id || undefined);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, baseSalary: +form.baseSalary, maxSalary: +form.maxSalary };
      if (modal === 'create') await rrhhService.createCargo(payload);
      else if (selected) await rrhhService.updateCargo(selected.id, payload);
      closeModal();
      load(filterDept || undefined);
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desactivar este cargo?')) return;
    await rrhhService.deleteCargo(id);
    load(filterDept || undefined);
  };

  const deptName = (id: string) => departamentos.find((d) => d.id === id)?.name ?? '—';

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Cargos</h2>
          <p className="text-sm text-gray-500">{items.length} cargo{items.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <select className="input w-52" value={filterDept} onChange={(e) => handleFilter(e.target.value)}>
            <option value="">Todos los departamentos</option>
            {departamentos.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button className="btn-primary" onClick={openCreate}>+ Nuevo cargo</button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="💼" title="Sin cargos"
          action={{ label: '+ Nuevo cargo', onClick: openCreate }} />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-th">Título</th>
                <th className="table-th">Departamento</th>
                <th className="table-th">Salario base</th>
                <th className="table-th">Salario máx.</th>
                <th className="table-th text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="table-td font-medium">{c.title}</td>
                  <td className="table-td text-gray-500">{deptName(c.departmentId)}</td>
                  <td className="table-td">{c.baseSalary ? `$${c.baseSalary.toLocaleString()}` : '—'}</td>
                  <td className="table-td">{c.maxSalary ? `$${c.maxSalary.toLocaleString()}` : '—'}</td>
                  <td className="table-td text-right">
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal !== null} onClose={closeModal}
        title={modal === 'create' ? 'Nuevo cargo' : 'Editar cargo'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div>
            <label className="label">Título *</label>
            <input className="input" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea className="input resize-none" rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Departamento *</label>
            <select className="input" value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })} required>
              <option value="">Seleccionar...</option>
              {departamentos.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Salario base</label>
              <input type="number" className="input" value={form.baseSalary}
                onChange={(e) => setForm({ ...form, baseSalary: +e.target.value })} min={0} />
            </div>
            <div>
              <label className="label">Salario máximo</label>
              <input type="number" className="input" value={form.maxSalary}
                onChange={(e) => setForm({ ...form, maxSalary: +e.target.value })} min={0} />
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
