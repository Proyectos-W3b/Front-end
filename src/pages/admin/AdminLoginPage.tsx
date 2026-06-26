import { useState, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/admin-auth.store';

export default function AdminLoginPage() {
  const { login, isAuthenticated, isTokenValid } = useAdminAuthStore();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Ya autenticado → ir directo al panel
  if (isAuthenticated && isTokenValid()) {
    return <Navigate to="/admin" replace />;
  }

  const MAX_ATTEMPTS = 5;
  const blocked = attempts >= MAX_ATTEMPTS;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (blocked) return;
    setError('');
    setLoading(true);

    // Delay artificial para evitar brute-force básico en cliente
    await new Promise((r) => setTimeout(r, 700));

    const result = login(email, password);

    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setError(
        next >= MAX_ATTEMPTS
          ? `Demasiados intentos fallidos. Recarga la página para intentar de nuevo.`
          : result.error ?? 'Error de autenticación',
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Fondo radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.15),transparent)]" />

      <div className="relative w-full max-w-sm space-y-6">
        {/* Encabezado */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/40 text-3xl">
            🛡
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Panel Administrativo
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Launcher<span className="text-blue-400 font-semibold">Net</span>
              {' '}· Acceso restringido
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Alerta de error */}
            {error && (
              <div className="bg-red-950/50 border border-red-800/50 rounded-xl px-4 py-3 flex items-start gap-2.5 text-sm text-red-400">
                <span className="flex-shrink-0 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Aviso de intentos */}
            {attempts > 0 && attempts < MAX_ATTEMPTS && (
              <p className="text-xs text-yellow-600 text-right">
                {MAX_ATTEMPTS - attempts} intento{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} restante{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''}
              </p>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">
                Email administrativo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@empresa.com"
                required
                disabled={blocked || loading}
                autoComplete="email"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           disabled:opacity-40 disabled:cursor-not-allowed transition"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={blocked || loading}
                  autoComplete="current-password"
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 pr-11 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             disabled:opacity-40 disabled:cursor-not-allowed transition"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition text-sm select-none"
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || blocked}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700
                         disabled:bg-slate-700 disabled:cursor-not-allowed
                         text-white font-semibold py-2.5 rounded-xl text-sm
                         flex items-center justify-center gap-2
                         transition-colors duration-150 shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando credenciales...
                </>
              ) : blocked ? (
                'Acceso bloqueado'
              ) : (
                'Ingresar al panel'
              )}
            </button>
          </form>
        </div>

        {/* Volver */}
        <div className="text-center space-y-1">
          <a
            href="/login"
            className="text-slate-600 hover:text-slate-400 text-xs transition-colors block"
          >
            ← Volver al inicio de sesión general
          </a>
          <p className="text-slate-800 text-xs">
            Acceso exclusivo para administradores del sistema
          </p>
        </div>
      </div>
    </div>
  );
}
