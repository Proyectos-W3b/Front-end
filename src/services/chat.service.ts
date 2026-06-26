export interface ChatCliente {
  clienteId:     string;
  empresa:       string;
  iniciales:     string;
  color:         string;
  online:        boolean;
  ultimoMensaje: string;
  fecha:         string;
  noLeidos:      number;
}

export interface Mensaje {
  id:          string;
  contenido:   string;
  fecha:       string;
  autorId:     string;
  autorNombre: string;
  tipo:        'texto' | 'incidencia' | 'proyecto';
}

export const MOCK_CHATS: ChatCliente[] = [
  { clienteId: 'cli-001', empresa: 'Acme Corp',        iniciales: 'AC', color: 'bg-blue-500',    online: true,  ultimoMensaje: '¿Cómo va el portal web?',         fecha: '10:30', noLeidos: 2 },
  { clienteId: 'cli-002', empresa: 'Tech Solutions IO', iniciales: 'TS', color: 'bg-purple-500',  online: true,  ultimoMensaje: 'Revisamos el bug del login.',      fecha: '09:15', noLeidos: 0 },
  { clienteId: 'cli-003', empresa: 'Buildex Colombia',  iniciales: 'BC', color: 'bg-emerald-500', online: false, ultimoMensaje: 'Gracias por la actualización.',    fecha: 'Ayer',  noLeidos: 0 },
  { clienteId: 'cli-004', empresa: 'Grupo Norma MX',    iniciales: 'GN', color: 'bg-amber-500',   online: false, ultimoMensaje: 'Proyecto pausado temporalmente.', fecha: 'Lun',   noLeidos: 0 },
  { clienteId: 'cli-005', empresa: 'Visión 360 España', iniciales: 'V3', color: 'bg-rose-500',    online: true,  ultimoMensaje: 'Necesitamos el dashboard listo.',  fecha: '08:50', noLeidos: 1 },
];

const historial: Record<string, Mensaje[]> = {
  'cli-001': [
    { id: 'm1', contenido: 'Buenos días, ¿cómo va el portal web?',       fecha: new Date(Date.now() - 3600000).toISOString(), autorId: 'cli-001', autorNombre: 'Acme Corp',  tipo: 'texto' },
    { id: 'm2', contenido: 'Estamos al 70%, entregamos el viernes.',      fecha: new Date(Date.now() - 1800000).toISOString(), autorId: 'usr-001', autorNombre: 'Admin',      tipo: 'texto' },
    { id: 'm3', contenido: '¿Hay alguna incidencia abierta crítica?',     fecha: new Date(Date.now() -  900000).toISOString(), autorId: 'cli-001', autorNombre: 'Acme Corp',  tipo: 'incidencia' },
  ],
  'cli-002': [
    { id: 'm4', contenido: 'El login falla en iOS 17, ¿lo revisaron?',   fecha: new Date(Date.now() - 7200000).toISOString(), autorId: 'cli-002', autorNombre: 'Tech Solutions', tipo: 'texto' },
    { id: 'm5', contenido: 'Sí, ya está en proceso. Fix listo mañana.',   fecha: new Date(Date.now() - 3600000).toISOString(), autorId: 'usr-001', autorNombre: 'Admin',          tipo: 'texto' },
  ],
  'cli-005': [
    { id: 'm6', contenido: 'Necesitamos el dashboard para la próxima semana.', fecha: new Date(Date.now() - 1800000).toISOString(), autorId: 'cli-005', autorNombre: 'Visión 360', tipo: 'proyecto' },
  ],
};

type Listener = (msg: Mensaje) => void;
const listeners: Record<string, Listener[]> = {};

export const chatService = {
  getChats(): ChatCliente[] {
    return [...MOCK_CHATS];
  },

  getHistorial(clienteId: string): Mensaje[] {
    return historial[clienteId] ?? [];
  },

  enviar(clienteId: string, contenido: string, autorId: string, autorNombre: string): Mensaje {
    const msg: Mensaje = {
      id:          `msg-${Date.now()}`,
      contenido,
      fecha:       new Date().toISOString(),
      autorId,
      autorNombre,
      tipo:        'texto',
    };
    if (!historial[clienteId]) historial[clienteId] = [];
    historial[clienteId].push(msg);
    (listeners[clienteId] ?? []).forEach((fn) => fn(msg));
    return msg;
  },

  onMensaje(clienteId: string, fn: Listener): () => void {
    if (!listeners[clienteId]) listeners[clienteId] = [];
    listeners[clienteId].push(fn);
    return () => {
      listeners[clienteId] = listeners[clienteId].filter((l) => l !== fn);
    };
  },
};
