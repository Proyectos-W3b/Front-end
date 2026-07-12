import { useState, useRef, useEffect, type DragEvent } from 'react';
import { Upload, FileText, FileSpreadsheet, File as FileIconLucide, X } from 'lucide-react';
import Modal from './Modal';
import type { TipoArchivo } from '../../types';

export function tipoFromFile(file: File): TipoArchivo {
  if (file.type.startsWith('image/')) return 'imagen';
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) return 'pdf';
  if (file.type.includes('word') || /\.docx?$/i.test(file.name)) return 'word';
  if (file.type.includes('sheet') || file.type.includes('excel') || /\.xlsx?$/i.test(file.name)) return 'excel';
  return 'otro';
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TIPO_ICON_STYLE: Record<TipoArchivo, { icon: typeof FileText; className: string }> = {
  imagen: { icon: FileIconLucide, className: 'text-purple-500' },
  pdf:    { icon: FileText, className: 'text-red-500' },
  word:   { icon: FileText, className: 'text-blue-500' },
  excel:  { icon: FileSpreadsheet, className: 'text-emerald-500' },
  otro:   { icon: FileIconLucide, className: 'text-slate-400' },
};

export function FileTypeIcon({ tipo, className = 'w-8 h-8' }: { tipo: TipoArchivo; className?: string }) {
  const { icon: Icon, className: colorClass } = TIPO_ICON_STYLE[tipo];
  return <Icon className={`${className} ${colorClass}`} />;
}

interface AttachFileModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

export default function AttachFileModal({
  open,
  onClose,
  onConfirm,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  maxSizeMB = 5,
}: AttachFileModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setFile(null); setError(''); setDragOver(false); }
  }, [open]);

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo supera los ${maxSizeMB}MB permitidos`);
      setFile(null);
      return;
    }
    setError('');
    setFile(f);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleConfirm = () => {
    if (!file) return;
    onConfirm(file);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Adjuntar archivo" description="Fotos, PDF, Word o Excel — máximo 5MB.">
      <div className="space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          {file ? (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <FileTypeIcon tipo={tipoFromFile(file)} />
              <p className="text-sm font-medium text-slate-800 truncate max-w-[240px]">{file.name}</p>
              <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-300" />
              <p className="text-sm text-slate-500">Arrastra un archivo aquí o haz clic para elegir</p>
              <p className="text-xs text-slate-400">Imágenes, PDF, Word, Excel</p>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn-primary" disabled={!file} onClick={handleConfirm}>Enviar</button>
        </div>
      </div>
    </Modal>
  );
}
