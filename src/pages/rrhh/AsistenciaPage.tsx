import { useEffect, useState, FormEvent } from 'react';
import rrhhService, { CreateAsistenciaData } from '../../services/rrhh.service';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { FullPageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import type { AsistenciaRecord, Empleado, EstadoAsistencia } from '../../types';

function normArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

const TODAY = new Date().toISOString().split('T')[0];
const EMPTY: CreateAsistenciaData = {
  employeeId: '', date: TODAY, status: 'PRESENTE', checkIn: '', checkOut: '', notes: '',
};

export default function AsistenciaPage() {
  const [records, setRecords]     = useState<AsistenciaRecord[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filterEmp, setFilterEmp] = useState('');
  const [modal, setModal]         = useState<'create' | null>(null);
  const [form, setForm]           = useState<CreateAsistenciaData>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  // Reporte mensual
  const [reporteEmpId, setReporteEmpId] = useState('');
  const [reporteYear, setReporteYear]   = useState(new Date().getFullYear());
  const [reporteMonth, setReporteMonth] = useState(new Date().getMonth() + 1);
  const [reporte, setReporte]           = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const load = async (empId?: string) => {
    setLoading(true);
    try {
      const [r, e] = await Promise.all([
        rrhhService.getAsistencia(empId ? { employeeId: empId } : undefined),
        rrhhService.getEmpleados(),
      ]);
      setRecords(normArray(r));
      setEmpleados(normArray(e));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleFilter = (id: string) => { setFilterEmp(id); load(id || undefined); };

  const openCreate = () => { setForm({ ...EMPTY, employeeId: filterEmp }); setError(''); setModal('create'); };
  const closeModal = () => setModal(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await rrhhService.createAsistencia(form);
      closeModal();
      load(filterEmp || undefined);
    } catch (err: any) {
      setError(err?.message ?? 'Error al registrar asistencia');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este registro?')) return;
    await rrhhService.deleteAsistencia(id);
    load(filterEmp || undefined);
  };

  const loadReporte = async () => {
    if (!reporteEmpId) return;
    setLoadingReport(true);
    try {
      const data = await rrhhService.getReporteMensual(reporteEmpId, reporteYear, reporteMonth);
      setReporte(data);
    } catch { setReporte(null); }
    finally { setLoadingReport(false); }
  };

  const empName = (id: string) => {
    const e = empleados.find((emp) => emp.id === id);
    return e ? `${e.firstName} ${e.lastName}` : '—';
  };

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Asistencia</h2>
          <p className="text-sm text-gray-500">{records.length} registro{records.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <select className="input w-52" value={filterEmp} onChange={(e) => handleFilter(e.target.value)}>
            <option value="">Todos los empleados</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={openCreate}>+ Registrar asistencia</button>
        </div>
      </div>

      {/* Reporte mensual */}
      <div className="card space-y-3">
        <h3 className="font-semibold text-gray-800 text-sm">Reporte mensual</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label text-xs">Empleado</label>
            <select className="input w-48" value={reporteEmpId} onChange={(e) => setReporteEmpId(e.target.value)}>
              <option value="">Seleccionar...</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Mes</label>
            <select className="input w-36" value={reporteMonth} onChange={(e) => setReporteMonth(+e.target.value)}>
              {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Año</label>
            <input type="number" className="input w-24" value={reporteYear}
              onChange={(e) => setReporteYear(+e.target.value)} min={2020} max={2030} />
          </div>
          <button className="btn-secondary" onClick={loadReporte} disabled={!reporteEmpId || loadingReport}>
            {loadingReport ? 'Cargando...' : 'Ver reporte'}
          </button>
        </div>
        {reporte && (
          <div className="bg-blue-50 rounded-lg p-4 text-sm space-y-1">
            <p className="font-medium text-blue-900">
              {empName(reporteEmpId)} — {MESES[reporteMonth - 1]} {reporteYear}
            </p>
            <pre className="text-xs text-blue-800 whitespace-pre-wrap">
              {JSON.stringify(reporte, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Tabla registros */}
      {records.length === 0 ? (
        <EmptyState icon="📊" title="Sin registros de asistencia"
          action={{ label: '+ Registrar asistencia', onClick: openCreate }} />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-th">Empleado</th>
                <th className="table-th">Fecha</th>
                <th className="table-th">Estado</th>
                <th className="table-th">Entrada</th>
                <th className="table-th">Salida</th>
                <th className="table-th">Horas</th>
                <th className="table-th text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="table-td font-medium">{empName(r.employeeId)}</td>
                  <td className="table-td text-gray-500">
                    {new Date(r.date).toLocaleDateString('es')}
                  </td>
                  <td className="table-td"><Badge value={r.status} /></td>
                  <td className="table-td text-gray-500">{r.checkIn ?? '—'}</td>
                  <td className="table-td text-gray-500">{r.checkOut ?? '—'}</td>
                  <td className="table-td text-gray-500">{r.hoursWorked ?? '—'}</td>
                  <td className="table-td text-right">
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal open={modal === 'create'} onClose={closeModal} title="Registrar asistencia">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div>
            <label className="label">Empleado *</label>
            <select className="input" value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required>
              <option value="">Seleccionar...</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha *</label>
              <input type="date" className="input" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label className="label">Estado *</label>
              <select className="input" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as EstadoAsistencia })}>
                <option value="PRESENTE">Presente</option>
                <option value="AUSENTE">Ausente</option>
                <option value="TARDE">Tarde</option>
                <option value="MEDIO_DIA">Medio día</option>
                <option value="FERIADO">Feriado</option>
                <option value="REMOTO">Remoto</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Hora entrada (HH:MM)</label>
              <input type="time" className="input" value={form.checkIn ?? ''}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
            </div>
            <div>
              <label className="label">Hora salida (HH:MM)</label>
              <input type="time" className="input" value={form.checkOut ?? ''}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Notas</label>
            <input className="input" value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
