import { useState } from 'react';

interface Config {
  nombreSistema: string;
  descripcion: string;
  idioma: string;
  zonaHoraria: string;
  sessionTimeout: number;
  maxIntentos: number;
  emailNotificaciones: string;
  modoMantenimiento: boolean;
  registroAuditoria: boolean;
  registroNivel: 'error' | 'warn' | 'info' | 'debug';
  maxTamanioArchivo: number;
  backupAutomatico: boolean;
  frecuenciaBackup: 'diario' | 'semanal' | 'mensual';
}

const DEFAULT: Config = {
  nombreSistema: 'LauncherNet',
  descripcion: 'Sistema de gestión de seguimiento de proyectos de clientes',
  idioma: 'es',
  zonaHoraria: 'America/Bogota',
  sessionTimeout: 60,
  maxIntentos: 5,
  emailNotificaciones: 'admin@launchernet.com',
  modoMantenimiento: false,
  registroAuditoria: true,
  registroNivel: 'info',
  maxTamanioArchivo: 10,
  backupAutomatico: true,
  frecuenciaBackup: 'diario',
};

function SectionTitle({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1 border-b border-gray-100">
      <span>{icon}</span>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 m-0.5 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </label>
  );
}

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Config>(DEFAULT);
  const [saved, setSaved]   = useState(false);

  const set = <K extends keyof Config>(key: K, value: Config[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm('¿Restaurar configuración por defecto?')) setConfig(DEFAULT);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Configuración del Sistema</h2>
        <p className="text-sm text-gray-500">Parámetros generales de LauncherNet</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <span>✓</span> Configuración guardada localmente
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* General */}
        <div className="card space-y-4">
          <SectionTitle title="General" icon="⚙️" />
          <div>
            <label className="label">Nombre del sistema</label>
            <input className="input" value={config.nombreSistema}
              onChange={(e) => set('nombreSistema', e.target.value)} />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea className="input resize-none" rows={2} value={config.descripcion}
              onChange={(e) => set('descripcion', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Idioma</label>
              <select className="input" value={config.idioma} onChange={(e) => set('idioma', e.target.value)}>
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
            <div>
              <label className="label">Zona horaria</label>
              <select className="input" value={config.zonaHoraria} onChange={(e) => set('zonaHoraria', e.target.value)}>
                <option value="America/Bogota">América/Bogotá (UTC-5)</option>
                <option value="America/Mexico_City">América/México (UTC-6)</option>
                <option value="America/Argentina/Buenos_Aires">América/Buenos Aires (UTC-3)</option>
                <option value="America/Lima">América/Lima (UTC-5)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="card space-y-4">
          <SectionTitle title="Seguridad" icon="🔒" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Timeout de sesión (min)</label>
              <input type="number" className="input" value={config.sessionTimeout} min={5} max={480}
                onChange={(e) => set('sessionTimeout', +e.target.value)} />
            </div>
            <div>
              <label className="label">Máx. intentos de login</label>
              <input type="number" className="input" value={config.maxIntentos} min={1} max={20}
                onChange={(e) => set('maxIntentos', +e.target.value)} />
            </div>
          </div>
          <Toggle checked={config.modoMantenimiento}
            onChange={(v) => set('modoMantenimiento', v)}
            label="Modo mantenimiento (bloquea acceso a usuarios no-admin)" />
        </div>

        {/* Notificaciones */}
        <div className="card space-y-4">
          <SectionTitle title="Notificaciones" icon="📧" />
          <div>
            <label className="label">Email de notificaciones del sistema</label>
            <input type="email" className="input" value={config.emailNotificaciones}
              onChange={(e) => set('emailNotificaciones', e.target.value)} />
          </div>
        </div>

        {/* Logging */}
        <div className="card space-y-4">
          <SectionTitle title="Registro y Auditoría" icon="📋" />
          <Toggle checked={config.registroAuditoria}
            onChange={(v) => set('registroAuditoria', v)}
            label="Habilitar registro de auditoría" />
          <div>
            <label className="label">Nivel de logging</label>
            <select className="input" value={config.registroNivel}
              onChange={(e) => set('registroNivel', e.target.value as Config['registroNivel'])}>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
        </div>

        {/* Almacenamiento */}
        <div className="card space-y-4">
          <SectionTitle title="Almacenamiento y Backup" icon="💾" />
          <div>
            <label className="label">Tamaño máximo de archivo (MB)</label>
            <input type="number" className="input" value={config.maxTamanioArchivo} min={1} max={100}
              onChange={(e) => set('maxTamanioArchivo', +e.target.value)} />
          </div>
          <Toggle checked={config.backupAutomatico}
            onChange={(v) => set('backupAutomatico', v)}
            label="Backup automático de base de datos" />
          {config.backupAutomatico && (
            <div>
              <label className="label">Frecuencia de backup</label>
              <select className="input" value={config.frecuenciaBackup}
                onChange={(e) => set('frecuenciaBackup', e.target.value as Config['frecuenciaBackup'])}>
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={handleReset}>Restaurar por defecto</button>
          <button type="submit" className="btn-primary">Guardar configuración</button>
        </div>
      </form>

      <p className="text-xs text-gray-400 text-center pb-4">
        Los cambios se guardan localmente. La integración con el backend estará disponible en la siguiente versión.
      </p>
    </div>
  );
}
