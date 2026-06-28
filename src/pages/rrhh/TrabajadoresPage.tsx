import { useEffect, useState, FormEvent } from 'react';
import { UserPlus, Trash2, Pencil, X } from 'lucide-react';
import trabajadoresService from '../../services/trabajadores.service';
import { rolesApi } from '../../services/api.service';
import { FullPageSpinner } from '../../components/ui/Spinner';
import Spinner from '../../components/ui/Spinner';
import type { User } from '../../types';

interface CreateForm {
  nombre:     string;
  correo:     string;
  contrasena: string;
  rolId:      string;
}

interface EditForm {
  nombre: string;
  correo: string;
}

const EMPTY_CREATE: CreateForm = { nombre: '', correo: '', contrasena: '', rolId: '' };
const EMPTY_EDIT:   EditForm   = { nombre: '', correo: '' };

// ── Modal crear/editar ────────────────────────────────────────────────────────
function ModalTrabajador({
  inicial,
  roles,
  onGuardar,
  onCerrar,
}: {
  inicial?: User;
  roles: { idRol: string; nombre: string }[];
  onGuardar: (data: any) => Promise<void>;
  onCerrar: () => void;
}) {
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE);
  const [editForm,   setEditForm]   = useState<EditForm>(
    inicial ? { nombre: inicial.nombre, correo: inicial.correo } : EMPTY_EDIT,
  );
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onGuardar(inicial ? editForm : createForm);
      onCerrar();
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">
            {inicial ? 'Editar usuario' : 'Nuevo usuario'}
          </h3>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</p>
          )}

          <div>
            <label className="label">Nombre completo *</label>
            <input
              className="input"
              value={inicial ? editForm.nombre : createForm.nombre}
              onChange={(e) =>
                inicial
                  ? setEditForm((f) => ({ ...f, nombre: e.target.value }))
                  : setCreateForm((f) => ({ ...f, nombre: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="label">Correo *</label>
            <input
              type="email"
              className="input"
              value={inicial ? editForm.correo : createForm.correo}
              onChange={(e) =>
                inicial
                  ? setEditForm((f) => ({ ...f, correo: e.target.value }))
                  : setCreateForm((f) => ({ ...f, correo: e.target.value }))
              }
              required
            />
          </div>

          {!inicial && (
            <>
              <div>
                <label className="label">Contraseña *</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Mínimo 6 caracteres"
                  value={createForm.contrasena}
                  onChange={(e) => setCreateForm((f) => ({ ...f, contrasena: e.target.value }))}
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="label">Rol *</label>
                <select
                  className="input"
                  value={createForm.rolId}
                  onChange={(e) => setCreateForm((f) => ({ ...f, rolId: e.target.value }))}
                  required
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map((r) => (
                    <option key={r.idRol} value={r.idRol} className="capitalize">
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCerrar} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Spinner size="sm" /> : (inicial ? 'Guardar cambios' : 'Crear usuario')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function TrabajadoresPage() {
  const [usuarios,    setUsuarios]    = useState<User[]>([]);
  const [roles,       setRoles]       = useState<{ idRol: string; nombre: string }[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [modalNuevo,  setModalNuevo]  = useState(false);
  const [modalEditar, setModalEditar] = useState<User | null>(null);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        trabajadoresService.getAll(),
        rolesApi.getAll(),
      ]);
      setUsuarios(u);
      setRoles(r);
    } catch {
      /* sin datos */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleCrear  = (data: any) => trabajadoresService.create(data).then(cargarDatos);
  const handleEditar = (data: any) => trabajadoresService.update(modalEditar!.id, data).then(cargarDatos);

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    await trabajadoresService.remove(id);
    cargarDatos();
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Usuarios</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setModalNuevo(true)} className="btn-primary gap-2 flex items-center">
          <UserPlus className="w-4 h-4" /> Nuevo usuario
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-th">Nombre</th>
              <th className="table-th">Correo</th>
              <th className="table-th">Rol</th>
              <th className="table-th text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-slate-400">
                  Sin usuarios registrados
                </td>
              </tr>
            ) : usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="table-td font-medium text-slate-900">{u.nombre}</td>
                <td className="table-td text-slate-500">{u.correo}</td>
                <td className="table-td">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                    {u.rol}
                  </span>
                </td>
                <td className="table-td">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setModalEditar(u)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEliminar(u.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      {modalNuevo  && (
        <ModalTrabajador
          roles={roles}
          onGuardar={handleCrear}
          onCerrar={() => setModalNuevo(false)}
        />
      )}
      {modalEditar && (
        <ModalTrabajador
          inicial={modalEditar}
          roles={roles}
          onGuardar={handleEditar}
          onCerrar={() => setModalEditar(null)}
        />
      )}
    </div>
  );
}
