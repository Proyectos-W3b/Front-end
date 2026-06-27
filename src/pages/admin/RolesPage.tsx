const PERMISSIONS = [
  { modulo: 'Dashboard',             admin: true,  manager: true,  employee: true,  client: true  },
  { modulo: 'Proyectos — ver',       admin: true,  manager: true,  employee: true,  client: true  },
  { modulo: 'Proyectos — crear',     admin: true,  manager: false, employee: false, client: false },
  { modulo: 'Proyectos — editar',    admin: true,  manager: false, employee: false, client: false },
  { modulo: 'Proyectos — eliminar',  admin: true,  manager: false, employee: false, client: false },
  { modulo: 'Incidencias — ver',     admin: true,  manager: true,  employee: true,  client: true  },
  { modulo: 'Incidencias — crear',   admin: true,  manager: true,  employee: false, client: false },
  { modulo: 'Incidencias — eliminar',admin: true,  manager: false, employee: false, client: false },
  { modulo: 'Clientes — ver',        admin: true,  manager: false, employee: false, client: false },
  { modulo: 'Clientes — gestionar',  admin: true,  manager: false, employee: false, client: false },
  { modulo: 'Admin — usuarios',      admin: true,  manager: false, employee: false, client: false },
  { modulo: 'Admin — auditoría',     admin: true,  manager: false, employee: false, client: false },
];

const ROLES = [
  { key: 'admin',    label: 'Admin',    color: 'bg-red-100 text-red-700' },
  { key: 'manager',  label: 'Manager',  color: 'bg-purple-100 text-purple-700' },
  { key: 'employee', label: 'Employee', color: 'bg-blue-100 text-blue-700' },
  { key: 'client',   label: 'Client',   color: 'bg-gray-100 text-gray-700' },
] as const;

const ROLE_DESCRIPTIONS: Record<string, { desc: string; icon: string }> = {
  admin:    { icon: '🛡',  desc: 'Acceso completo al sistema. Gestiona usuarios, configuración y auditoría.' },
  manager:  { icon: '👔', desc: 'Gestiona proyectos, incidencias y equipo RRHH. Sin acceso al panel de administración.' },
  employee: { icon: '👷', desc: 'Visualiza proyectos e incidencias. Puede registrar su propia asistencia.' },
  client:   { icon: '🤝', desc: 'Acceso de solo lectura a proyectos e incidencias de sus contratos activos.' },
};

function CheckCell({ value }: { value: boolean }) {
  return (
    <td className="px-4 py-2.5 text-center">
      {value ? (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-sm">✓</span>
      ) : (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-sm">✕</span>
      )}
    </td>
  );
}

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Roles y Permisos</h2>
        <p className="text-sm text-gray-500">Matriz de acceso por módulo y rol del sistema</p>
      </div>

      {/* Tarjetas de rol */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES.map((r) => {
          const info = ROLE_DESCRIPTIONS[r.key];
          return (
            <div key={r.key} className="card space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{info.icon}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.color}`}>{r.label}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{info.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Matriz de permisos */}
      <div className="card p-0 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-5 py-3">
          <h3 className="font-semibold text-gray-800 text-sm">Matriz de permisos</h3>
          <p className="text-xs text-gray-400 mt-0.5">Los permisos son gestionados desde el backend. Esta vista es de referencia.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="table-th text-left w-56">Módulo / Acción</th>
                {ROLES.map((r) => (
                  <th key={r.key} className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${r.color}`}>{r.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PERMISSIONS.map((p, i) => (
                <tr key={i} className={`hover:bg-gray-50/50 ${p.modulo.includes('—') ? '' : 'bg-slate-50/30'}`}>
                  <td className="table-td font-medium text-sm text-gray-700">{p.modulo}</td>
                  <CheckCell value={p.admin} />
                  <CheckCell value={p.manager} />
                  <CheckCell value={p.employee} />
                  <CheckCell value={p.client} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
        <strong>Nota:</strong> Esta matriz es de referencia visual. Los permisos reales se aplican en cada microservicio a través de los guards de NestJS + JWT claims.
      </div>
    </div>
  );
}
