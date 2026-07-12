import {
  LayoutDashboard, FolderOpen, AlertTriangle,
  Users, Globe, HardHat, MessageSquare, UserCircle, UserCog,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AppModule {
  id:       string;
  name:     string;
  path:     string;
  icon:     LucideIcon;
  roles:    string[];
  exact?:   boolean;
  external?: boolean;
}

export interface ModuleCategory {
  id:      string;
  title:   string;
  icon:    LucideIcon;
  roles:   string[];
  modules: AppModule[];
}

export const moduleCategories: ModuleCategory[] = [
  // ── Vista admin ────────────────────────────────────────────────────────────
  {
    id: 'general', title: 'General', icon: Globe,
    roles: ['admin'],
    modules: [
      { id: 'projects',  name: 'Proyectos',   path: '/projects',  icon: FolderOpen,   roles: ['admin'] },
      { id: 'incidents', name: 'Incidencias', path: '/incidents', icon: AlertTriangle, roles: ['admin'] },
    ],
  },
  {
    id: 'clientes', title: 'Clientes', icon: Users,
    roles: ['admin'],
    modules: [
      { id: 'clientes',      name: 'Clientes',      path: '/clientes',      icon: Users,         roles: ['admin'] },
      { id: 'clientes-chat', name: 'Chat Clientes', path: '/clientes/chat', icon: MessageSquare, roles: ['admin'] },
    ],
  },
  {
    id: 'rrhh', title: 'Recursos Humanos', icon: HardHat,
    roles: ['admin'],
    modules: [
      { id: 'trabajadores', name: 'Trabajadores', path: '/trabajadores', icon: HardHat, roles: ['admin'] },
    ],
  },
  {
    id: 'administracion', title: 'Administración', icon: UserCog,
    roles: ['admin'],
    modules: [
      { id: 'usuarios', name: 'Usuarios', path: '/usuarios', icon: UserCog, roles: ['admin'] },
    ],
  },

  // ── Vista trabajador ───────────────────────────────────────────────────────
  {
    id: 'trabajador-general', title: 'General', icon: Globe,
    roles: ['trabajador'],
    modules: [
      { id: 'projects',  name: 'Mis Proyectos',   path: '/projects',  icon: FolderOpen,    roles: ['trabajador'] },
      { id: 'incidents', name: 'Mis Incidencias', path: '/incidents', icon: AlertTriangle, roles: ['trabajador'] },
    ],
  },

  // ── Vista cliente ──────────────────────────────────────────────────────────
  {
    id: 'cliente-general', title: 'General', icon: Globe,
    roles: ['cliente'],
    modules: [
      { id: 'dashboard', name: 'Dashboard',     path: '/dashboard', icon: LayoutDashboard, roles: ['cliente'], exact: true },
      { id: 'projects',  name: 'Mis Proyectos', path: '/projects',  icon: FolderOpen,      roles: ['cliente'] },
      { id: 'incidents', name: 'Incidencias',   path: '/incidents', icon: AlertTriangle,   roles: ['cliente'] },
    ],
  },
  {
    id: 'cliente-mensajes', title: 'Mensajes', icon: MessageSquare,
    roles: ['cliente'],
    modules: [
      { id: 'chat', name: 'Chat', path: '/clientes/chat', icon: MessageSquare, roles: ['cliente'] },
    ],
  },
  {
    id: 'cliente-perfil', title: 'Mi Cuenta', icon: UserCircle,
    roles: ['cliente'],
    modules: [
      { id: 'mi-perfil', name: 'Mi Perfil', path: '/clientes', icon: UserCircle, roles: ['cliente'] },
    ],
  },
];
