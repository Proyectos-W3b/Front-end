// ─────────────────────────────────────────────────────────────────────────────
// Admin credential validation + client-side mock token
//
// TEMPORAL: credenciales hardcodeadas para pruebas sin backend.
// Para pasar a producción, reemplaza validateAdminCredentials por una llamada
// POST /api/admin/auth/login y emite el token desde el servidor.
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: 'superadmin';
  iat: number;
  exp: number;
}

// ── Credenciales hardcodeadas (SOLO para entorno de pruebas sin backend) ──────
const ADMIN_CREDENTIALS = [
  {
    id: 'admin-001',
    email: 'admin@empresa.com',
    password: 'Admin123*',
    name: 'Administrador',
    role: 'superadmin' as const,
  },
] as const;

const TOKEN_TTL_SECONDS = 8 * 60 * 60; // 8 horas

// ── Token (mock — no tiene firma criptográfica real) ──────────────────────────
export function generateAdminToken(
  payload: Pick<AdminTokenPayload, 'sub' | 'email' | 'name' | 'role'>,
): string {
  const now = Math.floor(Date.now() / 1000);
  const full: AdminTokenPayload = { ...payload, iat: now, exp: now + TOKEN_TTL_SECONDS };
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'MOCK-JWT' }));
  const body   = btoa(JSON.stringify(full));
  return `${header}.${body}.UNSIGNED`;
}

export function parseAdminToken(token: string): AdminTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1])) as AdminTokenPayload;
    // Verificar expiración
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Validación de credenciales ────────────────────────────────────────────────
export type AdminCredentialResult =
  | { ok: true;  id: string; email: string; name: string; role: 'superadmin' }
  | { ok: false; reason: string };

export function validateAdminCredentials(
  email: string,
  password: string,
): AdminCredentialResult {
  if (!email || !password) {
    return { ok: false, reason: 'Email y contraseña son requeridos.' };
  }

  const match = ADMIN_CREDENTIALS.find(
    (c) =>
      c.email.toLowerCase() === email.toLowerCase().trim() &&
      c.password === password,
  );

  if (!match) {
    return { ok: false, reason: 'Credenciales incorrectas. Verifica tu email y contraseña.' };
  }

  return { ok: true, id: match.id, email: match.email, name: match.name, role: match.role };
}

// ─────────────────────────────────────────────────────────────────────────────
// CÓMO MIGRAR A BACKEND REAL
// ─────────────────────────────────────────────────────────────────────────────
// 1. Elimina ADMIN_CREDENTIALS y la función validateAdminCredentials de aquí.
// 2. En admin-auth.store.ts → acción `login`, reemplaza la llamada local por:
//      const res = await fetch('/api/admin/auth/login', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, password }),
//      });
//      const data = await res.json();
//      if (!res.ok) return { success: false, error: data.message };
//      set({ token: data.token, email: data.user.email, name: data.user.name, isAuthenticated: true });
// 3. El backend emite el JWT con firma real (HS256/RS256).
// 4. parseAdminToken puede seguir decodificando el payload para leer la expiración,
//    o simplemente llamar a GET /api/admin/auth/me para validar la sesión.
// ─────────────────────────────────────────────────────────────────────────────
