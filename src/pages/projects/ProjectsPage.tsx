import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Building2 } from 'lucide-react';
import projectsService, { CreateProjectData } from '../../services/projects.service';
import clientesService from '../../services/clientes.service';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import DataTable, { type DataTableColumn } from '../../components/ui/DataTable';
import { FullPageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import type { Project, Cliente } from '../../types';

const EMPTY_FORM: CreateProjectData = {
  clienteId: '', nombre: '', descripcion: '', tipo: 'software',
  estado: 'activo', fechaInicio: new Date().toISOString().split('T')[0],
};

export default function ProjectsPage() {
  const [projects,  setProjects]  = useState<Project[]>([]);
  const [clientes,  setClientes]  = useState<Cliente[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState<'create' | 'edit' | null>(null);
  const [selected,  setSelected]  = useState<Project | null>(null);
  const [form,      setForm]      = useState<CreateProjectData>(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        projectsService.getAll(),
        clientesService.getAll(),
      ]);
      setProjects(p);
      setClientes(c);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const clienteName = (id?: string) =>
    id ? (clientes.find((c) => c.id === id)?.empresa ?? '—') : '—';

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal('create'); };
  const openEdit   = (p: Project) => {
    setSelected(p);
    setForm({
      clienteId: p.clienteId, nombre: p.nombre, descripcion: p.descripcion,
      tipo: p.tipo, estado: p.estado, fechaInicio: p.fechaInicio, fechaFin: p.fechaFin,
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

  const COLUMNS: DataTableColumn<Project>[] = [
    {
      key: 'nombre', header: 'Nombre',
      render: (p) => (
        <Link to={`/projects/${p.id}`}
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
    {
      key: 'tipo', header: 'Tipo',
      render: (p) => <span className="text-slate-500 text-xs">{p.tipo}</span>,
    },
    {
      key: 'estado', header: 'Estado',
      render: (p) => <Badge value={p.estado} />,
    },
    {
      key: 'fechaInicio', header: 'Inicio',
      render: (p) => (
        <span className="text-slate-400 text-xs">
          {p.fechaInicio ? new Date(p.fechaInicio).toLocaleDateString('es') : '—'}
        </span>
      ),
    },
    {
      key: 'acciones', header: 'Acciones', className: 'text-right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Editar</button>
          <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(p.id)}>Eliminar</button>
        </div>
      ),
    },
  ];

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Proyectos</h2>
          <p className="text-sm text-slate-500">
            {projects.length} proyecto{projects.length !== 1 ? 's' : ''} registrado{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Nuevo proyecto</button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="Sin proyectos"
          description="Crea el primer proyecto para comenzar"
          action={{ label: '+ Nuevo proyecto', onClick: openCreate }}
        />
      ) : (
        <DataTable columns={COLUMNS} data={projects} emptyText="Sin proyectos registrados" />
      )}

      <Modal open={modal !== null} onClose={closeModal}
        title={modal === 'create' ? 'Nuevo proyecto' : 'Editar proyecto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>
          )}
          <div>
            <label className="label">Cliente *</label>
            <select className="input" value={form.clienteId}
              onChange={(e) => setForm({ ...form, clienteId: e.target.value })} required>
              <option value="">Seleccionar cliente</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.empresa}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Nombre *</label>
            <input className="input" value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div>
            <label className="label">Descripción *</label>
            <textarea className="input resize-none" rows={3} value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo *</label>
              <select className="input" value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })} required>
                <option value="software">Software</option>
                <option value="hardware">Hardware</option>
                <option value="consultoria">Consultoría</option>
                <option value="soporte">Soporte</option>
                <option value="infraestructura">Infraestructura</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="input" value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha inicio *</label>
              <input type="date" className="input" value={form.fechaInicio}
                onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} required />
            </div>
            <div>
              <label className="label">Fecha fin</label>
              <input type="date" className="input" value={form.fechaFin ?? ''}
                onChange={(e) => setForm({ ...form, fechaFin: e.target.value || undefined })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
