import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from 'lucide-react';

export default function FiltersPanel({ onClear, children }: { onClear: () => void; children: ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          Filtros
        </span>
        <div className="flex items-center gap-3">
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Limpiar
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-slate-50">
          {children}
        </div>
      )}
    </div>
  );
}
