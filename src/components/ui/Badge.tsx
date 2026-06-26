const COLORS: Record<string, string> = {
  // proyecto
  activo:      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70',
  inactivo:    'bg-slate-100 text-slate-600 ring-1 ring-slate-200/70',
  completado:  'bg-blue-50 text-blue-700 ring-1 ring-blue-200/70',
  // incidencia estado
  abierta:     'bg-orange-50 text-orange-700 ring-1 ring-orange-200/70',
  en_proceso:  'bg-amber-50 text-amber-700 ring-1 ring-amber-200/70',
  resuelta:    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70',
  cerrada:     'bg-slate-100 text-slate-500 ring-1 ring-slate-200/70',
  // incidencia prioridad
  baja:        'bg-sky-50 text-sky-700 ring-1 ring-sky-200/70',
  media:       'bg-amber-50 text-amber-700 ring-1 ring-amber-200/70',
  alta:        'bg-orange-50 text-orange-700 ring-1 ring-orange-200/70',
  critica:     'bg-red-50 text-red-700 ring-1 ring-red-200/70',
  // empleado
  ACTIVO:      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70',
  INACTIVO:    'bg-slate-100 text-slate-500 ring-1 ring-slate-200/70',
  EN_LICENCIA: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200/70',
  TERMINADO:   'bg-red-50 text-red-600 ring-1 ring-red-200/70',
  // asistencia
  PRESENTE:    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70',
  AUSENTE:     'bg-red-50 text-red-600 ring-1 ring-red-200/70',
  TARDE:       'bg-amber-50 text-amber-700 ring-1 ring-amber-200/70',
  MEDIO_DIA:   'bg-orange-50 text-orange-700 ring-1 ring-orange-200/70',
  FERIADO:     'bg-blue-50 text-blue-600 ring-1 ring-blue-200/70',
  REMOTO:      'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/70',
};

interface BadgeProps {
  value: string;
  label?: string;
}

export default function Badge({ value, label }: BadgeProps) {
  const cls = COLORS[value] ?? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/70';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 shrink-0" />
      {label ?? value}
    </span>
  );
}
