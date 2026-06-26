// ─────────────────────────────────────────────────────────────────────────────
// Mock de autenticación local — sin backend
// Reemplaza este archivo por llamadas reales a la API cuando el backend esté listo.
// ─────────────────────────────────────────────────────────────────────────────
import type { User, UserRole, AuthResponse } from '../types';

interface MockCredential {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Base de usuarios de prueba ────────────────────────────────────────────────
const DB: MockCredential[] = [
  {
    id: 'usr-001', nombre: 'Admin',      apellido: 'Sistema',
    email: 'admin@empresa.com',     password: 'Admin123*',
    role: 'admin',    isActive: true, createdAt: '2025-01-01', updatedAt: '2025-01-01',
  },
  {
    id: 'usr-002', nombre: 'Carlos',     apellido: 'Ramírez',
    email: 'manager@empresa.com',   password: 'Manager123*',
    role: 'manager',  isActive: true, createdAt: '2025-02-01', updatedAt: '2025-02-01',
  },
  {
    id: 'usr-003', nombre: 'Miguel',     apellido: 'Torres',
    email: 'empleado@empresa.com',  password: 'Emp123*',
    role: 'employee', isActive: true, createdAt: '2025-03-01', updatedAt: '2025-03-01',
  },
  {
    id: 'usr-004', nombre: 'Valentina',  apellido: 'López',
    email: 'cliente@empresa.com',   password: 'Client123*',
    role: 'client',   isActive: true, createdAt: '2025-04-01', updatedAt: '2025-04-01',
  },
];

// Usuarios registrados en tiempo de ejecución (se pierden al recargar)
const RUNTIME_USERS: MockCredential[] = [];

function allUsers() { return [...DB, ...RUNTIME_USERS]; }

// ── Token mock (no firmado — solo para desarrollo local) ──────────────────────
function generateToken(user: MockCredential): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id, email: user.email,
    nombre: user.nombre, apellido: user.apellido,
    role: user.role, iat: now, exp: now + 8 * 60 * 60,
  };
  const header  = btoa(JSON.stringify({ alg: 'none', typ: 'MOCK-JWT' }));
  const body    = btoa(JSON.stringify(payload));
  return `${header}.${body}.UNSIGNED`;
}

function toUser(c: MockCredential): User {
  return {
    id: c.id, nombre: c.nombre, apellido: c.apellido,
    email: c.email, role: c.role, isActive: c.isActive,
    createdAt: c.createdAt, updatedAt: c.updatedAt,
  };
}

// ── API pública ───────────────────────────────────────────────────────────────
export function mockLogin(email: string, password: string): AuthResponse {
  const user = allUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password,
  );
  if (!user) throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
  if (!user.isActive) throw new Error('Usuario desactivado. Contacta al administrador.');
  return { user: toUser(user), token: generateToken(user) };
}

export function mockRegister(data: {
  nombre: string; apellido: string; email: string; password: string; role?: string;
}): AuthResponse {
  if (allUsers().some((u) => u.email.toLowerCase() === data.email.toLowerCase().trim())) {
    throw new Error('Ya existe una cuenta con este email.');
  }
  const newUser: MockCredential = {
    id: `usr-${Date.now()}`,
    nombre:   data.nombre,
    apellido: data.apellido,
    email:    data.email,
    password: data.password,
    role:     (data.role as UserRole) ?? 'employee',
    isActive: true,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  };
  RUNTIME_USERS.push(newUser);
  return { user: toUser(newUser), token: generateToken(newUser) };
}

export function mockGetUsers(): User[] {
  return allUsers().map(toUser);
}

// Credenciales visibles en UI de desarrollo
export const DEV_ACCOUNTS = [
  { email: 'admin@empresa.com',    password: 'Admin123*',   role: 'admin'    },
  { email: 'manager@empresa.com',  password: 'Manager123*', role: 'manager'  },
  { email: 'empleado@empresa.com', password: 'Emp123*',     role: 'employee' },
  { email: 'cliente@empresa.com',  password: 'Client123*',  role: 'client'   },
] as const;
