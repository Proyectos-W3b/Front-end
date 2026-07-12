import type { LucideIcon } from 'lucide-react';

export type StatAccent = 'slate' | 'blue' | 'emerald' | 'orange' | 'red' | 'amber';

const ACCENTS: Record<StatAccent, { iconBg: string; iconText: string; value: string }> = {
  slate:   { iconBg: 'bg-slate-100',   iconText: 'text-slate-500',   value: 'text-slate-900'   },
  blue:    { iconBg: 'bg-blue-50',     iconText: 'text-blue-600',    value: 'text-blue-700'    },
  emerald: { iconBg: 'bg-emerald-50',  iconText: 'text-emerald-600', value: 'text-emerald-700' },
  orange:  { iconBg: 'bg-orange-50',   iconText: 'text-orange-500',  value: 'text-orange-600'  },
  red:     { iconBg: 'bg-red-50',      iconText: 'text-red-500',     value: 'text-red-600'     },
  amber:   { iconBg: 'bg-amber-50',    iconText: 'text-amber-500',   value: 'text-amber-600'   },
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accent?: StatAccent;
}

export default function StatCard({ icon: Icon, label, value, hint, accent = 'slate' }: StatCardProps) {
  const c = ACCENTS[accent];
  return (
    <div className="bg-white rounded-xl border border-slate-100 px-4 py-3.5 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${c.iconText}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">{label}</p>
        <p className={`${String(value).length > 10 ? 'text-sm font-semibold' : 'text-lg font-bold'} tabular-nums leading-tight ${c.value}`}>
          {value}
        </p>
        {hint && <p className="text-[10px] text-slate-400 truncate">{hint}</p>}
      </div>
    </div>
  );
}
