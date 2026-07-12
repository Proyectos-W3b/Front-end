import { io, type Socket } from 'socket.io-client';

/** El WebSocket vive en el mismo puerto que el apigateway (3000), sin el prefijo /api. */
export function createSocket(token: string): Socket {
  return io('http://localhost:3000', {
    auth: { token },
  });
}
