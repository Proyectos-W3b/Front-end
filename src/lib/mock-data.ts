// ─────────────────────────────────────────────────────────────────────────────
// Datos mock para desarrollo local — sin backend
// ─────────────────────────────────────────────────────────────────────────────
import type { Project, Incidencia, Departamento, Cargo, Empleado, AsistenciaRecord } from '../types';

// ── Proyectos ─────────────────────────────────────────────────────────────────
export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', nombre: 'Portal Web Corporativo',       descripcion: 'Rediseño completo del portal web.',            estado: 'activo',     fecha: '2026-01-15', actualizado: '2026-06-10' },
  { id: 'p2', nombre: 'App Móvil Clientes',           descripcion: 'Aplicación iOS/Android para clientes.',        estado: 'activo',     fecha: '2026-02-01', actualizado: '2026-06-15' },
  { id: 'p3', nombre: 'Sistema ERP Interno',          descripcion: 'Modernización del sistema ERP.',               estado: 'completado', fecha: '2025-09-01', actualizado: '2026-03-20' },
  { id: 'p4', nombre: 'Migración a la Nube',          descripcion: 'Migración de infraestructura on-premise.',     estado: 'activo',     fecha: '2026-03-10', actualizado: '2026-06-17' },
  { id: 'p5', nombre: 'Chatbot de Soporte',           descripcion: 'Bot de IA para atención al cliente.',          estado: 'inactivo',   fecha: '2026-04-20', actualizado: '2026-05-30' },
  { id: 'p6', nombre: 'Dashboard Analytics',          descripcion: 'Panel de métricas en tiempo real.',            estado: 'activo',     fecha: '2026-05-01', actualizado: '2026-06-18' },
  { id: 'p7', nombre: 'Plataforma E-learning',        descripcion: 'LMS para capacitación interna.',               estado: 'completado', fecha: '2025-06-01', actualizado: '2026-01-15' },
];

// ── Incidencias ───────────────────────────────────────────────────────────────
export const MOCK_INCIDENTS: Incidencia[] = [
  { id: 'i1', titulo: 'Error al cargar dashboard',   descripcion: 'Falla al renderizar los gráficos.',      prioridad: 'alta',    estado: 'en_proceso', proyectoId: 'p1', createdAt: '2026-06-15', updatedAt: '2026-06-16' },
  { id: 'i2', titulo: 'Login falla en iOS 17',        descripcion: 'El token no se persiste en Safari.',     prioridad: 'critica', estado: 'abierta',    proyectoId: 'p2', createdAt: '2026-06-16', updatedAt: '2026-06-16' },
  { id: 'i3', titulo: 'Lentitud en reportes',         descripcion: 'Consulta SQL sin índice.',               prioridad: 'media',   estado: 'resuelta',   proyectoId: 'p3', createdAt: '2026-06-10', updatedAt: '2026-06-14' },
  { id: 'i4', titulo: 'Certificado SSL expirado',     descripcion: 'El certificado venció el 17/06.',        prioridad: 'critica', estado: 'resuelta',   proyectoId: 'p4', createdAt: '2026-06-17', updatedAt: '2026-06-17' },
  { id: 'i5', titulo: 'Notificaciones no llegan',     descripcion: 'El servicio de email está caído.',       prioridad: 'alta',    estado: 'abierta',    proyectoId: 'p2', createdAt: '2026-06-18', updatedAt: '2026-06-18' },
  { id: 'i6', titulo: 'Error 404 en ruta /perfil',    descripcion: 'Ruta no registrada en el router.',       prioridad: 'baja',    estado: 'cerrada',    proyectoId: 'p6', createdAt: '2026-06-05', updatedAt: '2026-06-08' },
  { id: 'i7', titulo: 'Datos duplicados en export',   descripcion: 'El CSV exporta filas repetidas.',        prioridad: 'media',   estado: 'en_proceso', proyectoId: 'p6', createdAt: '2026-06-17', updatedAt: '2026-06-18' },
];

// ── Departamentos ─────────────────────────────────────────────────────────────
export const MOCK_DEPARTAMENTOS: Departamento[] = [
  { id: 'd1', name: 'Tecnología',        description: 'Desarrollo de software y sistemas.',    isActive: true  },
  { id: 'd2', name: 'Recursos Humanos',  description: 'Gestión de talento y bienestar.',       isActive: true  },
  { id: 'd3', name: 'Comercial',         description: 'Ventas y relaciones con clientes.',     isActive: true  },
  { id: 'd4', name: 'Finanzas',          description: 'Contabilidad y tesorería.',             isActive: true  },
  { id: 'd5', name: 'Operaciones',       description: 'Logística y procesos internos.',        isActive: false },
];

// ── Cargos ────────────────────────────────────────────────────────────────────
export const MOCK_CARGOS: Cargo[] = [
  { id: 'c1', title: 'Desarrollador Senior', description: 'Liderazgo técnico.',  departmentId: 'd1', baseSalary: 5000000, maxSalary: 8000000 },
  { id: 'c2', title: 'Desarrollador Junior', description: 'Desarrollo frontend.', departmentId: 'd1', baseSalary: 2500000, maxSalary: 4000000 },
  { id: 'c3', title: 'Tech Lead',            description: 'Arquitectura.',         departmentId: 'd1', baseSalary: 7000000, maxSalary: 10000000 },
  { id: 'c4', title: 'Analista RRHH',        description: 'Selección y clima.',    departmentId: 'd2', baseSalary: 3000000, maxSalary: 5000000 },
  { id: 'c5', title: 'Ejecutivo Comercial',  description: 'Ventas B2B.',           departmentId: 'd3', baseSalary: 2800000, maxSalary: 6000000 },
  { id: 'c6', title: 'Contador',             description: 'Contabilidad general.', departmentId: 'd4', baseSalary: 3500000, maxSalary: 5500000 },
];

// ── Empleados ─────────────────────────────────────────────────────────────────
export const MOCK_EMPLEADOS: Empleado[] = [
  { id: 'e1', firstName: 'Carlos',    lastName: 'Ramírez',  email: 'carlos@empresa.com',    phone: '3001234567', gender: 'MASCULINO', hireDate: '2022-03-01', status: 'ACTIVO',      contractType: 'TIEMPO_COMPLETO', baseSalary: 6000000, departmentId: 'd1', positionId: 'c1', employeeCode: 'EMP001' },
  { id: 'e2', firstName: 'Sofía',     lastName: 'Torres',   email: 'sofia@empresa.com',     phone: '3007654321', gender: 'FEMENINO',  hireDate: '2023-01-15', status: 'ACTIVO',      contractType: 'TIEMPO_COMPLETO', baseSalary: 3500000, departmentId: 'd1', positionId: 'c2', employeeCode: 'EMP002' },
  { id: 'e3', firstName: 'Miguel',    lastName: 'Herrera',  email: 'miguel@empresa.com',    phone: '3109876543', gender: 'MASCULINO', hireDate: '2021-07-10', status: 'ACTIVO',      contractType: 'TIEMPO_COMPLETO', baseSalary: 8000000, departmentId: 'd1', positionId: 'c3', employeeCode: 'EMP003' },
  { id: 'e4', firstName: 'Laura',     lastName: 'Jiménez',  email: 'laura@empresa.com',     phone: '3152345678', gender: 'FEMENINO',  hireDate: '2023-05-20', status: 'ACTIVO',      contractType: 'MEDIO_TIEMPO',    baseSalary: 2000000, departmentId: 'd2', positionId: 'c4', employeeCode: 'EMP004' },
  { id: 'e5', firstName: 'Andrés',    lastName: 'Morales',  email: 'andres@empresa.com',    phone: '3183456789', gender: 'MASCULINO', hireDate: '2020-11-01', status: 'EN_LICENCIA', contractType: 'TIEMPO_COMPLETO', baseSalary: 4500000, departmentId: 'd3', positionId: 'c5', employeeCode: 'EMP005' },
  { id: 'e6', firstName: 'Camila',    lastName: 'Vargas',   email: 'camila@empresa.com',    phone: '3214567890', gender: 'FEMENINO',  hireDate: '2024-01-08', status: 'ACTIVO',      contractType: 'CONTRATISTA',     baseSalary: 3000000, departmentId: 'd4', positionId: 'c6', employeeCode: 'EMP006' },
  { id: 'e7', firstName: 'Diego',     lastName: 'Castro',   email: 'diego@empresa.com',     phone: '3245678901', gender: 'MASCULINO', hireDate: '2019-06-15', status: 'TERMINADO',   contractType: 'TIEMPO_COMPLETO', baseSalary: 5000000, departmentId: 'd1', positionId: 'c1', employeeCode: 'EMP007' },
];

// ── Asistencia ────────────────────────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0];
export const MOCK_ASISTENCIA: AsistenciaRecord[] = [
  { id: 'a1', employeeId: 'e1', date: today, status: 'PRESENTE', checkIn: '08:05', checkOut: '17:10', hoursWorked: 9, notes: '',  createdAt: today, updatedAt: today },
  { id: 'a2', employeeId: 'e2', date: today, status: 'PRESENTE', checkIn: '08:30', checkOut: '17:00', hoursWorked: 8, notes: '',  createdAt: today, updatedAt: today },
  { id: 'a3', employeeId: 'e3', date: today, status: 'TARDE',    checkIn: '09:45', checkOut: '18:00', hoursWorked: 8, notes: 'Tráfico', createdAt: today, updatedAt: today },
  { id: 'a4', employeeId: 'e4', date: today, status: 'AUSENTE',  checkIn: undefined, checkOut: undefined, hoursWorked: 0, notes: 'Incapacidad', createdAt: today, updatedAt: today },
  { id: 'a5', employeeId: 'e6', date: today, status: 'REMOTO',   checkIn: '08:00', checkOut: '17:00', hoursWorked: 9, notes: 'Home office', createdAt: today, updatedAt: today },
];
