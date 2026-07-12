import { Form as AriaForm, type FormProps } from 'react-aria-components';

export function Form({ className, ...props }: FormProps) {
  return <AriaForm {...props} className={className ?? 'space-y-4'} />;
}
