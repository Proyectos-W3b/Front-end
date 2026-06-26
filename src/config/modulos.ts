import {
  LayoutDashboard, FolderOpen, AlertTriangle,
  Users, Globe, HardHat, MessageSquare,
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
  {
    id: 'general', title: 'General', icon: Globe,
    roles: ['admin', 'cliente'],
    modules: [
      { id: 'dashboard', name: 'Dashboard',   path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'cliente'], exact: true },
      { id: 'projects',  name: 'Proyectos',   path: '/projects',  icon: FolderOpen,      roles: ['admin', 'cliente'] },
      { id: 'incidents', name: 'Incidencias', path: '/incidents', icon: AlertTriangle,   roles: ['admin', 'cliente'] },
    ],
  },
  {
    id: 'clientes', title: 'Clientes', icon: Users,
    roles: ['admin', 'cliente'],
    modules: [
      { id: 'clientes',      name: 'Clientes',       path: '/clientes',      icon: Users,          roles: ['admin', 'cliente'] },
      { id: 'clientes-chat', name: 'Chat Clientes',  path: '/clientes/chat', icon: MessageSquare,  roles: ['admin', 'manager'] },
    ],
  },
  {
    id: 'rrhh', title: 'Recursos Humanos', icon: HardHat,
    roles: ['admin', 'manager'],
    modules: [
      { id: 'trabajadores', name: 'Trabajadores', path: '/trabajadores', icon: HardHat, roles: ['admin', 'manager'] },
    ],
  },
];
