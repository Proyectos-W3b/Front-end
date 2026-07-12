import { TextField as AriaTextField, Label, Input, TextArea, FieldError, Text, type TextFieldProps } from 'react-aria-components';

interface Props extends TextFieldProps {
  label?: string;
  placeholder?: string;
  description?: string;
  multiline?: boolean;
  rows?: number;
}

export function TextField({ label, placeholder, description, multiline, rows = 3, className, ...props }: Props) {
  return (
    <AriaTextField {...props} className={`flex flex-col ${className ?? ''}`}>
      {label && <Label className="label">{label}</Label>}
      {multiline ? (
        <TextArea placeholder={placeholder} rows={rows} className="input resize-none" />
      ) : (
        <Input placeholder={placeholder} className="input" />
      )}
      {description && <Text slot="description" className="text-xs text-slate-400 mt-1">{description}</Text>}
      <FieldError className="text-xs text-red-600 mt-1" />
    </AriaTextField>
  );
}
