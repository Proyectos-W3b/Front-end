import { useState, useEffect, useRef, FormEvent } from 'react';
import { Send, Circle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { chatService, type ChatCliente, type Mensaje } from '../../services/chat.service';
import { useAuthStore } from '../../store/auth.store';
import {
  AvatarGroup,
  AvatarGroupTooltip,
} from '../../components/animate-ui/primitives/animate/avatar-group';

// ── Avatar de cliente ─────────────────────────────────────────────────────────
function Avatar({ iniciales, color, size = 'md' }: { iniciales: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {iniciales}
    </div>
  );
}

// ── Burbuja de mensaje ────────────────────────────────────────────────────────
const TIPO_BADGE: Record<string, string> = {
  incidencia: 'bg-orange-100 text-orange-700',
  proyecto:   'bg-blue-100   text-blue-700',
};

function Burbuja({ msg, esPropio }: { msg: Mensaje; esPropio: boolean }) {
  const hora = new Date(msg.fecha).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex gap-2 ${esPropio ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`max-w-[68%] space-y-1 ${esPropio ? 'items-end' : 'items-start'} flex flex-col`}>
        {msg.tipo !== 'texto' && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TIPO_BADGE[msg.tipo]}`}>
            {msg.tipo === 'incidencia' ? '⚠ Incidencia' : '📁 Proyecto'}
          </span>
        )}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          esPropio
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'
        }`}>
          {msg.contenido}
        </div>
        <span className="text-[10px] text-slate-400 px-1">{hora}</span>
      </div>
    </motion.div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function ClientesChatPage() {
  const user           = useAuthStore((s) => s.user);
  const navigate       = useNavigate();
  const [chats,        setChats]        = useState<ChatCliente[]>([]);
  const [activo,       setActivo]       = useState<ChatCliente | null>(null);
  const [mensajes,     setMensajes]     = useState<Mensaje[]>([]);
  const [input,        setInput]        = useState('');
  const bottomRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChats(chatService.getChats());
  }, []);

  useEffect(() => {
    if (!activo) return;
    setMensajes(chatService.getHistorial(activo.clienteId));
    const unsub = chatService.onMensaje(activo.clienteId, (msg) => {
      setMensajes((prev) => [...prev, msg]);
    });
    return unsub;
  }, [activo]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activo || !user) return;
    chatService.enviar(activo.clienteId, input.trim(), user.id, 'Tú');
    setInput('');
    setChats((prev) =>
      prev.map((c) =>
        c.clienteId === activo.clienteId
          ? { ...c, ultimoMensaje: input.trim(), fecha: 'Ahora', noLeidos: 0 }
          : c
      )
    );
  };

  const seleccionar = (chat: ChatCliente) => {
    setActivo(chat);
    setChats((prev) =>
      prev.map((c) => c.clienteId === chat.clienteId ? { ...c, noLeidos: 0 } : c)
    );
  };

  const onlineChats = chats.filter((c) => c.online);

  return (
    <div className="flex h-[calc(100vh-112px)] gap-0 rounded-2xl overflow-hidden border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">

      {/* ── PANEL IZQUIERDO — lista de clientes ──────────────────────────── */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col">

        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Chats de Clientes</h3>
            <span className="text-[11px] text-slate-400">{chats.length} clientes</span>
          </div>

          {/* Avatares online con AvatarGroup */}
          {onlineChats.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">En línea</p>
              <AvatarGroup>
                {onlineChats.map((c) => (
                  <div key={c.clienteId}>
                    <div
                      onClick={() => navigate(`/clientes/${c.clienteId}`)}
                      className={`w-9 h-9 ${c.color} rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer ring-2 ring-white hover:scale-110 transition-transform`}
                      title={c.empresa}
                    >
                      {c.iniciales}
                    </div>
                    <AvatarGroupTooltip>{c.empresa} — ver detalle</AvatarGroupTooltip>
                  </div>
                ))}
              </AvatarGroup>
            </div>
          )}
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {chats.map((chat) => (
            <button
              key={chat.clienteId}
              onClick={() => seleccionar(chat)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left ${
                activo?.clienteId === chat.clienteId ? 'bg-blue-50 border-r-2 border-blue-600' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                <Avatar iniciales={chat.iniciales} color={chat.color} size="md" />
                <Circle
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${
                    chat.online ? 'text-emerald-500 fill-emerald-500' : 'text-slate-300 fill-slate-300'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 truncate">{chat.empresa}</span>
                  <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">{chat.fecha}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{chat.ultimoMensaje}</p>
              </div>
              {chat.noLeidos > 0 && (
                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {chat.noLeidos}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── PANEL DERECHO — ventana de chat ──────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-slate-50">

        {activo ? (
          <>
            {/* Header chat */}
            <div className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center gap-3 flex-shrink-0">
              <div className="relative">
                <Avatar iniciales={activo.iniciales} color={activo.color} size="md" />
                <Circle className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${
                  activo.online ? 'text-emerald-500 fill-emerald-500' : 'text-slate-300 fill-slate-300'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm">{activo.empresa}</p>
                <p className={`text-xs ${activo.online ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {activo.online ? 'En línea' : 'Desconectado'}
                </p>
              </div>
              <button
                onClick={() => navigate(`/clientes/${activo.clienteId}`)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Ver detalle
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
              <AnimatePresence initial={false}>
                {mensajes.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-slate-400">Sin mensajes aún. ¡Inicia la conversación!</p>
                  </div>
                ) : (
                  mensajes.map((msg) => (
                    <Burbuja
                      key={msg.id}
                      msg={msg}
                      esPropio={msg.autorId === user?.id || msg.autorNombre === 'Tú'}
                    />
                  ))
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleEnviar}
              className="bg-white border-t border-slate-100 px-4 py-3 flex items-center gap-3 flex-shrink-0"
            >
              <input
                className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                placeholder="Escribe un mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
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

    </div>
  );
}
