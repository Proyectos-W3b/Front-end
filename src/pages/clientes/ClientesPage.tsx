import { useEffect, useState, FormEvent } from 'react';
import { Building2, Phone, MapPin, UserCheck, UserX, Plus, Pencil, Trash2 } from 'lucide-react';
import clientesService, { CreateClienteData, UpdateClienteData } from '../../services/clientes.service';
import Modal from '../../components/ui/Modal';
import { FullPageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/auth.store';
import type { Cliente } from '../../types';

const EMPTY_FORM: CreateClienteData = { usuarioId: '', empresa: '', telefono: '', direccion: '' };

export default function ClientesPage() {
  const user    = useAuthStore((s) => s.user);
  const isAdmin = user?.rol === 'admin';

  const [clientes, setClientes]   = useState<Cliente[]>([]);
  const [perfil,   setPerfil]     = useState<Cliente | null>(null);
  const [loading,  setLoading]    = useState(true);
  const [modal,    setModal]      = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected]   = useState<Cliente | null>(null);
  const [form,     setForm]       = useState<CreateClienteData>(EMPTY_FORM);
  const [saving,   setSaving]     = useState(false);
  const [error,    setError]      = useState('');

  const load = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        setClientes(await clientesService.getAll());
      } else {
        setPerfil(await clientesService.getMiPerfil());
      }
    } catch {
      // sin datos
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal('create'); };
  const openEdit   = (c: Cliente) => {
    setSelected(c);
    setForm({ usuarioId: c.usuarioId, empresa: c.empresa, telefono: c.telefono ?? '', direccion: c.direccion ?? '' });
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
        await clientesService.create(form);
      } else if (selected) {
        const updateData: UpdateClienteData = { empresa: form.empresa, telefono: form.telefono, direccion: form.direccion };
        await clientesService.update(selected.id, updateData);
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
    try {
      await clientesService.desactivar(id);
      load();
    } catch { /* noop */ }
  };

  const f = (k: keyof CreateClienteData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  if (loading) return <FullPageSpinner />;

  /* ── Vista cliente: mi perfil ───────────────────────────────────────── */
  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto space-y-4 pt-2">
        <h2 className="text-lg font-bold text-slate-900">Mi perfil de cliente</h2>

        {!perfil ? (
          <EmptyState message="No tienes un perfil de cliente aún. Contacta al administrador." />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{perfil.empresa}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${perfil.estaActivo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {perfil.estaActivo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              {perfil.telefono && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  {perfil.telefono}
                </div>
              )}
              {perfil.direccion && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  {perfil.direccion}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 pt-2">
              Cliente desde {new Date(perfil.creadoEn).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        )}
      </div>
    );
  }

  /* ── Vista admin: lista de clientes ─────────────────────────────────── */
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Clientes</h2>
          <p className="text-xs text-slate-500 mt-0.5">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Nuevo cliente
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',     value: clientes.length,                                  color: 'text-slate-900' },
          { label: 'Activos',   value: clientes.filter((c) => c.estaActivo).length,      color: 'text-emerald-600' },
          { label: 'Inactivos', value: clientes.filter((c) => !c.estaActivo).length,     color: 'text-red-500' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.04)] px-5 py-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
            <p className={`text-3xl font-bold tabular-nums mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      {clientes.length === 0 ? (
        <EmptyState message="No hay clientes registrados." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-th">Empresa</th>
                <th className="table-th">Teléfono</th>
                <th className="table-th">Dirección</th>
                <th className="table-th">Estado</th>
                <th className="table-th">Desde</th>
                <th className="table-th text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="table-td">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <span className="font-medium text-slate-800">{c.empresa}</span>
                    </div>
                  </td>
                  <td className="table-td text-slate-500">{c.telefono ?? '—'}</td>
                  <td className="table-td text-slate-500 max-w-[160px] truncate">{c.direccion ?? '—'}</td>
                  <td className="table-td">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${c.estaActivo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {c.estaActivo
                        ? <><UserCheck className="w-3 h-3" /> Activo</>
                        : <><UserX    className="w-3 h-3" /> Inactivo</>}
                    </span>
                  </td>
                  <td className="table-td text-slate-400 text-xs">
                    {new Date(c.creadoEn).toLocaleDateString('es-ES')}
                  </td>
                  <td className="table-td">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDesactivar(c.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Desactivar"
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
      )}

      {/* Modal crear / editar */}
      <Modal
        open={modal !== null}
        onClose={closeModal}
        title={modal === 'create' ? 'Nuevo cliente' : 'Editar cliente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          {modal === 'create' && (
            <div>
              <label className="label">ID de usuario</label>
              <input className="input" placeholder="UUID del usuario en auth-ms" value={form.usuarioId} onChange={f('usuarioId')} required />
            </div>
          )}

          <div>
            <label className="label">Empresa</label>
            <input className="input" placeholder="Nombre de la empresa" value={form.empresa} onChange={f('empresa')} required />
          </div>

          <div>
            <label className="label">Teléfono</label>
            <input className="input" placeholder="+51 999 000 111" value={form.telefono} onChange={f('telefono')} />
          </div>

          <div>
            <label className="label">Dirección</label>
            <input className="input" placeholder="Av. Ejemplo 123" value={form.direccion} onChange={f('direccion')} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary px-4 py-2 text-sm">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-sm">
              {saving ? 'Guardando…' : modal === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
