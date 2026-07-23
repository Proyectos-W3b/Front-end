import api from '../lib/api';
import { authApi } from './api.service';
import type { AuthResponse } from '../types';

const authService = {
  async login(form: { email: string; password: string }): Promise<AuthResponse> {
    return authApi.login(form.email, form.password);
  },

  async register(form: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    role: string;
  }): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', form);
    return { user: data.user, token: data.access_token };
  },
};

export default authService;
