import type { ReactNode } from 'react';

export interface KanbanColumn {
  key:         string;
  label:       string;
  headerClass: string;  // bg + border del encabezado de columna
  dotClass:    string;  // bg del punto de color
  labelClass:  string;  // color del texto del encabezado
  accentClass: string;  // border-l-* de cada tarjeta
}

interface KanbanBoardProps<T extends { id: string }> {
  columns:      KanbanColumn[];
  items:        T[];
  getColumnKey: (item: T) => string;
  renderCard:   (item: T) => ReactNode;
  className?:   string;
}

export default function KanbanBoard<T extends { id: string }>({
  columns,
  items,
  getColumnKey,
  renderCard,
  className = '',
}: KanbanBoardProps<T>) {
  return (
    <div className={`overflow-x-auto pb-2 ${className}`}>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(220px, 1fr))` }}
      >
        {columns.map((col) => {
          const colItems = items.filter((item) => getColumnKey(item) === col.key);

          return (
            <div key={col.key} className="flex flex-col gap-3 min-w-[220px]">

              {/* Column header */}
              <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${col.headerClass}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotClass}`} />
                  <span className={`text-xs font-semibold ${col.labelClass}`}>{col.label}</span>
                </div>
                <span className={`text-xs font-bold ${col.labelClass} bg-white/70 px-2 py-0.5 rounded-full tabular-nums`}>
                  {colItems.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2.5 min-h-[100px]">
                {colItems.length === 0 ? (
                  <div className="flex items-center justify-center h-20 border-2 border-dashed border-slate-100 rounded-xl">
                    <span className="text-xs text-slate-400">Sin elementos</span>
                  </div>
                ) : (
                  colItems.map((item) => (
                    <div
                      key={item.id}
                      className={[
                        'bg-white rounded-xl border border-slate-100 border-l-4',
                        col.accentClass,
                        'shadow-[0_2px_8px_rgba(15,23,42,0.05)]',
                        'hover:shadow-[0_4px_14px_rgba(15,23,42,0.09)]',
                        'transition-shadow duration-200',
                      ].join(' ')}
                    >
                      {renderCard(item)}
                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
