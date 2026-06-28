import { authApi } from './api.service';
import type { AuthResponse } from '../types';

const authService = {
  async login(form: { email: string; password: string }): Promise<AuthResponse> {
    return authApi.login(form.email, form.password);
  },
};

export default authService;
