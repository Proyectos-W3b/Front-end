import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    const data = error?.response?.data;
    const msg = Array.isArray(data?.message)
      ? data.message.join(', ')
      : (data?.message ?? error?.message ?? 'Error de conexión');
    return Promise.reject(new Error(String(msg)));
  },
);

export default api;
