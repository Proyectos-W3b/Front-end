import { Button as AriaButton, type ButtonProps } from 'react-aria-components';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  icon: 'text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
};

interface Props extends ButtonProps {
  variant?: keyof typeof VARIANTS;
}

export function Button({ variant = 'primary', className, ...props }: Props) {
  return <AriaButton {...props} className={`${VARIANTS[variant]} ${className ?? ''}`} />;
}
