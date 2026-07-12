import { mensajesApi } from './api.service';
import type { Mensaje } from '../types';

export type { Mensaje };

const chatService = {
  async getTodos(): Promise<Mensaje[]> {
    return mensajesApi.getAll();
  },

  async getHistorial(clienteId: string): Promise<Mensaje[]> {
    return mensajesApi.getByCliente(clienteId);
  },

  async marcarLeidos(clienteId: string): Promise<void> {
    return mensajesApi.marcarLeidos(clienteId);
  },
};

export default chatService;
