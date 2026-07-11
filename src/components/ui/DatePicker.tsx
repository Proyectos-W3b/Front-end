import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  disabled?: boolean;
}

export default function DatePicker({ value, onChange, placeholder = 'Selecciona una fecha', required, min, disabled }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selected = value && isValid(parseISO(value)) ? parseISO(value) : undefined;
  const minDate  = min && isValid(parseISO(min)) ? parseISO(min) : undefined;

  const updateCoords = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const popoverWidth  = 300;
    const popoverHeight = 380; // estimado (4 a 6 filas de semanas + encabezado)

    // Si no cabe a la derecha, se alinea al borde derecho en vez de desbordar la pantalla.
    const left = Math.max(Math.min(rect.left, window.innerWidth - popoverWidth - 12), 12);

    // Si no cabe abajo pero sí arriba, se abre hacia arriba en vez de cortarse.
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < popoverHeight + 12 && rect.top > popoverHeight + 12;
    const top = openUpward ? rect.top - popoverHeight - 6 : rect.bottom + 6;

    setCoords({ top: Math.max(top, 12), left, width: rect.width });
  };

  useLayoutEffect(() => {
    if (open) updateCoords();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    const reposition = () => updateCoords();
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>
          {selected ? format(selected, "d 'de' MMMM 'de' yyyy", { locale: es }) : placeholder}
        </span>
        <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {required && (
        <input tabIndex={-1} className="sr-only" required value={value ?? ''} onChange={() => {}} />
      )}

      {open && createPortal(
        <div
          ref={popoverRef}
          style={{ position: 'fixed', top: coords.top, left: coords.left, width: 300 }}
          className="z-[9999] bg-white rounded-xl border border-slate-100 shadow-[0_12px_40px_rgba(15,23,42,0.18)] p-3"
        >
          <DayPicker
            mode="single"
            locale={es}
            selected={selected}
            defaultMonth={selected}
            disabled={minDate ? { before: minDate } : undefined}
            onSelect={(date) => {
              if (date) onChange(format(date, 'yyyy-MM-dd'));
              setOpen(false);
            }}
            classNames={{
              months: 'flex flex-col',
              month: 'space-y-3',
              month_caption: 'flex justify-center items-center h-8 relative',
              caption_label: 'text-sm font-semibold text-slate-800',
              nav: 'flex items-center justify-between absolute inset-x-0 top-0 h-8',
              button_previous: 'p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors',
              button_next: 'p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors',
              chevron: 'w-4 h-4 fill-current',
              month_grid: 'w-full border-collapse',
              weekdays: 'flex',
              weekday: 'w-8 h-8 text-[11px] font-medium text-slate-400 flex items-center justify-center',
              week: 'flex',
              day: 'w-8 h-8 text-center align-middle p-0',
              day_button: 'w-8 h-8 rounded-lg text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors',
              today: '[&>button]:font-bold [&>button]:text-blue-600',
              selected: '[&>button]:bg-blue-600 [&>button]:text-white [&>button]:hover:bg-blue-700',
              outside: '[&>button]:text-slate-300',
              disabled: '[&>button]:text-slate-200 [&>button]:hover:bg-transparent [&>button]:cursor-not-allowed',
            }}
          />
        </div>,
        document.body,
      )}
    </>
  );
}
