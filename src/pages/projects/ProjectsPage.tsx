import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Building2, Settings2, Pencil, Trash2, Eye } from 'lucide-react';
import projectsService, { CreateProjectData } from '../../services/projects.service';
import clientesService from '../../services/clientes.service';
import actualizacionesService from '../../services/actualizaciones.service';
import { parseDate, type CalendarDate } from '@internationalized/date';
import Badge from '../../components/ui/Badge';
import DataTable, { type DataTableColumn } from '../../components/ui/DataTable';
import { FullPageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ProgressBar from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/aria/Modal';
import { Dialog, Heading } from '../../components/ui/aria/Dialog';
import { Form } from '../../components/ui/aria/Form';
import { TextField } from '../../components/ui/aria/TextField';
import { Select, SelectItem } from '../../components/ui/aria/Select';
import { DatePicker } from '../../components/ui/aria/DatePicker';
import { Button } from '../../components/ui/aria/Button';
import { useAuthStore } from '../../store/auth.store';
import { toProjectPath } from '../../lib/slug';
import type { Project, Cliente } from '../../types';

const toCalendarDate = (iso?: string): CalendarDate | null => {
  if (!iso) return null;
  try { return parseDate(iso); } catch { return null; }
};

const EMPTY_FORM: CreateProjectData = {
  clienteId: '', nombre: '', descripcion: '', tipo: 'software',
  estado: 'activo', fechaInicio: new Date().toISOString().split('T')[0],
};

export default function ProjectsPage() {
  const user    = useAuthStore((s) => s.user);
  const isAdmin = user?.rol === 'admin';
  const [projects,  setProjects]  = useState<Project[]>([]);
  const [clientes,  setClientes]  = useState<Cliente[]>([]);
  const [avanceMap, setAvanceMap] = useState<Record<string, number>>({});
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState<'create' | 'edit' | null>(null);
  const [selected,  setSelected]  = useState<Project | null>(null);
  const [form,      setForm]      = useState<CreateProjectData>(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [p, c, actualizaciones] = await Promise.all([
        projectsService.getAll(),
        isAdmin ? clientesService.getAll() : Promise.resolve([]),
        actualizacionesService.getAll(),
      ]);
      setProjects(p);
      setClientes(c);

      const latestByProyecto: Record<string, { fecha: string; porcentajeAvance: number }> = {};
      for (const a of actualizaciones) {
        const current = latestByProyecto[a.proyectoId];
        if (!current || new Date(a.fecha) > new Date(current.fecha)) {
          latestByProyecto[a.proyectoId] = { fecha: a.fecha, porcentajeAvance: a.porcentajeAvance };
        }
      }
      setAvanceMap(
        Object.fromEntries(Object.entries(latestByProyecto).map(([pid, v]) => [pid, v.porcentajeAvance])),
      );
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const clienteName = (id?: string) =>
    id ? (clientes.find((c) => c.id === id)?.empresa ?? '—') : '—';

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal('create'); };
  const openEdit   = (p: Project) => {
    setSelected(p);
    setForm({
      clienteId:   p.clienteId,
      nombre:      p.nombre,
      descripcion: p.descripcion,
      tipo:        p.tipo,
      estado:      p.estado,
      fechaInicio: p.fechaInicio ? String(p.fechaInicio).split('T')[0] : '',
      fechaFin:    p.fechaFin    ? String(p.fechaFin).split('T')[0]    : undefined,
    });
    setError('');
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (modal === 'create') await projectsService.create(form);
      else if (selected)      await projectsService.update(selected.id, form);
      closeModal(); load();
    } catch (err: any) { setError(err?.message ?? 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este proyecto?')) return;
    await projectsService.remove(id); load();
  };

  const COLUMNS_ADMIN: DataTableColumn<Project>[] = [
    {
      key: 'nombre', header: 'Nombre',
      render: (p) => (
        <Link to={toProjectPath(p)}
          className="font-semibold text-slate-800 hover:text-blue-600 transition-colors inline-flex items-center gap-1">
          {p.nombre} <ExternalLink className="w-3 h-3 opacity-40" />
        </Link>
      ),
    },
    {
      key: 'cliente', header: 'Cliente',
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />{clienteName(p.clienteId)}
        </span>
      ),
    },
    { key: 'tipo',   header: 'Tipo',   render: (p) => <span className="text-slate-500 text-xs">{p.tipo}</span> },
    { key: 'estado', header: 'Estado', render: (p) => <Badge value={p.estado} /> },
    {
      key: 'avance', header: 'Avance', className: 'w-32',
      render: (p) => avanceMap[p.id] !== undefined
        ? <ProgressBar value={avanceMap[p.id]} showLabel />
        : <span className="text-slate-300 text-xs">—</span>,
    },
    {
      key: 'fechaInicio', header: 'Inicio',
      render: (p) => <span className="text-slate-400 text-xs">{p.fechaInicio ? new Date(p.fechaInicio).toLocaleDateString('es') : '—'}</span>,
    },
    {
      key: 'acciones', header: 'Acciones', className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Link to={toProjectPath(p)}
            className="p-1.5 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            title="Gestionar proyecto">
            <Settings2 className="w-3.5 h-3.5" />
          </Link>
          <button onClick={() => openEdit(p)}
            className="p-1.5 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            title="Editar">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleDelete(p.id)}
            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
            title="Eliminar">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const COLUMNS_CLIENTE: DataTableColumn<Project>[] = [
    {
      key: 'nombre', header: 'Proyecto',
      render: (p) => (
        <Link to={toProjectPath(p)}
          className="font-semibold text-slate-800 hover:text-blue-600 transition-colors inline-flex items-center gap-1">
          {p.nombre} <ExternalLink className="w-3 h-3 opacity-40" />
        </Link>
      ),
    },
    { key: 'tipo',   header: 'Tipo',   render: (p) => <span className="text-slate-500 text-xs">{p.tipo}</span> },
    { key: 'estado', header: 'Estado', render: (p) => <Badge value={p.estado} /> },
    {
      key: 'avance', header: 'Avance', className: 'w-32',
      render: (p) => avanceMap[p.id] !== undefined
        ? <ProgressBar value={avanceMap[p.id]} showLabel />
        : <span className="text-slate-300 text-xs">—</span>,
    },
    {
      key: 'fechaInicio', header: 'Inicio',
      render: (p) => <span className="text-slate-400 text-xs">{p.fechaInicio ? new Date(p.fechaInicio).toLocaleDateString('es') : '—'}</span>,
    },
    {
      key: 'acciones', header: '', className: 'text-right',
      render: (p) => (
        <Link to={toProjectPath(p)}
          className="p-1.5 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors inline-flex"
          title="Ver detalles">
          <Eye className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{isAdmin ? 'Proyectos' : 'Mis Proyectos'}</h2>
          <p className="text-sm text-slate-500">
            {projects.length} proyecto{projects.length !== 1 ? 's' : ''} registrado{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={openCreate}>+ Nuevo proyecto</button>}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="Sin proyectos"
          description={isAdmin ? 'Crea el primer proyecto para comenzar' : 'No tienes proyectos asignados aún'}
          action={isAdmin ? { label: '+ Nuevo proyecto', onClick: openCreate } : undefined}
        />
      ) : (
        <DataTable columns={isAdmin ? COLUMNS_ADMIN : COLUMNS_CLIENTE} data={projects} emptyText="Sin proyectos registrados" />
      )}

      <Modal size="lg" isOpen={modal !== null} onOpenChange={(v) => { if (!v) closeModal(); }}>
        <Dialog>
          <Heading slot="title" className="text-lg font-semibold text-slate-900 tracking-tight pr-8 mb-5">
            {modal === 'create' ? 'Nuevo proyecto' : 'Editar proyecto'}
          </Heading>
          <Form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>
            )}

            {/* ── Información general ── */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Información general</p>
              <Select
                label="Cliente *"
                placeholder="Seleccionar cliente"
                selectedKey={form.clienteId || null}
                onSelectionChange={(key) => setForm({ ...form, clienteId: String(key) })}
                isRequired
              >
                {clientes.map((c) => <SelectItem key={c.id} id={c.id}>{c.empresa}</SelectItem>)}
              </Select>
              <TextField
                label="Nombre *"
                value={form.nombre}
                onChange={(v) => setForm({ ...form, nombre: v })}
                isRequired
              />
              <TextField
                label="Descripción *"
                multiline
                rows={3}
                value={form.descripcion}
                onChange={(v) => setForm({ ...form, descripcion: v })}
                isRequired
              />
            </div>

            {/* ── Clasificación ── */}
            <div className="space-y-4 border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clasificación</p>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Tipo *"
                  selectedKey={form.tipo}
                  onSelectionChange={(key) => setForm({ ...form, tipo: String(key) })}
                  isRequired
                >
                  <SelectItem id="software">Software</SelectItem>
                  <SelectItem id="hardware">Hardware</SelectItem>
                  <SelectItem id="consultoria">Consultoría</SelectItem>
                  <SelectItem id="soporte">Soporte</SelectItem>
                  <SelectItem id="infraestructura">Infraestructura</SelectItem>
                  <SelectItem id="otro">Otro</SelectItem>
                </Select>
                <Select
                  label="Estado"
                  selectedKey={form.estado}
                  onSelectionChange={(key) => setForm({ ...form, estado: String(key) })}
                >
                  <SelectItem id="activo">Activo</SelectItem>
                  <SelectItem id="inactivo">Inactivo</SelectItem>
                  <SelectItem id="completado">Completado</SelectItem>
                </Select>
              </div>
            </div>

            {/* ── Cronograma ── */}
            <div className="space-y-4 border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cronograma</p>
              <div className="grid grid-cols-2 gap-4">
                <DatePicker
                  label="Fecha inicio *"
                  value={toCalendarDate(form.fechaInicio)}
                  onChange={(d) => setForm({ ...form, fechaInicio: d ? d.toString() : '' })}
                  isRequired
                />
                <DatePicker
                  label="Fecha fin"
                  value={toCalendarDate(form.fechaFin)}
                  minValue={toCalendarDate(form.fechaInicio) ?? undefined}
                  onChange={(d) => setForm({ ...form, fechaFin: d ? d.toString() : undefined })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <Button type="button" variant="secondary" slot="close">Cancelar</Button>
              <Button type="submit" isDisabled={saving}>
                {saving ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </Form>
        </Dialog>
      </Modal>
    </div>
  );
}
