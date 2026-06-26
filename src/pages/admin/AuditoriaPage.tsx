import { useState } from 'react';
import { MOCK_LOGS, AuditLog } from '../../data/admin.mock';

type Resultado = AuditLog['resultado'] | '';

const RESULT_STYLE: Record<AuditLog['resultado'], string> = {
  exitoso:     'bg-green-100 text-green-700',
  fallido:     'bg-red-100 text-red-700',
  advertencia: 'bg-yellow-100 text-yellow-700',
};

export default function AuditoriaPage() {
  const [logs]          = useState<AuditLog[]>(MOCK_LOGS);
  const [filterResult, setFilterResult] = useState<Resultado>('');
  const [filterModule, setFilterModule] = useState('');
  const [search, setSearch]             = useState('');

  const modules = [...new Set(logs.map((l) => l.modulo))];

  const filtered = logs.filter((l) => {
    const matchResult = !filterResult || l.resultado === filterResult;
    const matchModule = !filterModule || l.modulo === filterModule;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      l.accion.toLowerCase().includes(q) ||
      l.usuario.toLowerCase().includes(q) ||
      l.ip.includes(q);
    return matchResult && matchModule && matchSearch;
  });

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString('es', { dateStyle: 'short', timeStyle: 'medium' });

  const counts = {
    exitoso:     logs.filter((l) => l.resultado === 'exitoso').length,
    fallido:     logs.filter((l) => l.resultado === 'fallido').length,
    advertencia: logs.filter((l) => l.resultado === 'advertencia').length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Auditoría del Sistema</h2>
        <p className="text-sm text-gray-500">Registro de actividad y eventos de seguridad</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-lg">✓</div>
          <div>
            <p className="text-xl font-bold text-gray-900">{counts.exitoso}</p>
            <p className="text-xs text-gray-500">Exitosos</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-lg">✕</div>
          <div>
            <p className="text-xl font-bold text-gray-900">{counts.fallido}</p>
            <p className="text-xs text-gray-500">Fallidos</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-lg">⚠</div>
          <div>
            <p className="text-xl font-bold text-gray-900">{counts.advertencia}</p>
            <p className="text-xs text-gray-500">Advertencias</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <input className="input w-52" placeholder="Buscar acción, usuario o IP..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input w-40" value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
          <option value="">Todos los módulos</option>
          {modules.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="input w-40" value={filterResult} onChange={(e) => setFilterResult(e.target.value as Resultado)}>
          <option value="">Todos los resultados</option>
          <option value="exitoso">Exitoso</option>
          <option value="fallido">Fallido</option>
          <option value="advertencia">Advertencia</option>
        </select>
        <span className="self-center text-xs text-gray-400">{filtered.length} eventos</span>
      </div>

      {/* Tabla */}
      <div className="card p-0 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[750px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-th">Acción</th>
              <th className="table-th">Usuario</th>
              <th className="table-th">Módulo</th>
              <th className="table-th">IP</th>
              <th className="table-th">Fecha</th>
              <th className="table-th">Resultado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm">Sin registros</td></tr>
            ) : filtered.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50/50">
                <td className="table-td font-medium text-sm">{log.accion}</td>
                <td className="table-td text-xs text-gray-500">{log.usuario}</td>
                <td className="table-td">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{log.modulo}</span>
                </td>
                <td className="table-td text-xs font-mono text-gray-500">{log.ip}</td>
                <td className="table-td text-xs text-gray-500">{fmtDate(log.fecha)}</td>
                <td className="table-td">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${RESULT_STYLE[log.resultado]}`}>
                    {log.resultado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Los datos mostrados son de demostración. En producción se conectarán al servicio de auditoría.
      </p>
    </div>
  );
}
