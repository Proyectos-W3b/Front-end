import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, MapPin, FolderOpen, AlertTriangle, Calendar } from 'lucide-react';
import { Effect } from '../../components/animate-ui/primitives/effects/effect';
import { MOCK_CHATS } from '../../services/chat.service';
import Badge from '../../components/ui/Badge';

// Mock de proyectos asociados por cliente
const PROYECTOS_CLIENTE: Record<string, { nombre: string; estado: string; inicio: string; incidencias: number }[]> = {
  'cli-001': [{ nombre: 'Portal Web Acme',      estado: 'activo',     inicio: '2025-01-10', incidencias: 3 }],
  'cli-002': [{ nombre: 'App Mobile TS',         estado: 'activo',     inicio: '2025-02-05', incidencias: 1 }],
  'cli-003': [{ nombre: 'Sistema ERP Buildex',   estado: 'completado', inicio: '2024-11-01', incidencias: 0 }],
  'cli-004': [{ nombre: 'Rediseño Grupo Norma',  estado: 'inactivo',   inicio: '2025-03-20', incidencias: 0 }],
  'cli-005': [{ nombre: 'Dashboard Visión 360',  estado: 'activo',     inicio: '2025-04-15', incidencias: 2 }],
};

const INFO_EXTRA: Record<string, { telefono: string; direccion: string; contacto: string; correo: string }> = {
  'cli-001': { telefono: '+1 555 0101', direccion: 'New York, USA',       contacto: 'John Smith',    correo: 'john@acmecorp.com' },
  'cli-002': { telefono: '+1 555 0202', direccion: 'San Francisco, USA',  contacto: 'Sara Lee',      correo: 'sara@techsolutions.io' },
  'cli-003': { telefono: '+57 310 0303',direccion: 'Bogotá, Colombia',    contacto: 'Luis Gómez',    correo: 'luis@buildex.co' },
  'cli-004': { telefono: '+52 55 0404', direccion: 'Ciudad de México, MX',contacto: 'María Torres',  correo: 'maria@gruponorma.mx' },
  'cli-005': { telefono: '+34 91 0505', direccion: 'Madrid, España',      contacto: 'Carlos Ruiz',   correo: 'carlos@vision360.es' },
};

export default function ClienteDetailPage() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();

  const chat    = MOCK_CHATS.find((c) => c.clienteId === id);
  const info    = id ? INFO_EXTRA[id]          : null;
  const proyect = id ? PROYECTOS_CLIENTE[id]   : [];

  if (!chat || !info) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-slate-500 text-sm">Cliente no encontrado</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">Volver</button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Breadcrumb / back */}
      <Effect slide={{ direction: 'down', offset: 12 }} fade
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al chat
        </button>
      </Effect>

      {/* Header cliente */}
      <Effect slide={{ direction: 'up', offset: 16 }} fade delay={80}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] p-6">
          <div className="flex items-center gap-4">

            {/* Avatar grande */}
            <div className={`w-16 h-16 ${chat.color} rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0`}>
              {chat.iniciales}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{chat.empresa}</h2>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${chat.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className={`text-xs font-medium ${chat.online ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {chat.online ? 'En línea' : 'Desconectado'}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">Cliente activo</p>
            </div>

            <button
              onClick={() => navigate('/clientes/chat')}
              className="btn-primary gap-2 text-xs"
            >
              Ir al chat
            </button>
          </div>

          {/* Info de contacto */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Correo</p>
                <p className="text-sm font-medium text-slate-700">{info.correo}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <Phone className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Teléfono</p>
                <p className="text-sm font-medium text-slate-700">{info.telefono}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Contacto</p>
                <p className="text-sm font-medium text-slate-700">{info.contacto}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Ubicación</p>
                <p className="text-sm font-medium text-slate-700">{info.direccion}</p>
              </div>
            </div>
          </div>
        </div>
      </Effect>

      {/* Proyectos asociados */}
      <Effect slide={{ direction: 'up', offset: 16 }} fade delay={180}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-500" />
              Proyectos asociados
            </h3>
          </div>

          {!proyect || proyect.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Sin proyectos asociados</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="table-th">Proyecto</th>
                  <th className="table-th">Estado</th>
                  <th className="table-th">Inicio</th>
                  <th className="table-th">Incidencias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {proyect.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="table-td font-medium text-slate-800">{p.nombre}</td>
                    <td className="table-td"><Badge value={p.estado} /></td>
                    <td className="table-td text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        {p.inicio}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        p.incidencias > 0 ? 'text-orange-600' : 'text-slate-400'
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {p.incidencias} {p.incidencias === 1 ? 'incidencia' : 'incidencias'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Effect>

    </div>
  );
}
