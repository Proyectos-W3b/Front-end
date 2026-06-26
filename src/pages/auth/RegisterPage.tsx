import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import Spinner from '../../components/ui/Spinner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', role: 'employee',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.register(form);
      setAuth(res.user, res.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Launcher<span className="text-blue-400">Net</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Crear cuenta nueva</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Registro</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre</label>
              <input className="input" placeholder="Juan" value={form.nombre}
                onChange={(e) => set('nombre', e.target.value)} required />
            </div>
            <div>
              <label className="label">Apellido</label>
              <input className="input" placeholder="Pérez" value={form.apellido}
                onChange={(e) => set('apellido', e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="label">Correo electrónico</label>
            <input type="email" className="input" placeholder="juan@empresa.com"
              value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </div>

          <div>
            <label className="label">Contraseña</label>
            <input type="password" className="input" placeholder="Mínimo 6 caracteres"
              value={form.password} onChange={(e) => set('password', e.target.value)}
              minLength={6} required />
          </div>

          <div>
            <label className="label">Rol</label>
            <select className="input" value={form.role} onChange={(e) => set('role', e.target.value)}>
              <option value="employee">Empleado</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrador</option>
              <option value="client">Cliente</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
            {loading ? <Spinner size="sm" /> : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
