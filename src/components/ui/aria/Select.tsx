import {
  Select as AriaSelect, SelectValue, Label, Button, Popover, ListBox, ListBoxItem,
  type SelectProps, type ListBoxItemProps,
} from 'react-aria-components';
import { ChevronDown, Check } from 'lucide-react';

interface Props<T extends object> extends Omit<SelectProps<T>, 'children' | 'className'> {
  label?: string;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}

export function Select<T extends object>({ label, placeholder = 'Seleccionar…', className, children, ...props }: Props<T>) {
  return (
    <AriaSelect {...props} className={`flex flex-col ${className ?? ''}`}>
      {label && <Label className="label">{label}</Label>}
      <Button className="input flex items-center justify-between gap-2 text-left">
        <SelectValue className="truncate data-[placeholder]:text-slate-400">
          {({ defaultChildren }) => defaultChildren || placeholder}
        </SelectValue>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </Button>
      <Popover className="w-[--trigger-width] bg-white rounded-xl border border-slate-100 shadow-lg p-1 max-h-64 overflow-auto z-[9999]">
        <ListBox className="outline-none space-y-0.5">{children}</ListBox>
      </Popover>
    </AriaSelect>
  );
}

export function SelectItem(props: ListBoxItemProps) {
  return (
    <ListBoxItem
      {...props}
      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 cursor-pointer outline-none
        data-[focused]:bg-blue-50 data-[focused]:text-blue-700 data-[selected]:font-semibold"
    >
      {({ isSelected }) => (
        <>
          <span className="truncate">{props.children as React.ReactNode}</span>
          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
        </>
      )}
    </ListBoxItem>
  );
}
