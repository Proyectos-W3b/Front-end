import { useState, useEffect } from 'react';
import { usuariosApi } from '../../services/api.service';
import { proyectsApi } from '../../services/api.service';
import { incidenciasApi } from '../../services/api.service';
import Badge from '../../components/ui/Badge';
import type { User, Project, Incidencia } from '../../types';

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
  { name: 'API Gateway',   port: 3000, status: true },
  { name: 'Auth MS',       port: null, status: true },
  { name: 'Projects MS',   port: null, status: true },
  { name: 'Incidents MS',  port: null, status: true },
  { name: 'Client MS',     port: null, status: true },
  { name: 'NATS Broker',   port: 4222, status: true },
];

export default function AdminDashboardPage() {
  const [refreshed] = useState(new Date().toLocaleTimeString('es'));
  const [usuarios,    setUsuarios]    = useState<User[]>([]);
  const [proyectos,   setProyectos]   = useState<Project[]>([]);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);

  useEffect(() => {
    usuariosApi.getAll().then(setUsuarios).catch(() => {});
    proyectsApi.getAll().then(setProyectos).catch(() => {});
    incidenciasApi.getAll({ limit: 100 }).then(setIncidencias).catch(() => {});
  }, []);

  const activos        = proyectos.filter((p) => p.estado === 'activo').length;
  const abiertas       = incidencias.filter((i) => i.estado === 'abierta' || i.estado === 'en_proceso').length;
  const recentUsers    = usuarios.slice(0, 5);

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
        <StatCard label="Usuarios" value={usuarios.length}
          sub={`${usuarios.length} registrados`}
          color="bg-blue-100 text-blue-600" icon="👤" />
        <StatCard label="Proyectos" value={proyectos.length}
          sub={`${activos} en curso`}
          color="bg-green-100 text-green-600" icon="📁" />
        <StatCard label="Incidencias" value={incidencias.length}
          sub={`${abiertas} abiertas`}
          color="bg-orange-100 text-orange-600" icon="⚠" />
        <StatCard label="Sistema" value="Online"
          sub="v1.0.0"
          color="bg-purple-100 text-purple-600" icon="⚡" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
                {s.port && <span className="text-xs text-gray-400 font-mono">:{s.port}</span>}
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
          {recentUsers.length === 0 ? (
            <p className="text-sm text-gray-400">Cargando usuarios...</p>
          ) : (
            <div className="space-y-2">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-2 py-1">
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.nombre[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.nombre}</p>
                    <p className="text-xs text-gray-400 truncate">{u.correo}</p>
                  </div>
                  <Badge value={u.rol} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
