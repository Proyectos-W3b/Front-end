import { useEffect, useState, FormEvent, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, MapPin, UserCheck, UserX, Plus, Pencil, Trash2, Camera, Eye } from 'lucide-react';
import clientesService, { UpdateClienteData } from '../../services/clientes.service';
import { usuariosApi, rolesApi, uploadsApi } from '../../services/api.service';
import Modal from '../../components/ui/Modal';
import DataTable, { type DataTableColumn } from '../../components/ui/DataTable';
import { FullPageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/auth.store';
import type { Cliente } from '../../types';

interface CreateForm {
  nombre: string;
  correo: string;
  contrasena: string;
  empresa: string;
  telefono: string;
  direccion: string;
}

interface EditForm {
  empresa: string;
  telefono: string;
  direccion: string;
}

const EMPTY_CREATE: CreateForm = { nombre: '', correo: '', contrasena: '', empresa: '', telefono: '', direccion: '' };
const EMPTY_EDIT:   EditForm   = { empresa: '', telefono: '', direccion: '' };

export default function ClientesPage() {
  const { user, setAuth } = useAuthStore();
  const token = useAuthStore((s) => s.token);
  const isAdmin = user?.rol === 'admin';

  const [clientes,     setClientes]     = useState<Cliente[]>([]);
  const [clienteRolId, setClienteRolId] = useState('');
  const [perfil,       setPerfil]       = useState<Cliente | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [modal,        setModal]        = useState<'create' | 'edit' | null>(null);
  const [selected,     setSelected]     = useState<Cliente | null>(null);
  const [createForm,   setCreateForm]   = useState<CreateForm>(EMPTY_CREATE);
  const [editForm,     setEditForm]     = useState<EditForm>(EMPTY_EDIT);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');

  const load = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [c, roles] = await Promise.all([clientesService.getAll(), rolesApi.getAll()]);
        setClientes(c);
        const rolCliente = roles.find((r) => r.nombre === 'cliente');
        if (rolCliente) setClienteRolId(rolCliente.idRol);
      } else {
        setPerfil(await clientesService.getMiPerfil());
      }
    } catch { /* sin datos */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setCreateForm(EMPTY_CREATE); setError(''); setModal('create'); };
  const openEdit   = (c: Cliente) => {
    setSelected(c);
    setEditForm({ empresa: c.empresa, telefono: c.telefono ?? '', direccion: c.direccion ?? '' });
    setError('');
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modal === 'create') {
        // 1. Crear usuario con rol cliente
        const newUser = await usuariosApi.create({
          nombre:     createForm.nombre,
          correo:     createForm.correo,
          contrasena: createForm.contrasena,
          rolId:      clienteRolId,
        });
        // 2. Crear perfil de cliente vinculado a ese usuario
        await clientesService.create({
          usuarioId: newUser.id,
          empresa:   createForm.empresa,
          telefono:  createForm.telefono  || undefined,
          direccion: createForm.direccion || undefined,
        });
      } else if (selected) {
        await clientesService.update(selected.id, {
          empresa:   editForm.empresa,
          telefono:  editForm.telefono  || undefined,
          direccion: editForm.direccion || undefined,
        });
      }
      closeModal();
      load();
    } catch (err: any) {
      setError(err?.message ?? 'Ocurrió un error');
    } finally {
      setSaving(false);
    }
  };

  const handleDesactivar = async (id: string) => {
    if (!confirm('¿Desactivar este cliente?')) return;
    try { await clientesService.desactivar(id); load(); } catch { /* noop */ }
  };

  // ── Estado edición perfil (vista cliente) ─────────────────────────────
  const [editNombre,   setEditNombre]   = useState(false);
  const [nuevoNombre,  setNuevoNombre]  = useState(user?.nombre ?? '');
  const [savingNombre, setSavingNombre] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setSubiendoFoto(true);
    try {
      const objectPath = await uploadsApi.subirArchivo(file, 'perfiles');
      const updated = await usuariosApi.update(user.id, { fotoUrl: objectPath });
      setAuth({ ...user, fotoUrl: updated.fotoUrl }, token!);
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleGuardarNombre = async () => {
    if (!user || !nuevoNombre.trim()) return;
    setSavingNombre(true);
    try {
      const updated = await usuariosApi.update(user.id, { nombre: nuevoNombre.trim() });
      setAuth({ ...user, nombre: updated.nombre }, token!);
      setEditNombre(false);
    } catch { /* noop */ }
    finally { setSavingNombre(false); }
  };

  if (loading) return <FullPageSpinner />;

  /* ── Vista cliente: mi perfil ───────────────────────────────────────── */
  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto space-y-4 pt-2">
        <h2 className="text-lg font-bold text-slate-900">Mi perfil</h2>

        {/* Tarjeta personal */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] p-6 space-y-5">

          {/* Avatar + foto */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {user?.fotoUrl ? (
                <img src={user.fotoUrl} alt="foto" className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                  {user?.nombre?.[0]?.toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={subiendoFoto}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
                title="Cambiar foto"
              >
                <Camera className="w-3 h-3 text-slate-500" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
            </div>

            {/* Nombre editable */}
            <div className="flex-1">
              {editNombre ? (
                <div className="flex items-center gap-2">
                  <input
                    className="input flex-1 text-sm"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={handleGuardarNombre}
                    disabled={savingNombre}
                    className="btn-primary px-3 py-1.5 text-xs"
                  >
                    {savingNombre ? '...' : 'Guardar'}
                  </button>
                  <button onClick={() => setEditNombre(false)} className="btn-secondary px-3 py-1.5 text-xs">
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900">{user?.nombre}</span>
                  <button onClick={() => { setNuevoNombre(user?.nombre ?? ''); setEditNombre(true); }}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-400 mt-0.5 capitalize">{user?.rol}</p>
            </div>
          </div>

          {/* Info empresa */}
          {perfil && (
            <div className="border-t border-slate-50 pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Building2 className="w-4 h-4 text-slate-400" />{perfil.empresa}
              </div>
              {perfil.telefono && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />{perfil.telefono}
                </div>
              )}
              {perfil.direccion && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />{perfil.direccion}
                </div>
              )}
              <p className="text-xs text-slate-400 pt-1">
                Cliente desde {new Date(perfil.creadoEn).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}

          {!perfil && (
            <EmptyState title="No tienes un perfil de empresa aún" description="Contacta al administrador." />
          )}
        </div>
      </div>
    );
  }

  /* ── Vista admin: lista de clientes ─────────────────────────────────── */
  const columns: DataTableColumn<Cliente>[] = [
    {
      key: 'empresa', header: 'Empresa',
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <span className="font-medium text-slate-800">{c.empresa}</span>
        </div>
      ),
    },
    {
      key: 'telefono', header: 'Teléfono',
      render: (c) => <span className="text-slate-500">{c.telefono ?? '—'}</span>,
    },
    {
      key: 'direccion', header: 'Dirección', className: 'max-w-[160px]',
      render: (c) => <span className="text-slate-500 truncate block">{c.direccion ?? '—'}</span>,
    },
    {
      key: 'estado', header: 'Estado',
      render: (c) => (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${c.estaActivo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {c.estaActivo
            ? <><UserCheck className="w-3 h-3" /> Activo</>
            : <><UserX    className="w-3 h-3" /> Inactivo</>}
        </span>
      ),
    },
    {
      key: 'desde', header: 'Desde',
      render: (c) => <span className="text-slate-400 text-xs">{new Date(c.creadoEn).toLocaleDateString('es-ES')}</span>,
    },
    {
      key: 'acciones', header: 'Acciones', className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Link to={`/clientes/${c.id}`}
            className="p-1.5 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            title="Ver detalle">
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <button onClick={() => openEdit(c)}
            className="p-1.5 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            title="Editar">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleDesactivar(c.id)}
            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
            title="Desactivar">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clientes</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Nuevo cliente
        </button>
      </div>

      {/* Tabla */}
      <DataTable columns={columns} data={clientes} emptyText="No hay clientes registrados." />

      {/* ── Modal CREAR ─────────────────────────────────────────────────── */}
      <Modal open={modal === 'create'} onClose={closeModal} title="Nuevo cliente">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cuenta de acceso</p>

          <div>
            <label className="label">Nombre completo *</label>
            <input className="input" placeholder="Juan Pérez"
              value={createForm.nombre}
              onChange={(e) => setCreateForm((f) => ({ ...f, nombre: e.target.value }))}
              required />
          </div>
          <div>
            <label className="label">Correo *</label>
            <input type="email" className="input" placeholder="cliente@empresa.com"
              value={createForm.correo}
              onChange={(e) => setCreateForm((f) => ({ ...f, correo: e.target.value }))}
              required />
          </div>
          <div>
            <label className="label">Contraseña *</label>
            <input type="password" className="input" placeholder="Mínimo 6 caracteres"
              value={createForm.contrasena}
              onChange={(e) => setCreateForm((f) => ({ ...f, contrasena: e.target.value }))}
              required />
          </div>

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">Datos de empresa</p>

          <div>
            <label className="label">Empresa *</label>
            <input className="input" placeholder="Nombre de la empresa"
              value={createForm.empresa}
              onChange={(e) => setCreateForm((f) => ({ ...f, empresa: e.target.value }))}
              required />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input className="input" placeholder="+51 999 000 111"
              value={createForm.telefono}
              onChange={(e) => setCreateForm((f) => ({ ...f, telefono: e.target.value }))} />
          </div>
          <div>
            <label className="label">Dirección</label>
            <input className="input" placeholder="Av. Ejemplo 123"
              value={createForm.direccion}
              onChange={(e) => setCreateForm((f) => ({ ...f, direccion: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary px-4 py-2 text-sm">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-sm">
              {saving ? 'Creando…' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal EDITAR ─────────────────────────────────────────────────── */}
      <Modal open={modal === 'edit'} onClose={closeModal} title="Editar cliente">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <div>
            <label className="label">Empresa *</label>
            <input className="input"
              value={editForm.empresa}
              onChange={(e) => setEditForm((f) => ({ ...f, empresa: e.target.value }))}
              required />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input className="input"
              value={editForm.telefono}
              onChange={(e) => setEditForm((f) => ({ ...f, telefono: e.target.value }))} />
          </div>
          <div>
            <label className="label">Dirección</label>
            <input className="input"
              value={editForm.direccion}
              onChange={(e) => setEditForm((f) => ({ ...f, direccion: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary px-4 py-2 text-sm">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-sm">
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
