import { type DragEvent, type ReactNode, useState } from 'react';
import { Inbox } from 'lucide-react';

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

/* ── Encabezado de columna ─────────────────────────────────────────────── */
function ColumnHeader({ col, count }: { col: KanbanColumn; count: number }) {
  return (
    <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${col.headerClass}`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${col.dotClass}`} />
        <span className={`text-[11px] font-bold uppercase tracking-wider ${col.labelClass}`}>{col.label}</span>
      </div>
      <span className={`text-xs font-bold ${col.labelClass} bg-white/70 px-2 py-0.5 rounded-full tabular-nums`}>
        {count}
      </span>
    </div>
  );
}

/* ── Zona vacía / destino de soltado ───────────────────────────────────── */
function EmptySlot({ active }: { active: boolean }) {
  return (
    <div className={[
      'flex flex-col items-center justify-center gap-1.5 h-24 border-2 border-dashed rounded-xl transition-colors',
      active ? 'border-blue-400 bg-blue-50 text-blue-500' : 'border-slate-200/70 text-slate-300',
    ].join(' ')}>
      <Inbox className="w-4 h-4" />
      <span className="text-xs font-medium">{active ? 'Soltar aquí' : 'Sin elementos'}</span>
    </div>
  );
}

/* ── Tarjeta arrastrable ───────────────────────────────────────────────── */
function KanbanCard({
  id, accentClass, index, draggable, onDragEnd, children,
}: {
  id: string;
  accentClass: string;
  index: number;
  draggable: boolean;
  onDragEnd: () => void;
  children: ReactNode;
}) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    _draggingId = id;
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
      className={[
        'animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-300',
        'bg-white rounded-xl border border-slate-100 border-l-4',
        accentClass,
        'shadow-[0_2px_8px_rgba(15,23,42,0.05)]',
        'hover:shadow-[0_6px_18px_rgba(15,23,42,0.10)] hover:-translate-y-0.5',
        'transition-all duration-200',
        draggable ? 'cursor-grab active:cursor-grabbing active:opacity-60 active:scale-[.97] active:rotate-1' : '',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

/* ── Tablero ───────────────────────────────────────────────────────────── */
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

  const handleDrop = (e: DragEvent<HTMLDivElement>, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOverCol(null);
    const id = _draggingId ?? e.dataTransfer.getData('text/plain');
    _draggingId = null;
    if (id && onMove) onMove(id, colKey);
  };

  return (
    <div className={`overflow-x-auto pb-2 ${className}`}>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(230px, 1fr))` }}
      >
        {columns.map((col) => {
          const colItems = items.filter((item) => getColumnKey(item) === col.key);
          const isOver   = overCol === col.key && canDrag;

          return (
            <div
              key={col.key}
              className="flex flex-col gap-2.5 min-w-[230px]"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setOverCol(col.key); }}
              onDragEnter={(e) => { e.preventDefault(); setOverCol(col.key); }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverCol(null);
              }}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <ColumnHeader col={col} count={colItems.length} />

              {/* Carril: superficie propia para que la columna se lea como una unidad */}
              <div className={[
                'flex flex-col gap-2.5 flex-1 min-h-[140px] rounded-2xl p-2 transition-all duration-150',
                isOver
                  ? 'bg-blue-50/80 ring-2 ring-blue-300 ring-dashed'
                  : 'bg-slate-100/50',
              ].join(' ')}>
                {colItems.length === 0 ? (
                  <EmptySlot active={isOver} />
                ) : (
                  colItems.map((item, idx) => (
                    <KanbanCard
                      key={item.id}
                      id={item.id}
                      index={idx}
                      accentClass={col.accentClass}
                      draggable={canDrag}
                      onDragEnd={() => { _draggingId = null; setOverCol(null); }}
                    >
                      {renderCard(item)}
                    </KanbanCard>
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
