import { io, type Socket } from 'socket.io-client';

/** El WebSocket vive en el mismo puerto que el apigateway, sin el prefijo /api. */
export function createSocket(token: string): Socket {
  return io(import.meta.env.VITE_API_URL, {
    auth: { token },
  });
}
