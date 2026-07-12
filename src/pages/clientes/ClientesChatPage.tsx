import { useState, useEffect, useRef, useMemo, FormEvent } from 'react';
import { Send, ExternalLink, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import { useAuthStore } from '../../store/auth.store';
import clientesService from '../../services/clientes.service';
import chatService from '../../services/chat.service';
import { uploadsApi } from '../../services/api.service';
import { createSocket } from '../../lib/socket';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/button';
import { Message, MessageAvatar, MessageContent, MessageFooter } from '../../components/ui/message';
import {
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from '../../components/ui/message-scroller';
import AttachFileModal, { tipoFromFile, FileTypeIcon } from '../../components/ui/AttachFileModal';
import type { Cliente, Mensaje } from '../../types';

// ── Color/iniciales deterministas por persona (cliente, admin o soporte) ───────
const COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-teal-500'];

function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initialsFor(nombre: string) {
  const words = nombre.trim().split(/\s+/);
  return ((words[0]?.[0] ?? '?') + (words[1]?.[0] ?? '')).toUpperCase();
}

function Avatar({ nombre, id, size = 'md' }: { nombre: string; id: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} ${colorFor(id)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initialsFor(nombre)}
    </div>
  );
}

interface Conversacion {
  cliente: Cliente;
  ultimoMensaje?: Mensaje;
  noLeidos: number;
}

export default function ClientesChatPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.rol === 'admin';
  const navigate = useNavigate();

  const [loading,       setLoading]       = useState(true);
  const [clientes,      setClientes]      = useState<Cliente[]>([]);
  const [propioCliente, setPropioCliente] = useState<Cliente | null>(null);
  const [mensajesTodos, setMensajesTodos] = useState<Mensaje[]>([]);
  const [activoId,      setActivoId]      = useState<string | null>(null);
  const [mensajes,      setMensajes]      = useState<Mensaje[]>([]);
  const [input,         setInput]         = useState('');
  const [attachOpen,    setAttachOpen]    = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const activoRef = useRef<string | null>(null);

  useEffect(() => { activoRef.current = activoId; }, [activoId]);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          const [c, m] = await Promise.all([clientesService.getAll(), chatService.getTodos()]);
          setClientes(c);
          setMensajesTodos(m);
        } else {
          const perfil = await clientesService.getMiPerfil();
          setPropioCliente(perfil);
          setActivoId(perfil.id);
          setMensajes(await chatService.getHistorial(perfil.id));
          chatService.marcarLeidos(perfil.id).catch(() => {});
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  // ── Conexión WebSocket ────────────────────────────────────────────────────
  useEffect(() => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    const socket = createSocket(token);
    socketRef.current = socket;

    socket.on('nuevoMensaje', (msg: Mensaje) => {
      setMensajesTodos((prev) => [...prev, msg]);
      if (msg.clienteId === activoRef.current) {
        setMensajes((prev) => [...prev, msg]);
      }
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, []);

  // ── Unirse a las conversaciones relevantes ───────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (isAdmin) {
      clientes.forEach((c) => socket.emit('unirseChat', { clienteId: c.id }));
    } else if (propioCliente) {
      socket.emit('unirseChat', { clienteId: propioCliente.id });
    }
  }, [clientes, propioCliente, isAdmin]);

  const conversaciones: Conversacion[] = useMemo(() => {
    return clientes
      .map((cliente) => {
        const propios = mensajesTodos.filter((m) => m.clienteId === cliente.id);
        const ultimoMensaje = propios.length > 0
          ? propios.reduce((a, b) => (new Date(a.fecha) > new Date(b.fecha) ? a : b))
          : undefined;
        const noLeidos = propios.filter((m) => m.autorRol === 'cliente' && !m.leido).length;
        return { cliente, ultimoMensaje, noLeidos };
      })
      .sort((a, b) => {
        if (!a.ultimoMensaje) return 1;
        if (!b.ultimoMensaje) return -1;
        return new Date(b.ultimoMensaje.fecha).getTime() - new Date(a.ultimoMensaje.fecha).getTime();
      });
  }, [clientes, mensajesTodos]);

  const activoCliente = clientes.find((c) => c.id === activoId) ?? null;

  const seleccionar = async (cliente: Cliente) => {
    setActivoId(cliente.id);
    setMensajes(await chatService.getHistorial(cliente.id));
    chatService.marcarLeidos(cliente.id).catch(() => {});
    setMensajesTodos((prev) =>
      prev.map((m) => (m.clienteId === cliente.id && m.autorRol === 'cliente' ? { ...m, leido: true } : m)),
    );
  };

  const handleEnviar = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activoId || !socketRef.current) return;
    socketRef.current.emit('enviarMensaje', { clienteId: activoId, contenido: input.trim() });
    setInput('');
  };

  const handleEnviarArchivo = async (file: File) => {
    if (!activoId || !socketRef.current) return;
    const objectPath = await uploadsApi.subirArchivo(file, 'chat');
    socketRef.current.emit('enviarMensaje', {
      clienteId: activoId,
      archivoUrl: objectPath,
      archivoNombre: file.name,
      archivoTipo: tipoFromFile(file),
    });
  };

  if (loading) return <FullPageSpinner />;

  const esPropio = (msg: Mensaje) => msg.autorRol === (isAdmin ? 'admin' : 'cliente');

  // ── Ventana de chat — compartida por la vista admin y la vista cliente ────
  const ventana = (
    <>
      <MessageScroller className="flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent className="px-5 py-5">
            {mensajes.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-slate-400">Sin mensajes aún. ¡Inicia la conversación!</p>
              </div>
            ) : (
              mensajes.map((msg) => {
                const propio = esPropio(msg);
                return (
                  <MessageScrollerItem key={msg.id}>
                    <Message align={propio ? 'end' : 'start'}>
                      <MessageAvatar>
                        {propio ? (
                          user?.fotoUrl ? (
                            <img src={user.fotoUrl} alt={user.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold bg-blue-600">
                              {(user?.nombre?.[0] ?? '?').toUpperCase()}
                            </div>
                          )
                        ) : msg.autorFotoUrl ? (
                          <img src={msg.autorFotoUrl} alt={msg.autorNombre} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center text-white text-xs font-bold ${colorFor(msg.autorId)}`}>
                            {initialsFor(msg.autorNombre)}
                          </div>
                        )}
                      </MessageAvatar>
                      <MessageContent>
                        {msg.archivoUrl && (
                          msg.archivoTipo === 'imagen' ? (
                            <a href={msg.archivoUrl} target="_blank" rel="noopener noreferrer" className="block max-w-[240px] rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                              <img src={msg.archivoUrl} alt={msg.archivoNombre ?? 'imagen'} className="w-full h-auto object-cover" />
                            </a>
                          ) : (
                            <a href={msg.archivoUrl} download={msg.archivoNombre} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl max-w-[240px] border transition-colors ${
                              propio
                                ? 'bg-blue-500/20 border-blue-400 hover:bg-blue-500/30'
                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                            }`}>
                              <FileTypeIcon tipo={msg.archivoTipo ?? 'otro'} className="w-6 h-6 shrink-0" />
                              <span className={`text-xs font-medium truncate ${propio ? 'text-white' : 'text-slate-700'}`}>
                                {msg.archivoNombre ?? 'Archivo adjunto'}
                              </span>
                            </a>
                          )
                        )}
                        {msg.contenido && (
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[80%] ${
                            propio
                              ? 'bg-blue-600 text-white rounded-tr-sm'
                              : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'
                          }`}>
                            {msg.contenido}
                          </div>
                        )}
                        <MessageFooter>
                          {new Date(msg.fecha).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                        </MessageFooter>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                );
              })
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton direction="end" />
      </MessageScroller>

      <form onSubmit={handleEnviar} className="bg-white border-t border-slate-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={() => setAttachOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
          title="Adjuntar archivo"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" disabled={!input.trim()} size="icon" className="rounded-xl shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </form>

      <AttachFileModal
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        onConfirm={handleEnviarArchivo}
      />
    </>
  );

  // ── Vista cliente: un solo hilo con soporte ───────────────────────────────
  if (!isAdmin) {
    return (
      <div className="flex h-[calc(100vh-112px)] rounded-2xl overflow-hidden border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
        <div className="flex-1 flex flex-col bg-slate-50">
          <div className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">S</div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Soporte</p>
              <p className="text-xs text-slate-400">Escríbenos sobre tu proyecto</p>
            </div>
          </div>
          {ventana}
        </div>
      </div>
    );
  }

  // ── Vista admin: lista de conversaciones + hilo activo ────────────────────
  return (
    <div className="flex h-[calc(100vh-112px)] gap-0 rounded-2xl overflow-hidden border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">

      {/* PANEL IZQUIERDO */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Chats de Clientes</h3>
            <span className="text-[11px] text-slate-400">{clientes.length} clientes</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {conversaciones.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8 px-4">No hay clientes registrados aún</p>
          ) : (
            conversaciones.map(({ cliente, ultimoMensaje, noLeidos }) => (
              <button
                key={cliente.id}
                onClick={() => seleccionar(cliente)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left ${
                  activoId === cliente.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                }`}
              >
                <Avatar nombre={cliente.empresa} id={cliente.id} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 truncate">{cliente.empresa}</span>
                    {ultimoMensaje && (
                      <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">
                        {new Date(ultimoMensaje.fecha).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {ultimoMensaje ? ultimoMensaje.contenido : 'Sin mensajes aún'}
                  </p>
                </div>
                {noLeidos > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {noLeidos}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* PANEL DERECHO */}
      {activoCliente ? (
        <div className="flex-1 flex flex-col bg-slate-50">
          <div className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center gap-3 flex-shrink-0">
            <Avatar nombre={activoCliente.empresa} id={activoCliente.id} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm">{activoCliente.empresa}</p>
            </div>
            <button
              onClick={() => navigate(`/clientes/${activoCliente.id}`)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Ver detalle
            </button>
          </div>
          {ventana}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8 bg-slate-50">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Send className="w-7 h-7 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-700">Selecciona un cliente</p>
          <p className="text-sm text-slate-400 max-w-[220px]">
            Elige un cliente de la lista para ver y gestionar su conversación
          </p>
        </div>
      )}
    </div>
  );
}
