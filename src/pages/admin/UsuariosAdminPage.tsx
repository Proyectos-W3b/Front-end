import { useState, useEffect } from 'react';
import { usuariosApi, rolesApi } from '../../services/api.service';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import type { User } from '../../types';

interface RolOption { idRol: string; nombre: string; }

const EMPTY_FORM = { nombre: '', correo: '', contrasena: '', rolId: '' };

export default function UsuariosAdminPage() {
  const [users,    setUsers]    = useState<User[]>([]);
  const [roles,    setRoles]    = useState<RolOption[]>([]);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('');
  const [modal,    setModal]    = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<User | null>(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([usuariosApi.getAll(), rolesApi.getAll()])
      .then(([u, r]) => { setUsers(u); setRoles(r); })
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const matchRol = !filter || u.rol === filter;
    const q = search.toLowerCase();
    const matchSearch = !search || u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q);
    return matchRol && matchSearch;
  });

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal('create'); };
  const openEdit   = (u: User) => {
    setSelected(u);
    const rolId = u.rolId ?? roles.find((r) => r.nombre === u.rol)?.idRol ?? '';
    setForm({ nombre: u.nombre, correo: u.correo, contrasena: '', rolId });
    setError('');
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (modal === 'create') {
        if (!form.contrasena) { setError('La contraseña es requerida'); return; }
        const newUser = await usuariosApi.create({
          nombre: form.nombre, correo: form.correo,
          contrasena: form.contrasena, rolId: form.rolId,
        });
        setUsers((prev) => [...prev, newUser]);
      } else if (selected) {
        const payload: Record<string, string> = { nombre: form.nombre, correo: form.correo, rolId: form.rolId };
        if (form.contrasena) payload.contrasena = form.contrasena;
        const updated = await usuariosApi.update(selected.id, payload);
        setUsers((prev) => prev.map((u) => u.id === selected.id ? updated : u));
      }
      closeModal();
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await usuariosApi.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert('Error al eliminar usuario');
    }
  };

  const uniqueRoles = [...new Set(users.map((u) => u.rol))];

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
          <select className="input w-36" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Todos los roles</option>
            {uniqueRoles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button className="btn-primary" onClick={openCreate}>+ Nuevo usuario</button>
        </div>
      </div>

      {loading ? (
        <div className="card py-10 text-center text-gray-400 text-sm">Cargando usuarios...</div>
      ) : (
        <DataTable<User>
          columns={[
            {
              key: 'usuario', header: 'Usuario',
              render: (u) => (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.nombre[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-sm">{u.nombre}</span>
                </div>
              ),
            },
            { key: 'correo', header: 'Correo', render: (u) => <span className="text-sm text-gray-500">{u.correo}</span> },
            { key: 'rol', header: 'Rol', render: (u) => <Badge value={u.rol} /> },
            {
              key: 'acciones', header: 'Acciones', className: 'text-right',
              render: (u) => (
                <div className="flex justify-end gap-1.5">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>Eliminar</button>
                </div>
              ),
            },
          ]}
          data={filtered}
          emptyText="Sin resultados"
        />
      )}

      <Modal open={modal !== null} onClose={closeModal}
        title={modal === 'create' ? 'Nuevo usuario' : 'Editar usuario'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div>
            <label className="label">Nombre *</label>
            <input className="input" value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div>
            <label className="label">Correo *</label>
            <input type="email" className="input" value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })} required />
          </div>
          <div>
            <label className="label">Contraseña {modal === 'edit' ? '(dejar vacío para no cambiar)' : '*'}</label>
            <input type="password" className="input" value={form.contrasena}
              onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
              required={modal === 'create'} />
          </div>
          <div>
            <label className="label">Rol *</label>
            <select className="input" value={form.rolId}
              onChange={(e) => setForm({ ...form, rolId: e.target.value })} required>
              <option value="">Seleccionar rol</option>
              {roles.map((r) => <option key={r.idRol} value={r.idRol}>{r.nombre}</option>)}
            </select>
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
