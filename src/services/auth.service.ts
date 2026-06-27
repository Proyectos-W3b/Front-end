import { authApi } from './api.service';
import type { AuthResponse } from '../types';

const authService = {
  async login(form: { email: string; password: string }): Promise<AuthResponse> {
    return authApi.login(form.email, form.password);
  },

  async register(_form: unknown): Promise<AuthResponse> {
    throw new Error('El registro de usuarios debe realizarse desde el panel de administración.');
  },
};

export default authService;
