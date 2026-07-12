import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface FormSectionProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  first?: boolean;
  children: ReactNode;
}

export default function FormSection({ icon: Icon, title, description, first = false, children }: FormSectionProps) {
  return (
    <div className={`space-y-4 ${first ? '' : 'border-t border-slate-100 pt-5'}`}>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 leading-tight">{title}</p>
          {description && <p className="text-xs text-slate-400 leading-tight">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
