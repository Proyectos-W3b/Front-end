import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import authService from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import Spinner from '../../components/ui/Spinner';
import { Effect } from '../../components/animate-ui/primitives/effects/effect';
import { SplittingText } from '../../components/animate-ui/primitives/texts/splitting';
import { Button } from '../../components/animate-ui/primitives/buttons/button';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth  = useAuthStore((s) => s.setAuth);

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(form);
      setAuth(res.user, res.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">

      {/* ── IZQUIERDA ──────────────────────────────────────────────────────── */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-[360px] h-[360px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-indigo-600/15 blur-3xl" />

        {/* Tipografía editorial */}
        <div className="relative z-10 flex flex-col justify-center flex-1 gap-2">

          <Effect slide={{ direction: 'down', offset: 24 }} fade delay={80}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          >
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-[0.25em] mb-3">
              PortalSeguimiento
            </p>
          </Effect>

          <Effect slide={{ direction: 'left', offset: 40 }} fade delay={160}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          >
            <h2 className="text-7xl font-black uppercase text-white leading-none tracking-tight">
              <SplittingText
                text="VISUALIZA,"
                type="chars"
                initial={{ y: 32, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                stagger={0.04}
              />
            </h2>
          </Effect>

          <Effect slide={{ direction: 'left', offset: 40 }} fade delay={260}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          >
            <h2 className="text-7xl font-black uppercase text-white leading-none tracking-tight">
              <SplittingText
                text="CONTROLA,"
                type="chars"
                initial={{ y: 32, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                stagger={0.03}
              />
            </h2>
          </Effect>

          {/* Palabra destacada en bloque de color */}
          <Effect slide={{ direction: 'left', offset: 48 }} fade delay={380}
            transition={{ type: 'spring', stiffness: 160, damping: 20 }}
          >
            <div className="inline-block bg-blue-500 px-4 py-2 mt-1">
              <span className="text-7xl font-black uppercase text-white leading-none tracking-tight">
                ENTREGA.
              </span>
            </div>
          </Effect>

          {/* Frase */}
          <Effect slide fade delay={520}
            transition={{ type: 'spring', stiffness: 160, damping: 24 }}
          >
            <p className="text-slate-400 text-sm leading-relaxed mt-4 max-w-[280px]">
              Seguimiento de incidencias, clientes y equipos en un solo lugar.{' '}
              <span className="text-white font-medium">Si tu proyecto avanza, tú lo ves.</span>
            </p>
          </Effect>

        </div>

        <Effect slide fade delay={620}
          transition={{ type: 'spring', stiffness: 160, damping: 24 }}
          className="relative z-10"
        >
          <p className="text-slate-600 text-xs">© 2025 PortalSeguimiento</p>
        </Effect>
      </div>

      {/* ── DERECHA ────────────────────────────────────────────────────────── */}
      <div className="flex-1 bg-white flex flex-col">

        {/* Header del panel derecho */}
        <Effect slide={{ direction: 'down', offset: 16 }} fade delay={100}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          className="px-10 xl:px-14 pt-10 pb-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              Portal<span className="text-blue-600">Seguimiento</span>
            </span>
            <span className="text-xs text-slate-400">Sistema de Proyectos</span>
          </div>
        </Effect>

        {/* Form centrado */}
        <div className="flex-1 flex flex-col justify-center px-10 xl:px-14">
        <div className="max-w-sm w-full mx-auto space-y-6">

          {/* Encabezado */}
          <Effect slide fade delay={150}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          >
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                <SplittingText
                  text="INICIA SESIÓN"
                  type="words"
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  stagger={0.1}
                />
              </h2>
              <p className="text-slate-400 text-sm mt-1.5">Ingresa tus credenciales para continuar</p>
            </div>
          </Effect>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <Effect slide fade delay={250}
            transition={{ type: 'spring', stiffness: 160, damping: 24 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Correo electrónico</label>
                <input
                  type="email" className="input" placeholder="admin@empresa.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Contraseña</label>
                <input
                  type="password" className="input" placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 rounded-lg"
              >
                {loading ? <Spinner size="sm" /> : 'Ingresar'}
              </Button>
            </form>
          </Effect>


        </div>
        </div>

        {/* Footer derecho */}
        <Effect slide={{ direction: 'up', offset: 12 }} fade delay={500}
          transition={{ type: 'spring', stiffness: 180, damping: 24 }}
          className="px-10 xl:px-14 pb-8"
        >
          <p className="text-xs text-slate-300 text-center">© 2025 PortalSeguimiento</p>
        </Effect>

      </div>

    </div>
  );
}