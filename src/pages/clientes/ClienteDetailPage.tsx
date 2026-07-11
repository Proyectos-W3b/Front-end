import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, MapPin, FolderOpen, Calendar, ExternalLink } from 'lucide-react';
import { Effect } from '../../components/animate-ui/primitives/effects/effect';
import Badge from '../../components/ui/Badge';
import { clientesApi, proyectsApi, usuariosApi } from '../../services/api.service';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { toProjectPath } from '../../lib/slug';
import type { Cliente, Project } from '../../types';

export default function ClienteDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cliente,       setCliente]       = useState<Cliente | null>(null);
  const [usuarioNombre, setUsuarioNombre] = useState('');
  const [usuarioCorreo, setUsuarioCorreo] = useState('');
  const [projects,      setProjects]      = useState<Project[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [notFound,      setNotFound]      = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [c, allProjects] = await Promise.all([
          clientesApi.getOne(id),
          proyectsApi.getAll({ limit: 100 }),
        ]);
        setCliente(c);
        setProjects(allProjects.filter((p) => p.clienteId === id));

        // Fetch usuario info (nombre / correo)
        try {
          const u = await usuariosApi.getOne(c.usuarioId);
          setUsuarioNombre(u.nombre);
          setUsuarioCorreo(u.correo);
        } catch { /* noop */ }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <FullPageSpinner />;

  if (notFound || !cliente) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-slate-500 text-sm">Cliente no encontrado</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">Volver</button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Volver */}
      <Effect slide={{ direction: 'down', offset: 12 }} fade
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </Effect>

      {/* Header cliente */}
      <Effect slide={{ direction: 'up', offset: 16 }} fade delay={80}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0">
              {cliente.empresa[0]?.toUpperCase() ?? '?'}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900">{cliente.empresa}</h2>
              {usuarioNombre && (
                <p className="text-slate-500 text-sm mt-0.5">{usuarioNombre}</p>
              )}
              <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full mt-1.5 ${
                cliente.estaActivo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}>
                {cliente.estaActivo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Info de contacto */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100">
            {usuarioCorreo && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Correo</p>
                  <p className="text-sm font-medium text-slate-700">{usuarioCorreo}</p>
                </div>
              </div>
            )}
            {cliente.telefono && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Teléfono</p>
                  <p className="text-sm font-medium text-slate-700">{cliente.telefono}</p>
                </div>
              </div>
            )}
            {cliente.direccion && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Dirección</p>
                  <p className="text-sm font-medium text-slate-700">{cliente.direccion}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Cliente desde</p>
                <p className="text-sm font-medium text-slate-700">
                  {new Date(cliente.creadoEn).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
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
              <span className="ml-1 text-xs font-normal text-slate-400">({projects.length})</span>
            </h3>
          </div>

          {projects.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Sin proyectos asociados</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="table-th">Proyecto</th>
                  <th className="table-th">Estado</th>
                  <th className="table-th">Inicio</th>
                  <th className="table-th text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="table-td font-medium text-slate-800">{p.nombre}</td>
                    <td className="table-td"><Badge value={p.estado} /></td>
                    <td className="table-td text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        {p.fechaInicio
                          ? new Date(p.fechaInicio).toLocaleDateString('es-ES')
                          : '—'}
                      </span>
                    </td>
                    <td className="table-td text-right">
                      <Link
                        to={toProjectPath(p)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        Ver <ExternalLink className="w-3 h-3" />
                      </Link>
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
