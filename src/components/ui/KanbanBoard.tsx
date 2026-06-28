import { type ReactNode, useState } from 'react';

export interface KanbanColumn {
  key:         string;
  label:       string;
  headerClass: string;
  dotClass:    string;
  labelClass:  string;
  accentClass: string;
}

interface KanbanBoardProps<T extends { id: string }> {
  columns:      KanbanColumn[];
  items:        T[];
  getColumnKey: (item: T) => string;
  renderCard:   (item: T) => ReactNode;
  onMove?:      (itemId: string, newColumnKey: string) => void;
  className?:   string;
}

// Variable de módulo — nunca se pierde entre re-renders
let _draggingId: string | null = null;

export default function KanbanBoard<T extends { id: string }>({
  columns,
  items,
  getColumnKey,
  renderCard,
  onMove,
  className = '',
}: KanbanBoardProps<T>) {
  const [overCol, setOverCol] = useState<string | null>(null);

  const canDrag = !!onMove;

  return (
    <div className={`overflow-x-auto pb-2 ${className}`}>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(220px, 1fr))` }}
      >
        {columns.map((col) => {
          const colItems = items.filter((item) => getColumnKey(item) === col.key);
          const isOver   = overCol === col.key;

          return (
            <div
              key={col.key}
              className="flex flex-col gap-3 min-w-[220px]"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOverCol(col.key);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setOverCol(col.key);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setOverCol(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOverCol(null);
                const id = _draggingId ?? e.dataTransfer.getData('text/plain');
                _draggingId = null;
                if (id && onMove) onMove(id, col.key);
              }}
            >
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

              {/* Drop zone */}
              <div className={[
                'flex flex-col gap-2.5 min-h-[120px] rounded-xl p-1 transition-colors duration-150',
                isOver && canDrag ? 'bg-blue-50 ring-2 ring-blue-300 ring-dashed' : '',
              ].join(' ')}>
                {colItems.length === 0 ? (
                  <div className={[
                    'flex items-center justify-center h-20 border-2 border-dashed rounded-xl transition-colors',
                    isOver && canDrag ? 'border-blue-400 bg-blue-50 text-blue-500' : 'border-slate-100 text-slate-400',
                  ].join(' ')}>
                    <span className="text-xs font-medium">
                      {isOver && canDrag ? 'Soltar aquí' : 'Sin elementos'}
                    </span>
                  </div>
                ) : (
                  colItems.map((item) => (
                    <div
                      key={item.id}
                      draggable={canDrag}
                      onDragStart={(e) => {
                        _draggingId = item.id;
                        e.dataTransfer.setData('text/plain', item.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => {
                        _draggingId = null;
                        setOverCol(null);
                      }}
                      className={[
                        'bg-white rounded-xl border border-slate-100 border-l-4',
                        col.accentClass,
                        'shadow-[0_2px_8px_rgba(15,23,42,0.05)]',
                        'hover:shadow-[0_4px_14px_rgba(15,23,42,0.09)]',
                        'transition-all duration-200',
                        canDrag ? 'cursor-grab active:cursor-grabbing active:opacity-50 active:scale-95' : '',
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
