import { useEffect, useState, FormEvent } from 'react';
import rrhhService from '../../services/rrhh.service';
import Modal from '../../components/ui/Modal';
import { FullPageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import type { Departamento } from '../../types';

function normArray<T>(data: T[] | { data: T[] }): T[] {
  return Array.isArray(data) ? data : data.data ?? [];
}

const EMPTY = { name: '', description: '' };

export default function DepartamentosPage() {
  const [items, setItems]     = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Departamento | null>(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true);
    try { setItems(normArray(await rrhhService.getDepartamentos())); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setError(''); setModal('create'); };
  const openEdit = (d: Departamento) => {
    setSelected(d);
    setForm({ name: d.name, description: d.description ?? '' });
    setError('');
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modal === 'create') await rrhhService.createDepartamento(form);
      else if (selected) await rrhhService.updateDepartamento(selected.id, form);
      closeModal();
      load();
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desactivar este departamento?')) return;
    await rrhhService.deleteDepartamento(id);
    load();
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Departamentos</h2>
          <p className="text-sm text-gray-500">{items.length} departamento{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Nuevo departamento</button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="🏢" title="Sin departamentos"
          action={{ label: '+ Nuevo departamento', onClick: openCreate }} />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-th">Nombre</th>
                <th className="table-th">Descripción</th>
                <th className="table-th">Estado</th>
                <th className="table-th text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <td className="table-td font-medium">{d.name}</td>
                  <td className="table-td text-gray-500">{d.description ?? '—'}</td>
                  <td className="table-td">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {d.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="table-td text-right">
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>Desactivar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal !== null} onClose={closeModal}
        title={modal === 'create' ? 'Nuevo departamento' : 'Editar departamento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div>
            <label className="label">Nombre *</label>
            <input className="input" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea className="input resize-none" rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
