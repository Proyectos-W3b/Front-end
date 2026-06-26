import { useState } from 'react';
import { SYSTEM_STATS, MOCK_LOGS, MOCK_USERS } from '../../data/admin.mock';
import Badge from '../../components/ui/Badge';

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  icon: string;
}

function StatCard({ label, value, sub, color, icon }: StatCardProps) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
  );
}

const SERVICES = [
  { name: 'API Gateway',   port: 3003, status: true },
  { name: 'Auth MS',       port: 3000, status: true },
  { name: 'Projects MS',   port: 3001, status: true },
  { name: 'Incidents MS',  port: 3002, status: true },
  { name: 'RRHH MS',       port: 3004, status: true },
  { name: 'NATS Broker',   port: 4222, status: true },
  { name: 'PostgreSQL',    port: 5432, status: true },
];

export default function AdminDashboardPage() {
  const [refreshed] = useState(new Date().toLocaleTimeString('es'));
  const recentLogs = MOCK_LOGS.slice(0, 6);
  const recentUsers = MOCK_USERS.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Panel de Administración</h2>
          <p className="text-sm text-gray-500">Visión general del sistema · Actualizado a las {refreshed}</p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full border border-blue-200">
          🔒 Solo Admin
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Usuarios" value={SYSTEM_STATS.totalUsuarios}
          sub={`${SYSTEM_STATS.usuariosActivos} activos`}
          color="bg-blue-100 text-blue-600" icon="👤" />
        <StatCard label="Proyectos" value={SYSTEM_STATS.totalProyectos}
          sub={`${SYSTEM_STATS.proyectosActivos} en curso`}
          color="bg-green-100 text-green-600" icon="📁" />
        <StatCard label="Incidencias" value={SYSTEM_STATS.totalIncidencias}
          sub={`${SYSTEM_STATS.incidenciasAbiertas} abiertas`}
          color="bg-orange-100 text-orange-600" icon="⚠" />
        <StatCard label="Uptime" value={`${SYSTEM_STATS.uptimeDias}d`}
          sub={`v${SYSTEM_STATS.versionSistema}`}
          color="bg-purple-100 text-purple-600" icon="⚡" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Estado de servicios */}
        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">Estado de Microservicios</h3>
          <div className="space-y-2">
            {SERVICES.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <StatusDot ok={s.status} />
                  <span className="text-sm font-medium text-gray-700">{s.name}</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">:{s.port}</span>
              </div>
            ))}
          </div>
          <div className="bg-green-50 rounded-lg px-3 py-2 text-xs text-green-700 font-medium">
            ✓ Todos los servicios operativos
          </div>
        </div>

        {/* Usuarios recientes */}
        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">Usuarios Recientes</h3>
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-2 py-1">
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.nombre[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.nombre} {u.apellido}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <Badge value={u.role} />
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">Actividad Reciente</h3>
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 py-1 border-b border-gray-50 last:border-0">
                <span className={`mt-0.5 inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                  log.resultado === 'exitoso' ? 'bg-green-500' :
                  log.resultado === 'fallido' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{log.accion}</p>
                  <p className="text-xs text-gray-400 truncate">{log.usuario.split('@')[0]} · {log.modulo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
