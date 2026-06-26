import { useState } from 'react';
import { MOCK_USERS, MockUser } from '../../data/admin.mock';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import type { UserRole } from '../../types';

const ROLE_OPTIONS: UserRole[] = ['admin', 'manager', 'employee', 'client'];

const EMPTY: Omit<MockUser, 'id' | 'lastLogin' | 'createdAt'> = {
  nombre: '', apellido: '', email: '', role: 'employee', isActive: true,
};

export default function UsuariosAdminPage() {
  const [users, setUsers]       = useState<MockUser[]>(MOCK_USERS);
  const [filter, setFilter]     = useState<UserRole | ''>('');
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<MockUser | null>(null);
  const [form, setForm]         = useState(EMPTY);
  const [error, setError]       = useState('');

  const filtered = users.filter((u) => {
    const matchRole = !filter || u.role === filter;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      u.nombre.toLowerCase().includes(q) ||
      u.apellido.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const openCreate = () => { setForm(EMPTY); setError(''); setModal('create'); };
  const openEdit   = (u: MockUser) => { setSelected(u); setForm({ nombre: u.nombre, apellido: u.apellido, email: u.email, role: u.role, isActive: u.isActive }); setError(''); setModal('edit'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.includes('@')) { setError('Email inválido'); return; }
    if (modal === 'create') {
      const newUser: MockUser = { ...form, id: String(Date.now()), lastLogin: '—', createdAt: new Date().toISOString().split('T')[0] };
      setUsers((prev) => [...prev, newUser]);
    } else if (selected) {
      setUsers((prev) => prev.map((u) => u.id === selected.id ? { ...u, ...form } : u));
    }
    closeModal();
  };

  const toggleActive = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  const deleteUser = (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const fmtDate = (d: string) => d === '—' ? '—' : new Date(d).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-500">{filtered.length} de {users.length} usuario{users.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input className="input w-48" placeholder="Buscar..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
          <select className="input w-36" value={filter} onChange={(e) => setFilter(e.target.value as UserRole | '')}>
            <option value="">Todos los roles</option>
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button className="btn-primary" onClick={openCreate}>+ Nuevo usuario</button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-th">Usuario</th>
              <th className="table-th">Rol</th>
              <th className="table-th">Estado</th>
              <th className="table-th">Último acceso</th>
              <th className="table-th">Creado</th>
              <th className="table-th text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm">Sin resultados</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50">
                <td className="table-td">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {u.nombre[0]}{u.apellido[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{u.nombre} {u.apellido}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="table-td"><Badge value={u.role} /></td>
                <td className="table-td">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="table-td text-xs text-gray-500">{fmtDate(u.lastLogin)}</td>
                <td className="table-td text-xs text-gray-500">{u.createdAt}</td>
                <td className="table-td text-right">
                  <div className="flex justify-end gap-1.5">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>Editar</button>
                    <button className={`btn btn-sm ${u.isActive ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      onClick={() => toggleActive(u.id)}>
                      {u.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal !== null} onClose={closeModal}
        title={modal === 'create' ? 'Nuevo usuario' : 'Editar usuario'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div>
              <label className="label">Apellido *</label>
              <input className="input" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Rol *</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <span className="text-sm font-medium text-gray-700">Usuario activo</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
