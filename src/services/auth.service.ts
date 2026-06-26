import type { AuthResponse } from '../types';

const MOCK_USERS = [
  { id: 'usr-001', nombre: 'Admin',     correo: 'admin@empresa.com',    password: 'Admin123*',   rol: 'admin'    },
  { id: 'usr-002', nombre: 'Carlos',    correo: 'manager@empresa.com',  password: 'Manager123*', rol: 'manager'  },
  { id: 'usr-003', nombre: 'Miguel',    correo: 'empleado@empresa.com', password: 'Emp123*',     rol: 'employee' },
  { id: 'usr-004', nombre: 'Valentina', correo: 'cliente@empresa.com',  password: 'Client123*',  rol: 'client'   },
];

const RUNTIME: typeof MOCK_USERS = [];

function allUsers() { return [...MOCK_USERS, ...RUNTIME]; }

function fakeToken(userId: string) {
  const payload = btoa(JSON.stringify({ sub: userId, exp: Date.now() + 8 * 3600 * 1000 }));
  return `mock.${payload}.unsigned`;
}

const authService = {
  async login(form: { email: string; password: string }): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 300));
    const u = allUsers().find((u) => u.correo === form.email && u.password === form.password);
    if (!u) throw new Error('Credenciales incorrectas');
    const { password: _p, ...user } = u;
    return { user, token: fakeToken(u.id) };
  },

  async register(form: {
    nombre: string; apellido?: string; email: string; password: string; role?: string;
  }): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 300));
    if (allUsers().some((u) => u.correo === form.email)) {
      throw new Error('Ya existe una cuenta con este email');
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      nombre:   form.nombre,
      correo:   form.email,
      password: form.password,
      rol:      form.role ?? 'employee',
    };
    RUNTIME.push(newUser);
    const { password: _p, ...user } = newUser;
    return { user, token: fakeToken(newUser.id) };
  },
};

export default authService;
