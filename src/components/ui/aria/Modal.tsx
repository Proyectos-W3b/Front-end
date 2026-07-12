import { Modal as AriaModal, ModalOverlay, type ModalOverlayProps } from 'react-aria-components';

interface Props extends ModalOverlayProps {
  size?: 'sm' | 'md' | 'lg';
}

const WIDTHS = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

export function Modal({ size = 'md', className, ...props }: Props) {
  return (
    <ModalOverlay
      {...props}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm
        data-[entering]:animate-in data-[entering]:fade-in data-[entering]:duration-150
        data-[exiting]:animate-out data-[exiting]:fade-out"
    >
      <AriaModal
        {...props}
        className={`relative bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/5 w-full ${WIDTHS[size]} max-h-[90vh] overflow-y-auto
          data-[entering]:animate-in data-[entering]:fade-in data-[entering]:zoom-in-95 data-[entering]:duration-150
          data-[exiting]:animate-out data-[exiting]:fade-out data-[exiting]:zoom-out-95 ${className ?? ''}`}
      />
    </ModalOverlay>
  );
}
