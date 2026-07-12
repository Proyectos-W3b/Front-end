import type { LucideIcon } from 'lucide-react';

interface MetaChipProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export default function MetaChip({ icon: Icon, label, value }: MetaChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-xs">
      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className="text-slate-400">{label}:</span>
      <span className="font-medium text-slate-700 capitalize">{value}</span>
    </span>
  );
}
