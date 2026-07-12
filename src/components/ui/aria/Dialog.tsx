import { Dialog as AriaDialog, Heading, type DialogProps } from 'react-aria-components';
import { X } from 'lucide-react';
import { Button } from './Button';

interface Props extends Omit<DialogProps, 'children'> {
  children: React.ReactNode;
}

export function Dialog({ className, children, ...props }: Props) {
  return (
    <AriaDialog {...props} className={`outline-none relative px-6 pt-6 pb-6 ${className ?? ''}`}>
      <Button slot="close" variant="icon" className="absolute top-5 right-5" aria-label="Cerrar">
        <X className="w-4 h-4" />
      </Button>
      {children}
    </AriaDialog>
  );
}

export { Heading };
