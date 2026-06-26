import { useEffect, useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Link2, Trash2, Pencil, X } from 'lucide-react';
import trabajadoresService from '../../services/trabajadores.service';
import projectsService    from '../../services/projects.service';
import { FullPageSpinner } from '../../components/ui/Spinner';
import Spinner            from '../../components/ui/Spinner';
import Badge              from '../../components/ui/Badge';
import type { Trabajador, AsignacionTrabajador, Project, CargoTrabajador } from '../../types';

type Tab = 'trabajadores' | 'asignaciones';

const CARGOS: CargoTrabajador[] = ['desarrollador', 'diseñador', 'gerente', 'analista', 'qa'];

const CARGO_COLOR: Record<CargoTrabajador, string> = {
  desarrollador: 'bg-blue-100 text-blue-700',
  diseñador:     'bg-purple-100 text-purple-700',
  gerente:       'bg-amber-100 text-amber-700',
  analista:      'bg-teal-100 text-teal-700',
  qa:            'bg-rose-100 text-rose-700',
};

// ── Modal crear/editar trabajador ─────────────────────────────────────────────
function ModalTrabajador({
  inicial, proyectos, onGuardar, onCerrar,
}: {
  inicial?: Trabajador;
  proyectos: Project[];
  onGuardar: (data: any) => Promise<void>;
  onCerrar: () => void;
}) {
  const [form, setForm] = useState({
    nombre:       inicial?.nombre       ?? '',
    apellido:     inicial?.apellido     ?? '',
    correo:       inicial?.correo       ?? '',
    cargo:        inicial?.cargo        ?? 'desarrollador' as CargoTrabajador,
    departamento: inicial?.departamento ?? '',
    estado:       inicial?.estado       ?? 'activo',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onGuardar(form);
      onCerrar();
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{   opacity: 0, scale: 0.96, y: 16  }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">{inicial ? 'Editar trabajador' : 'Nuevo trabajador'}</h3>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nombre</label>
              <input className="input" value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Apellido</label>
              <input className="input" value={form.apellido}
                onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))} required />
            </div>
          </div>

          <div>
            <label className="label">Correo</label>
            <input type="email" className="input" value={form.correo}
              onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Cargo</label>
              <select className="input" value={form.cargo}
                onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value as CargoTrabajador }))}>
                {CARGOS.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Departamento</label>
              <input className="input" value={form.departamento}
                onChange={(e) => setForm((f) => ({ ...f, departamento: e.target.value }))} required />
            </div>
          </div>

          {inicial && (
            <div>
              <label className="label">Estado</label>
              <select className="input" value={form.estado}
                onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as any }))}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCerrar} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Spinner size="sm" /> : (inicial ? 'Guardar cambios' : 'Crear trabajador')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Modal asignar proyecto ────────────────────────────────────────────────────
function ModalAsignar({
  trabajadores, proyectos, onAsignar, onCerrar,
}: {
  trabajadores: Trabajador[];
  proyectos:    Project[];
  onAsignar:    (data: { trabajadorId: string; proyectoId: string; rol: string }) => Promise<void>;
  onCerrar:     () => void;
}) {
  const [form, setForm] = useState({ trabajadorId: '', proyectoId: '', rol: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onAsignar(form);
      onCerrar();
    } catch (err: any) {
      setError(err?.message ?? 'Error al asignar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Asignar a proyecto</h3>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</p>
          )}

          <div>
            <label className="label">Trabajador</label>
            <select className="input" value={form.trabajadorId}
              onChange={(e) => setForm((f) => ({ ...f, trabajadorId: e.target.value }))} required>
              <option value="">Selecciona un trabajador</option>
              {trabajadores.filter((t) => t.estado === 'activo').map((t) => (
                <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Proyecto</label>
            <select className="input" value={form.proyectoId}
              onChange={(e) => setForm((f) => ({ ...f, proyectoId: e.target.value }))} required>
              <option value="">Selecciona un proyecto</option>
              {proyectos.filter((p) => p.estado === 'activo').map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Rol en el proyecto</label>
            <input className="input" placeholder="ej. Desarrollador Backend"
              value={form.rol}
              onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))} required />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCerrar} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Spinner size="sm" /> : 'Asignar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function TrabajadoresPage() {
  const [tab,           setTab]           = useState<Tab>('trabajadores');
  const [trabajadores,  setTrabajadores]  = useState<Trabajador[]>([]);
  const [asignaciones,  setAsignaciones]  = useState<AsignacionTrabajador[]>([]);
  const [proyectos,     setProyectos]     = useState<Project[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [modalNuevo,    setModalNuevo]    = useState(false);
  const [modalEditar,   setModalEditar]   = useState<Trabajador | null>(null);
  const [modalAsignar,  setModalAsignar]  = useState(false);

  const cargarDatos = async () => {
    try {
      const [t, a, p] = await Promise.all([
        trabajadoresService.getAll(),
        trabajadoresService.getAsignaciones(),
        projectsService.getAll(),
      ]);
      setTrabajadores(t);
      setAsignaciones(a);
      setProyectos(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleCrear   = (data: any) => trabajadoresService.create(data).then(cargarDatos);
  const handleEditar  = (data: any) => trabajadoresService.update(modalEditar!.id, data).then(cargarDatos);
  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este trabajador?')) return;
    await trabajadoresService.remove(id);
    cargarDatos();
  };
  const handleAsignar = (data: any) => trabajadoresService.asignar(data).then(cargarDatos);
  const handleDesasignar = async (id: string) => {
    if (!confirm('¿Quitar esta asignación?')) return;
    await trabajadoresService.desasignar(id);
    cargarDatos();
  };

  const nombreProyecto    = (id?: string) => proyectos.find((p) => p.id === id)?.nombre ?? '—';
  const nombreTrabajador  = (id: string)  => {
    const t = trabajadores.find((t) => t.id === id);
    return t ? `${t.nombre} ${t.apellido}` : '—';
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Trabajadores</h2>
          <p className="text-xs text-slate-500 mt-0.5">Gestión de equipo y asignaciones a proyectos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModalAsignar(true)} className="btn-secondary gap-2">
            <Link2 className="w-4 h-4" /> Asignar proyecto
          </button>
          <button onClick={() => setModalNuevo(true)} className="btn-primary gap-2">
            <UserPlus className="w-4 h-4" /> Nuevo trabajador
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] overflow-hidden">
        <div className="flex border-b border-slate-100">
          {([
            { key: 'trabajadores', label: `Trabajadores (${trabajadores.length})` },
            { key: 'asignaciones', label: `Asignaciones (${asignaciones.length})` },
          ] as { key: Tab; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-6 py-3.5 text-sm font-semibold transition-colors ${
                tab === t.key ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.label}
              {tab === t.key && (
                <motion.div
                  layoutId="tab-trabajadores"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── TABLA TRABAJADORES ── */}
        {tab === 'trabajadores' && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="table-th">Nombre</th>
                <th className="table-th">Correo</th>
                <th className="table-th">Cargo</th>
                <th className="table-th">Departamento</th>
                <th className="table-th">Proyecto asignado</th>
                <th className="table-th">Estado</th>
                <th className="table-th">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {trabajadores.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-400">Sin trabajadores registrados</td></tr>
              ) : trabajadores.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="table-td font-medium text-slate-900">
                    {t.nombre} {t.apellido}
                  </td>
                  <td className="table-td text-slate-500">{t.correo}</td>
                  <td className="table-td">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${CARGO_COLOR[t.cargo]}`}>
                      {t.cargo}
                    </span>
                  </td>
                  <td className="table-td text-slate-600">{t.departamento}</td>
                  <td className="table-td">
                    {t.proyectoId
                      ? <span className="text-blue-600 font-medium">{nombreProyecto(t.proyectoId)}</span>
                      : <span className="text-slate-300">Sin asignar</span>
                    }
                  </td>
                  <td className="table-td">
                    <Badge value={t.estado} />
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setModalEditar(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEliminar(t.id)}
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
        )}

        {/* ── TABLA ASIGNACIONES ── */}
        {tab === 'asignaciones' && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="table-th">Trabajador</th>
                <th className="table-th">Proyecto</th>
                <th className="table-th">Rol</th>
                <th className="table-th">Fecha asignación</th>
                <th className="table-th">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {asignaciones.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-sm text-slate-400">Sin asignaciones registradas</td></tr>
              ) : asignaciones.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="table-td font-medium text-slate-900">{nombreTrabajador(a.trabajadorId)}</td>
                  <td className="table-td">
                    <span className="text-blue-600 font-medium">{nombreProyecto(a.proyectoId)}</span>
                  </td>
                  <td className="table-td text-slate-600">{a.rol}</td>
                  <td className="table-td text-slate-500">{a.fechaAsignacion}</td>
                  <td className="table-td">
                    <button
                      onClick={() => handleDesasignar(a.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Quitar asignación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modales */}
      {modalNuevo   && <ModalTrabajador proyectos={proyectos} onGuardar={handleCrear}  onCerrar={() => setModalNuevo(false)} />}
      {modalEditar  && <ModalTrabajador proyectos={proyectos} inicial={modalEditar} onGuardar={handleEditar} onCerrar={() => setModalEditar(null)} />}
      {modalAsignar && <ModalAsignar trabajadores={trabajadores} proyectos={proyectos} onAsignar={handleAsignar} onCerrar={() => setModalAsignar(false)} />}
    </div>
  );
}
