import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import notificacionesService from '../services/notificaciones.service';
import { createSocket } from '../lib/socket';
import { useAuthStore } from '../store/auth.store';

export function useNotificaciones() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  const lista = useQuery({
    queryKey: ['notificaciones'],
    queryFn: () => notificacionesService.getAll(),
    enabled: !!token,
    initialData: [],
  });

  const contador = useQuery({
    queryKey: ['notificaciones', 'contador'],
    queryFn: () => notificacionesService.contarNoLeidas(),
    enabled: !!token,
    initialData: 0,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
  };

  const marcarLeida = useMutation({
    mutationFn: (id: string) => notificacionesService.marcarLeida(id),
    onSuccess: invalidate,
  });

  const marcarTodas = useMutation({
    mutationFn: () => notificacionesService.marcarTodasLeidas(),
    onSuccess: invalidate,
  });

  useEffect(() => {
    if (!token) return;
    const socket = createSocket(token);
    socket.on('nuevaNotificacion', invalidate);
    return () => { socket.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { notificaciones: lista.data, noLeidas: contador.data, marcarLeida, marcarTodas };
}
