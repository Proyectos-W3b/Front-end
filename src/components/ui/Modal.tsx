import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`relative bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/5 w-full ${widths[size]} max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150`}>
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 pt-6 pb-2">
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight pr-8">{title}</h2>
          {description && (
            <p className="text-sm text-slate-500 mt-1.5">{description}</p>
          )}
        </div>

        <div className="px-6 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
}
