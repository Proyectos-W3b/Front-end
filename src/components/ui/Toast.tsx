import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
  leaving?: boolean;
}

interface ToastContextValue {
  toast: (variant: ToastVariant, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}

const VARIANT_STYLES: Record<ToastVariant, { icon: typeof CheckCircle2; bar: string; iconColor: string }> = {
  success: { icon: CheckCircle2, bar: 'bg-emerald-500', iconColor: 'text-emerald-500' },
  error:   { icon: XCircle,      bar: 'bg-red-500',     iconColor: 'text-red-500' },
  info:    { icon: Info,         bar: 'bg-blue-500',    iconColor: 'text-blue-500' },
};

const DURATION_MS = 3800;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    // Marca como saliente para animar, luego remueve del DOM.
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 200);
  }, []);

  const toast = useCallback((variant: ToastVariant, title: string, description?: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev.slice(-3), { id, variant, title, description }]);
    setTimeout(() => dismiss(id), DURATION_MS);
  }, [dismiss]);

  const value: ToastContextValue = {
    toast,
    success: (t, d) => toast('success', t, d),
    error:   (t, d) => toast('error', t, d),
    info:    (t, d) => toast('info', t, d),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed bottom-5 right-5 z-[10000] flex flex-col gap-2 w-[340px] max-w-[calc(100vw-40px)] pointer-events-none">
          {toasts.map(({ id, variant, title, description, leaving }) => {
            const { icon: Icon, bar, iconColor } = VARIANT_STYLES[variant];
            return (
              <div
                key={id}
                role="status"
                className={[
                  'pointer-events-auto relative overflow-hidden bg-white rounded-xl border border-slate-100',
                  'shadow-[0_8px_30px_rgba(15,23,42,0.12)] flex items-start gap-3 pl-4 pr-3 py-3',
                  leaving
                    ? 'animate-out fade-out slide-out-to-right-4 duration-200'
                    : 'animate-in fade-in slide-in-from-bottom-3 duration-300',
                ].join(' ')}
              >
                <span className={`absolute left-0 top-0 bottom-0 w-1 ${bar}`} />
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{title}</p>
                  {description && <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>}
                </div>
                <button
                  onClick={() => dismiss(id)}
                  className="p-1 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
                  aria-label="Cerrar aviso"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
