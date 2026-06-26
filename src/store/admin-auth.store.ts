import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  validateAdminCredentials,
  generateAdminToken,
  parseAdminToken,
} from '../lib/admin-auth';

interface AdminAuthState {
  token: string | null;
  email: string | null;
  name: string | null;
  isAuthenticated: boolean;

  /** Valida credenciales y abre la sesión. Devuelve el resultado. */
  login: (email: string, password: string) => { success: boolean; error?: string };

  /** Cierra la sesión admin y limpia el store. */
  logout: () => void;

  /** Verifica si el token almacenado sigue vigente. Limpia si expiró. */
  isTokenValid: () => boolean;
}

const CLEARED = { token: null, email: null, name: null, isAuthenticated: false } as const;

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      ...CLEARED,

      login(email, password) {
        const result = validateAdminCredentials(email, password);
        if (!result.ok) return { success: false, error: result.reason };

        const token = generateAdminToken({
          sub:   result.id,
          email: result.email,
          name:  result.name,
          role:  result.role,
        });

        set({ token, email: result.email, name: result.name, isAuthenticated: true });
        return { success: true };
      },

      logout() {
        set(CLEARED);
      },

      isTokenValid() {
        const { token } = get();
        if (!token) return false;
        const payload = parseAdminToken(token);
        if (!payload) {
          set(CLEARED); // sesión expirada — limpiar
          return false;
        }
        return true;
      },
    }),
    {
      name: 'admin-auth-store', // key en localStorage
      // Solo persistir token + info básica, no las funciones
      partialize: (s) => ({
        token:           s.token,
        email:           s.email,
        name:            s.name,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
);
